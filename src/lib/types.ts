export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Biryani & Rice' | 'Karahi & Handi' | 'BBQ & Kebabs' | 'Traditional Gravies' | 'Tandoor & Breads' | 'Desserts & Drinks';
  image: string;
  badge?: string;
  prepTime: string;
  rating: number;
  tags?: string[];
}

export interface CartItem {
  dish: Dish;
  quantity: number;
}

export interface OrderCustomerDetails {
  name: string;
  phone: string;
  address: string;
  email?: string;
  specialInstructions?: string;
}

export interface OrderItemPayload {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  itemTotal: number;
}

export interface OrderRequest {
  customer: OrderCustomerDetails;
  items: OrderItemPayload[];
  totalPrice: number;
  orderNumber?: string;
}

export type OrderStatusType =
  | 'Pending'
  | 'Cooking in Kitchen'
  | 'Ready for Pickup'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderResponse {
  success: boolean;
  orderId: string;
  orderNumber: string;
  status: string;
  message: string;
  supabaseResult: {
    saved: boolean;
    mode: 'database' | 'fallback_demo';
    error?: string;
  };
  emailResult: {
    sent: boolean;
    mode: 'smtp_sent' | 'fallback_simulated';
    recipient: string;
    error?: string;
    preview?: string;
  };
  order: {
    id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    customer_email?: string;
    items: OrderItemPayload[];
    total_price: number;
    status: string;
    notes?: string;
    created_at: string;
  };
}

export interface OrderTrackingStep {
  step: number;
  status: OrderStatusType;
  title: string;
  urduTitle: string;
  description: string;
  urduDescription: string;
  iconName: string;
}

export const ORDER_TRACKING_STEPS: OrderTrackingStep[] = [
  {
    step: 1,
    status: 'Pending',
    title: 'Order Placed & Confirmed',
    urduTitle: 'آرڈر موصول ہو گیا (Order Received)',
    description: 'Your order has been verified and received by the kitchen manager.',
    urduDescription: 'Aap ka order kitchen manager ko phonch chuka hai.',
    iconName: 'Receipt',
  },
  {
    step: 2,
    status: 'Cooking in Kitchen',
    title: 'Cooking in Kitchen',
    urduTitle: 'باورچی خانے میں تیاری جاری ہے (Cooking)',
    description: 'Master chefs are handcrafting your meal over iron woks and charcoal tandoors.',
    urduDescription: 'Bawarchi khane me khana pak raha hai.',
    iconName: 'Flame',
  },
  {
    step: 3,
    status: 'Ready for Pickup',
    title: 'Packed & Ready',
    urduTitle: 'پیک اور تیار ہے (Packed & Hot)',
    description: 'Freshly sealed in heat-insulated thermal containers.',
    urduDescription: 'Garam garam pack ho chuka hai, rider ke intezaar me hai.',
    iconName: 'PackageCheck',
  },
  {
    step: 4,
    status: 'Out for Delivery',
    title: 'Out for Delivery',
    urduTitle: 'رائیڈر راستے میں ہے (On The Way)',
    description: 'Our rider has picked up your food and is rushing to your address.',
    urduDescription: 'Rider aap ke ghar ke raaste me hai.',
    iconName: 'Bike',
  },
  {
    step: 5,
    status: 'Delivered',
    title: 'Delivered & Enjoy',
    urduTitle: 'ڈلیور ہو گیا (Delivered)',
    description: 'Delivered hot to your door. Noush-e-Jaan farmayein!',
    urduDescription: 'Order kamyabi se deliver ho gaya. Noush-e-Jaan farmayein!',
    iconName: 'CheckCircle2',
  },
];
