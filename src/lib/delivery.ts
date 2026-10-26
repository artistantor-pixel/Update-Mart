/**
 * Delivery Charge Calculation Utilities
 * 
 * Handles product-level delivery settings:
 * 1. Free Delivery (`isFreeDelivery: true` -> ৳0 charge)
 * 2. Custom Delivery Charge (`customDeliveryCharge: number` -> specific charge per product)
 * 3. Default Courier Rate (Inside Dhaka / Outside Dhaka fallback)
 */

export interface CartDeliveryItem {
  id?: string;
  productId?: string;
  name?: string;
  quantity?: number;
  isFreeDelivery?: boolean;
  customDeliveryCharge?: number | null;
}

export interface DeliveryCalculationParams {
  cartItems: CartDeliveryItem[];
  selectedDistrict?: string;
  insideDhakaFee?: number;
  outsideDhakaFee?: number;
}

export type DeliveryChargeType = 'free' | 'custom' | 'standard';

export interface DeliveryCalculationResult {
  fee: number;
  isFree: boolean;
  hasCustomCharge: boolean;
  appliedType: DeliveryChargeType;
  description: string;
  freeItemCount: number;
  customItemCount: number;
  standardItemCount: number;
}

/**
 * Calculates delivery fee based on cart items, product settings, and destination district.
 */
export function calculateDeliveryFee({
  cartItems,
  selectedDistrict = 'Dhaka',
  insideDhakaFee = 60,
  outsideDhakaFee = 120,
}: DeliveryCalculationParams): DeliveryCalculationResult {
  if (!cartItems || cartItems.length === 0) {
    return {
      fee: 0,
      isFree: true,
      hasCustomCharge: false,
      appliedType: 'free',
      description: 'No items in cart',
      freeItemCount: 0,
      customItemCount: 0,
      standardItemCount: 0,
    };
  }

  const freeItems = cartItems.filter(item => Boolean(item.isFreeDelivery));
  const nonFreeItems = cartItems.filter(item => !item.isFreeDelivery);

  const customChargeItems = nonFreeItems.filter(
    item => item.customDeliveryCharge !== undefined && 
            item.customDeliveryCharge !== null && 
            !isNaN(Number(item.customDeliveryCharge)) &&
            Number(item.customDeliveryCharge) >= 0
  );

  const standardItems = nonFreeItems.filter(
    item => item.customDeliveryCharge === undefined || 
            item.customDeliveryCharge === null || 
            isNaN(Number(item.customDeliveryCharge))
  );

  const isInsideDhaka = (selectedDistrict || 'Dhaka').trim().toLowerCase() === 'dhaka';
  const standardCourierFee = isInsideDhaka ? Number(insideDhakaFee || 60) : Number(outsideDhakaFee || 120);

  // Case 1: ALL items in cart have Free Delivery
  if (cartItems.length > 0 && freeItems.length === cartItems.length) {
    return {
      fee: 0,
      isFree: true,
      hasCustomCharge: false,
      appliedType: 'free',
      description: 'Free Delivery Applied',
      freeItemCount: freeItems.length,
      customItemCount: 0,
      standardItemCount: 0,
    };
  }

  // Case 2: Cart has items with Custom Delivery Charge (and non-free items)
  if (customChargeItems.length > 0) {
    // If standard items also exist, we take the maximum between custom charge and standard courier fee
    const maxCustomCharge = Math.max(...customChargeItems.map(i => Number(i.customDeliveryCharge) || 0));
    const effectiveFee = standardItems.length > 0 
      ? Math.max(maxCustomCharge, standardCourierFee)
      : maxCustomCharge;

    const isEffectivelyFree = effectiveFee === 0;

    return {
      fee: effectiveFee,
      isFree: isEffectivelyFree,
      hasCustomCharge: true,
      appliedType: isEffectivelyFree ? 'free' : 'custom',
      description: isEffectivelyFree 
        ? 'Free Delivery Applied' 
        : `Custom Delivery Charge (৳${effectiveFee})`,
      freeItemCount: freeItems.length,
      customItemCount: customChargeItems.length,
      standardItemCount: standardItems.length,
    };
  }

  // Case 3: Standard Courier Fee applies for remaining non-free items
  return {
    fee: standardCourierFee,
    isFree: false,
    hasCustomCharge: false,
    appliedType: 'standard',
    description: isInsideDhaka ? 'Inside Dhaka Standard Delivery' : 'Outside Dhaka Standard Delivery',
    freeItemCount: freeItems.length,
    customItemCount: 0,
    standardItemCount: standardItems.length,
  };
}

/**
 * Helper to get a human-readable delivery badge for a product
 */
export function getProductDeliveryBadge(product: {
  isFreeDelivery?: boolean;
  customDeliveryCharge?: number | null;
}) {
  if (product.isFreeDelivery) {
    return {
      type: 'free' as const,
      label: 'Free Delivery',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40',
      priceText: '৳0',
    };
  }

  if (
    product.customDeliveryCharge !== undefined && 
    product.customDeliveryCharge !== null && 
    !isNaN(Number(product.customDeliveryCharge))
  ) {
    const charge = Number(product.customDeliveryCharge);
    if (charge === 0) {
      return {
        type: 'free' as const,
        label: 'Free Delivery',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40',
        priceText: '৳0',
      };
    }
    return {
      type: 'custom' as const,
      label: `Delivery: ৳${charge}`,
      color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40',
      priceText: `৳${charge}`,
    };
  }

  return {
    type: 'standard' as const,
    label: 'Standard Courier Fee',
    color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    priceText: '৳60 / ৳120',
  };
}
