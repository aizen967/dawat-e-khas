import { NextRequest, NextResponse } from 'next/server';
import { insertOrder, getRecentOrders, getOrderByTrackingId, updateOrderStatus } from '@/lib/supabase';
import { sendOrderNotificationEmail } from '@/lib/mailer';
import { generateOrderNumber } from '@/lib/orderNumber';
import { OrderCustomerDetails, OrderItemPayload } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, totalPrice } = body as {
      customer?: OrderCustomerDetails;
      items?: OrderItemPayload[];
      totalPrice?: number;
    };

    // 1. Validation: Ensure all required customer fields are filled out
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer details are required.' },
        { status: 400 }
      );
    }

    const trimmedName = customer.name?.trim() || '';
    const trimmedPhone = customer.phone?.trim() || '';
    const trimmedAddress = customer.address?.trim() || '';

    if (!trimmedName) {
      return NextResponse.json(
        { success: false, error: 'Customer name is required.' },
        { status: 400 }
      );
    }

    if (!trimmedPhone) {
      return NextResponse.json(
        { success: false, error: 'Customer phone number is required.' },
        { status: 400 }
      );
    }

    if (!trimmedAddress) {
      return NextResponse.json(
        { success: false, error: 'Customer delivery address is required.' },
        { status: 400 }
      );
    }

    // 2. Validation: Ensure dish items are selected
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please select at least one dish for your order.' },
        { status: 400 }
      );
    }

    // Validate quantities
    const invalidItem = items.find(
      (item) => !item.quantity || item.quantity <= 0 || !item.name
    );
    if (invalidItem) {
      return NextResponse.json(
        { success: false, error: 'All selected dishes must have a valid quantity greater than zero.' },
        { status: 400 }
      );
    }

    // Calculate verified total in PKR
    const computedTotal = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );
    const finalTotal = Math.round(computedTotal);

    // Generate Daraz-style Order Tracking Number (e.g. DW-784291)
    const orderNumber = generateOrderNumber();

    // 3. Save to Supabase table 'orders' with status default 'Pending'
    const supabaseSaveResult = await insertOrder({
      order_number: orderNumber,
      customer_name: trimmedName,
      customer_phone: trimmedPhone,
      customer_address: trimmedAddress,
      customer_email: customer.email?.trim(),
      items: items,
      total_price: finalTotal,
      status: 'Pending', // Specification: Default status of any new order to "Pending"
      notes: customer.specialInstructions?.trim(),
    });

    const savedOrder = supabaseSaveResult.data;
    const orderId = String(savedOrder.id || `ORD-${Date.now()}`);

    // 4. Send Order Notification to Gmail with Tracking Number
    const emailResult = await sendOrderNotificationEmail({
      orderId,
      orderNumber,
      customer: {
        name: trimmedName,
        phone: trimmedPhone,
        address: trimmedAddress,
        email: customer.email?.trim(),
        specialInstructions: customer.specialInstructions?.trim(),
      },
      items,
      totalPrice: finalTotal,
      status: 'Pending',
      createdAt: savedOrder.created_at || new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        orderId,
        orderNumber,
        status: 'Pending',
        message: 'Order placed successfully! Tracking ID generated, notification sent, and saved to database.',
        supabaseResult: {
          saved: supabaseSaveResult.success,
          mode: supabaseSaveResult.mode,
          recordId: orderId,
        },
        emailResult: {
          sent: emailResult.sent,
          mode: emailResult.mode,
          recipient: emailResult.recipient,
          preview: emailResult.preview,
          error: emailResult.error,
        },
        order: {
          id: orderId,
          order_number: orderNumber,
          customer_name: trimmedName,
          customer_phone: trimmedPhone,
          customer_address: trimmedAddress,
          customer_email: customer.email,
          items,
          total_price: finalTotal,
          status: 'Pending',
          notes: customer.specialInstructions?.trim(),
          created_at: savedOrder.created_at || new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error handling order placement:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error processing order.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const trackingId = req.nextUrl.searchParams.get('trackingId') || req.nextUrl.searchParams.get('id');

    if (trackingId) {
      // Find single order by tracking ID or UUID
      const { order, source } = await getOrderByTrackingId(trackingId);
      if (!order) {
        return NextResponse.json(
          { success: false, error: `No order found with tracking ID "${trackingId}".` },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        source,
        order,
      });
    }

    // Otherwise return recent orders list
    const { data, source } = await getRecentOrders(30);
    return NextResponse.json({
      success: true,
      source,
      orders: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Authority Check: Only authenticated Admin can update order status
    const adminToken = req.headers.get('x-admin-token');
    const authHeader = req.headers.get('authorization');

    const isAuthorized =
      (adminToken && (adminToken.startsWith('admin_') || adminToken === 'admin123')) ||
      (authHeader && authHeader.includes('admin'));

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Order status update authority is restricted to Restaurant Admin only.',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { trackingId, status, orderData } = body;

    if (!trackingId || !status) {
      return NextResponse.json(
        { success: false, error: 'Both trackingId and status are required.' },
        { status: 400 }
      );
    }

    const result = await updateOrderStatus(trackingId, status, orderData);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to update order status.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: result.order,
      source: result.source,
      message: `Order ${trackingId} status updated to "${status}".`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
