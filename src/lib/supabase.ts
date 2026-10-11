import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('your-supabase-url') &&
    !supabaseKey.includes('your-supabase-anon-key')
  );
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  }
  return supabaseInstance;
};

// Resilient local file & memory storage (persists across warm serverless functions)
const TMP_ORDERS_FILE = path.join(os.tmpdir(), 'dawat_orders_cache.json');
const TMP_STATUS_FILE = path.join(os.tmpdir(), 'dawat_status_overrides.json');

let inMemoryOrders: any[] = [];
const statusOverrides = new Map<string, string>();

// Load persisted status overrides from disk
function loadStatusOverrides() {
  try {
    if (fs.existsSync(TMP_STATUS_FILE)) {
      const data = fs.readFileSync(TMP_STATUS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        Object.entries(parsed).forEach(([key, val]) => {
          if (typeof val === 'string') {
            statusOverrides.set(key.toLowerCase(), val);
          }
        });
      }
    }
  } catch (e) {}
}
loadStatusOverrides();

function saveStatusOverrides() {
  try {
    const obj: Record<string, string> = {};
    statusOverrides.forEach((val, key) => {
      obj[key] = val;
    });
    fs.writeFileSync(TMP_STATUS_FILE, JSON.stringify(obj), 'utf8');
  } catch (e) {}
}

/**
 * Deduplicates orders by order_number or id, and applies any saved status overrides
 */
function deduplicateAndApplyOverrides(orders: any[]): any[] {
  const map = new Map<string, any>();

  for (const ord of orders) {
    if (!ord) continue;
    const key = (ord.order_number || ord.id || '').toString().toLowerCase().trim();
    if (!key) continue;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...ord });
    } else {
      // Merge all fields so prices, items, and customer info are NEVER lost
      const mergedOrder = {
        ...ord,
        ...existing,
        customer_name: existing.customer_name || ord.customer_name,
        customer_phone: existing.customer_phone || ord.customer_phone,
        customer_address: existing.customer_address || ord.customer_address,
        customer_email: existing.customer_email || ord.customer_email,
        notes: existing.notes || ord.notes,
        created_at: existing.created_at || ord.created_at,
        items: (existing.items && Array.isArray(existing.items) && existing.items.length > 0)
          ? existing.items
          : (ord.items || []),
        total_price: Number(existing.total_price || 0) > 0
          ? Number(existing.total_price)
          : Number(ord.total_price || 0),
        status: existing.status && existing.status !== 'Pending' ? existing.status : (ord.status || 'Pending'),
      };
      map.set(key, mergedOrder);
    }
  }

  // Apply explicit status overrides
  const result: any[] = [];
  map.forEach((ord, key) => {
    const override = statusOverrides.get(key) || (ord.id ? statusOverrides.get(String(ord.id).toLowerCase()) : null);
    if (override) {
      ord.status = override;
    }
    // Guarantee numeric total_price if missing
    if ((!ord.total_price || Number(ord.total_price) === 0) && Array.isArray(ord.items) && ord.items.length > 0) {
      ord.total_price = ord.items.reduce((sum: number, it: any) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
    }
    result.push(ord);
  });

  // Sort descending by created_at
  result.sort((a, b) => {
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateB - dateA;
  });

  return result;
}

function getStoredOrders(): any[] {
  let diskOrders: any[] = [];
  try {
    if (fs.existsSync(TMP_ORDERS_FILE)) {
      const data = fs.readFileSync(TMP_ORDERS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        diskOrders = parsed;
      }
    }
  } catch (e) {}

  loadStatusOverrides();
  const merged = [...diskOrders, ...inMemoryOrders];
  const deduped = deduplicateAndApplyOverrides(merged);
  inMemoryOrders = deduped;
  return deduped;
}

function saveStoredOrders(orders: any[]) {
  const deduped = deduplicateAndApplyOverrides(orders);
  inMemoryOrders = deduped;
  try {
    fs.writeFileSync(TMP_ORDERS_FILE, JSON.stringify(deduped), 'utf8');
  } catch (e) {}
}

export interface SupabaseOrderInsertPayload {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_email?: string;
  items: any;
  total_price: number;
  status?: string;
  notes?: string;
}

/**
 * Saves order to Supabase 'orders' table.
 * Default status is always guaranteed to be 'Pending'.
 */
export async function insertOrder(orderData: SupabaseOrderInsertPayload) {
  const finalPayload = {
    order_number: orderData.order_number,
    customer_name: orderData.customer_name.trim(),
    customer_phone: orderData.customer_phone.trim(),
    customer_address: orderData.customer_address.trim(),
    customer_email: orderData.customer_email?.trim() || null,
    items: orderData.items,
    total_price: Number(orderData.total_price),
    status: 'Pending', // Enforce default status of any new order to "Pending"
    notes: orderData.notes || null,
    created_at: new Date().toISOString(),
  };

  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('orders')
        .insert([finalPayload])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(error.message);
      }

      // Also keep a copy in local cache for speed and resilience
      const existing = getStoredOrders();
      existing.unshift(data);
      saveStoredOrders(existing);

      return {
        success: true,
        data,
        mode: 'database' as const,
      };
    } catch (err: any) {
      console.warn('Falling back to local cache due to Supabase error:', err.message);
      const fallbackRecord = {
        id: `mock-${Date.now()}`,
        ...finalPayload,
      };
      const existing = getStoredOrders();
      existing.unshift(fallbackRecord);
      saveStoredOrders(existing);

      return {
        success: true,
        data: fallbackRecord,
        mode: 'fallback_demo' as const,
        warning: `Database operation encountered: ${err.message}. Stored in session fallback.`,
      };
    }
  }

  // Demo / local fallback when environment credentials are not yet supplied
  const fallbackRecord = {
    id: `local-${Date.now()}`,
    ...finalPayload,
  };
  const existing = getStoredOrders();
  existing.unshift(fallbackRecord);
  saveStoredOrders(existing);

  return {
    success: true,
    data: fallbackRecord,
    mode: 'fallback_demo' as const,
    warning: 'Supabase URL/Key not configured in .env.local. Order saved in demo storage.',
  };
}

/**
 * Retrieves recent orders for real-time order history tracking
 */
export async function getRecentOrders(limit: number = 30) {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        const withOverrides = deduplicateAndApplyOverrides(data);
        return { data: withOverrides.slice(0, limit), source: 'supabase' as const };
      }
    } catch (e) {
      // ignore and fallback
    }
  }

  const orders = getStoredOrders();
  return { data: orders.slice(0, limit), source: 'local_cache' as const };
}

/**
 * Finds an order by its tracking number (e.g. DW-784291) or UUID id
 */
export async function getOrderByTrackingId(trackingId: string) {
  const cleanId = trackingId.trim();
  const lowerId = cleanId.toLowerCase();
  const client = getSupabaseClient();

  if (client) {
    try {
      // Try searching by order_number first
      const { data: byNum, error: errNum } = await client
        .from('orders')
        .select('*')
        .ilike('order_number', cleanId)
        .maybeSingle();

      if (byNum) {
        const override = statusOverrides.get(lowerId);
        if (override) byNum.status = override;
        return { order: byNum, source: 'supabase' as const };
      }

      // Try searching by id
      const { data: byId, error: errId } = await client
        .from('orders')
        .select('*')
        .eq('id', cleanId)
        .maybeSingle();

      if (byId) {
        const override = statusOverrides.get(lowerId);
        if (override) byId.status = override;
        return { order: byId, source: 'supabase' as const };
      }
    } catch (err) {
      console.warn('Error querying Supabase by tracking id:', err);
    }
  }

  // Fallback memory & disk search
  const orders = getStoredOrders();
  const found = orders.find(
    (o) =>
      o.order_number?.toLowerCase() === lowerId ||
      String(o.id).toLowerCase() === lowerId
  );

  if (found) {
    const override = statusOverrides.get(lowerId);
    if (override) found.status = override;
    return { order: found, source: 'local_cache' as const };
  }

  return { order: null, source: 'local_cache' as const };
}

/**
 * Updates an order status (Pending -> Cooking in Kitchen -> Ready for Pickup -> Out for Delivery -> Delivered)
 */
export async function updateOrderStatus(
  trackingId: string,
  newStatus: string,
  orderData?: any
): Promise<{ success: boolean; order?: any; source?: string; error?: string }> {
  const cleanId = trackingId.trim();
  const lowerId = cleanId.toLowerCase();

  // 1. Immediately store the override in memory & disk so it can NEVER revert
  statusOverrides.set(lowerId, newStatus);
  saveStatusOverrides();

  const client = getSupabaseClient();
  let dbUpdatedOrder: any = null;

  if (client) {
    try {
      const { data, error } = await client
        .from('orders')
        .update({ status: newStatus })
        .or(`order_number.eq.${cleanId},id.eq.${cleanId}`)
        .select()
        .single();

      if (!error && data) {
        dbUpdatedOrder = data;
      }
    } catch (err) {
      console.warn('Error updating Supabase order status:', err);
    }
  }

  // 2. Synchronize all matching records in local storage
  const orders = getStoredOrders();
  let matchedOrder: any = null;

  orders.forEach((o) => {
    if (
      o.order_number?.toLowerCase() === lowerId ||
      String(o.id).toLowerCase() === lowerId
    ) {
      o.status = newStatus;
      o.updated_at = new Date().toISOString();
      if (orderData) {
        if ((!o.total_price || Number(o.total_price) === 0) && orderData.total_price) {
          o.total_price = Number(orderData.total_price);
        }
        if ((!o.items || o.items.length === 0) && orderData.items) o.items = orderData.items;
        if (!o.customer_name && orderData.customer_name) o.customer_name = orderData.customer_name;
        if (!o.customer_phone && orderData.customer_phone) o.customer_phone = orderData.customer_phone;
        if (!o.customer_address && orderData.customer_address) o.customer_address = orderData.customer_address;
      }
      if (!matchedOrder) matchedOrder = o;
    }
  });

  if (dbUpdatedOrder) {
    saveStoredOrders(orders);
    return { success: true, order: dbUpdatedOrder, source: 'supabase' as const };
  }

  if (matchedOrder) {
    saveStoredOrders(orders);
    return { success: true, order: matchedOrder, source: 'local_cache' as const };
  }

  // If not found in this container, create a complete order with orderData
  const newRecord = {
    id: orderData?.id || `ord-${cleanId}`,
    order_number: cleanId,
    customer_name: orderData?.customer_name || 'Customer',
    customer_phone: orderData?.customer_phone || '',
    customer_address: orderData?.customer_address || '',
    customer_email: orderData?.customer_email || null,
    items: orderData?.items || [],
    total_price: Number(orderData?.total_price || 0),
    status: newStatus,
    notes: orderData?.notes || null,
    created_at: orderData?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  orders.unshift(newRecord);
  saveStoredOrders(orders);

  return { success: true, order: newRecord, source: 'local_cache' as const };
}
