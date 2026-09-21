type WindowWithDataLayer = Window & {
  dataLayer: any[];
};

export const pageview = (url: string) => {
  if (typeof window !== "undefined") {
    const dataLayer = (window as unknown as WindowWithDataLayer).dataLayer || [];
    dataLayer.push({
      event: "pageview",
      page_path: url,
    });
  }
};

export const pushToDataLayer = (event: string, data: any = {}) => {
  if (typeof window !== "undefined") {
    const dataLayer = (window as unknown as WindowWithDataLayer).dataLayer || [];
    dataLayer.push({ ecommerce: null }); // Clear previous ecommerce object to avoid event collision
    dataLayer.push({
      event,
      ecommerce: data,
    });
  }
};

// GA4 Standard Ecommerce Event Helpers
export const trackViewItem = (product: any) => {
  pushToDataLayer("view_item", {
    currency: "BDT",
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category,
        item_brand: product.brand,
        quantity: 1,
      },
    ],
  });
};

export const trackAddToCart = (product: any, quantity: number = 1, variant?: string) => {
  pushToDataLayer("add_to_cart", {
    currency: "BDT",
    value: product.price * quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category,
        item_brand: product.brand,
        item_variant: variant,
        quantity: quantity,
      },
    ],
  });
};

export const trackBeginCheckout = (cartItems: any[], totalValue: number) => {
  pushToDataLayer("begin_checkout", {
    currency: "BDT",
    value: totalValue,
    items: cartItems.map((item) => ({
      item_id: item.id || item.productId,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
      item_variant: item.variant,
    })),
  });
};

export const trackPurchase = (order: any, cartItems: any[]) => {
  pushToDataLayer("purchase", {
    transaction_id: order.id,
    value: order.total,
    tax: 0,
    shipping: order.delivery_charge || 0,
    currency: "BDT",
    coupon: order.promo_code || "",
    items: cartItems.map((item) => ({
      item_id: item.id || item.productId,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
      item_variant: item.variant,
    })),
  });
};
