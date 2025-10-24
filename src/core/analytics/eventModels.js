/**
 * Event Models for Dual-Provider Analytics (GA4 + Facebook)
 * Based on Flutter app implementation guide
 * 
 * Key Principles:
 * - Single event definition
 * - Dual logging to GA4 (via GTM) and Facebook Pixel
 * - Provider-specific parameter formatting
 * - Currency values used as-is (NO cents conversion except for purchase order totals)
 */

/**
 * EcommerceItem - Represents a product/bundle in ecommerce events
 */
export class EcommerceItem {
  constructor({ id, name, category, price, quantity = 1, brand = 'ChillSim' }) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.price = parseFloat((price || 0).toFixed(2));
    this.quantity = quantity;
    this.brand = brand;
  }

  /**
   * GA4 format (for GTM dataLayer)
   * Full object with all properties
   */
  toGA4Item(index = 0) {
    return {
      item_id: this.id,
      item_name: this.name,
      item_category: this.category,
      item_brand: this.brand,
      price: this.price,
      quantity: this.quantity,
      index: index,
    };
  }

  /**
   * Facebook format (flattened for Pixel/CAPI)
   * Simplified structure per Facebook requirements
   */
  toFacebookContent() {
    return {
      id: this.id,
      quantity: this.quantity,
      item_price: this.price,
    };
  }
}

/**
 * PurchaseEvent - Completed order
 */
export class PurchaseEvent {
  constructor({
    items = [],
    currency = 'EUR',
    transactionId,
    shipping = 0,
    tax = 0,
    discount = 0,
    coupon = null,
    paymentType = null,
  }) {
    this.items = items.map(item => 
      item instanceof EcommerceItem ? item : new EcommerceItem(item)
    );
    this.currency = currency;
    this.transactionId = transactionId;
    this.shipping = parseFloat((shipping || 0).toFixed(2));
    this.tax = parseFloat((tax || 0).toFixed(2));
    this.discount = parseFloat((discount || 0).toFixed(2));
    this.coupon = coupon;
    this.paymentType = paymentType;
  }

  /**
   * Calculate total value: (items total + shipping + tax - discount)
   */
  get value() {
    const itemsTotal = this.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    const gross = itemsTotal + this.shipping + this.tax;
    return parseFloat((gross - this.discount).toFixed(2));
  }

  /**
   * GA4 parameters (for GTM dataLayer)
   */
  get ga4Parameters() {
    return {
      event: 'purchase',
      ecommerce: {
        currency: this.currency,
        value: this.value,
        transaction_id: this.transactionId,
        shipping: this.shipping,
        tax: this.tax,
        ...(this.coupon && { coupon: this.coupon }),
        ...(this.discount > 0 && { discount: this.discount }),
        items: this.items.map((item, index) => item.toGA4Item(index)),
      },
      ...(this.paymentType && { payment_type: this.paymentType }),
    };
  }

  /**
   * Facebook parameters (for Pixel/CAPI)
   */
  get facebookParameters() {
    return {
      content_type: 'product',
      currency: this.currency,
      value: this.value,
      num_items: this.items.reduce((sum, item) => sum + item.quantity, 0),
      contents: this.items.map(item => item.toFacebookContent()),
      // Custom parameters
      ...(this.shipping > 0 && { shipping: this.shipping }),
      ...(this.tax > 0 && { tax: this.tax }),
      ...(this.discount > 0 && { discount: this.discount }),
      ...(this.coupon && { coupon: this.coupon }),
      ...(this.paymentType && { payment_type: this.paymentType }),
    };
  }
}

/**
 * AddToCartEvent - Item added to cart
 */
export class AddToCartEvent {
  constructor({ item, currency = 'EUR' }) {
    this.item = item instanceof EcommerceItem ? item : new EcommerceItem(item);
    this.currency = currency;
  }

  get value() {
    return this.item.price * this.item.quantity;
  }

  get ga4Parameters() {
    return {
      event: 'add_to_cart',
      ecommerce: {
        currency: this.currency,
        value: this.value,
        items: [this.item.toGA4Item(0)],
      },
    };
  }

  get facebookParameters() {
    return {
      content_type: 'product',
      currency: this.currency,
      value: this.value,
      contents: [this.item.toFacebookContent()],
    };
  }
}

/**
 * ViewItemEvent - Single item/product viewed
 */
export class ViewItemEvent {
  constructor({ item, currency = 'EUR' }) {
    this.item = item instanceof EcommerceItem ? item : new EcommerceItem(item);
    this.currency = currency;
  }

  get value() {
    return this.item.price;
  }

  get ga4Parameters() {
    return {
      event: 'view_item',
      ecommerce: {
        currency: this.currency,
        value: this.value,
        items: [this.item.toGA4Item(0)],
      },
    };
  }

  get facebookParameters() {
    return {
      content_type: 'product',
      currency: this.currency,
      value: this.value,
      contents: [this.item.toFacebookContent()],
    };
  }
}

/**
 * ViewItemListEvent - List of items viewed
 */
export class ViewItemListEvent {
  constructor({ items = [], listName, listId, currency = 'EUR' }) {
    this.items = items.map(item => 
      item instanceof EcommerceItem ? item : new EcommerceItem(item)
    );
    this.listName = listName;
    this.listId = listId;
    this.currency = currency;
  }

  get ga4Parameters() {
    return {
      event: 'view_item_list',
      ecommerce: {
        item_list_name: this.listName,
        item_list_id: this.listId,
        items: this.items.map((item, index) => item.toGA4Item(index)),
      },
    };
  }

  get facebookParameters() {
    // Facebook doesn't have a standard ViewItemList event
    // We can use ViewContent with multiple items
    const totalValue = this.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    
    return {
      content_type: 'product',
      currency: this.currency,
      value: parseFloat(totalValue.toFixed(2)),
      contents: this.items.map(item => item.toFacebookContent()),
    };
  }
}

/**
 * BeginCheckoutEvent - Checkout process started
 */
export class BeginCheckoutEvent {
  constructor({
    items = [],
    currency = 'EUR',
    shipping = 0,
    tax = 0,
    coupon = null,
  }) {
    this.items = items.map(item => 
      item instanceof EcommerceItem ? item : new EcommerceItem(item)
    );
    this.currency = currency;
    this.shipping = parseFloat((shipping || 0).toFixed(2));
    this.tax = parseFloat((tax || 0).toFixed(2));
    this.coupon = coupon;
  }

  get value() {
    const itemsTotal = this.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    return parseFloat((itemsTotal + this.shipping + this.tax).toFixed(2));
  }

  get ga4Parameters() {
    return {
      event: 'begin_checkout',
      ecommerce: {
        currency: this.currency,
        value: this.value,
        ...(this.coupon && { coupon: this.coupon }),
        items: this.items.map((item, index) => item.toGA4Item(index)),
      },
    };
  }

  get facebookParameters() {
    return {
      content_type: 'product',
      currency: this.currency,
      value: this.value,
      num_items: this.items.reduce((sum, item) => sum + item.quantity, 0),
      contents: this.items.map(item => item.toFacebookContent()),
      ...(this.coupon && { coupon: this.coupon }),
    };
  }
}
