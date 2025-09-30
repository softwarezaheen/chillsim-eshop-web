// Base dataLayer helper with cleanup
const pushToDataLayer = (eventData) => {
  if (window.dataLayer) {
    window.dataLayer.push(eventData);

    // Immediately clear the params to avoid leaking to the next event
    const resetObj = {};
    Object.keys(eventData).forEach((key) => {
      if (key !== 'event') {
        resetObj[key] = null;
      }
    });
    window.dataLayer.push(resetObj);
  }
};

// Legacy gtmEvent function
export const gtmEvent = (eventName, params = {}) => {
  pushToDataLayer({
    event: eventName,
    ...params,
  });
};

// Helper to create item objects for ecommerce events
const createEcommerceItem = (item, index = 0, isTopup = false) => ({
  item_id: item.bundle_code || item.id || `item_${index}`,
  item_name: item.display_title || item.title || item.name || item.country || 'Bundle',
  item_brand: 'ChillSim',
  item_category: isTopup ? 'topup' : 'esim_bundle',
  price: parseFloat((item.price || 0).toFixed(2)), // Bundle prices are already in currency units
  quantity: 1
});

// Helper to format currency values from cents (for order amounts)
const formatCentsToValue = (amountInCents) => parseFloat(((amountInCents || 0) / 100).toFixed(2));

// Helper to format currency values (for bundle prices - already in currency units)
const formatCurrencyValue = (amount) => parseFloat((amount || 0).toFixed(2));

// GA4 ecommerce purchase event
export const gtmPurchaseEvent = (eventName, orderData) => {
  if (!orderData) return;

  const {
    order_id,
    currency,
    total_amount,
    bundle_details,
    order_amount,
    order_fee,
    order_vat,
    payment_type,
    promo_code,
    discount,
    iccid
  } = orderData;

  // Order amounts from API are in cents, so convert them to currency units
  const totalValue = formatCentsToValue(total_amount || (order_amount + order_fee + order_vat));
  const itemPrice = formatCentsToValue(order_amount);
  const feeAmount = formatCentsToValue(order_fee);
  const taxAmount = formatCentsToValue(order_vat);
  const discountAmount = formatCentsToValue(discount);

  console.log('Purchase event debug:', {
    raw_amounts: { order_amount, order_fee, order_vat, discount, total_amount },
    converted_amounts: { totalValue, itemPrice, feeAmount, taxAmount, discountAmount }
  });

  pushToDataLayer({
    event: eventName,
    ecommerce: {
      currency: currency || 'EUR',
      value: totalValue,
      transaction_id: order_id,
      shipping: feeAmount, // GA4 standard field for shipping/fees
      tax: taxAmount,     // GA4 standard field for tax
      items: [{
        item_id: bundle_details?.bundle_code || 'unknown',
        item_name: bundle_details?.display_title || bundle_details?.name || 'Bundle',
        item_brand: 'ChillSim',
        item_category: 'esim',
        price: itemPrice,
        quantity: 1
      }]
    },
    // Additional parameters
    payment_type: payment_type || '',
    ...(promo_code && { coupon: promo_code }),
    ...(discount && discountAmount > 0 && { discount_amount: discountAmount }),
    ...(iccid && { iccid })
  });
};

// GA4 view_item event
export const gtmViewItemEvent = (bundleData, isTopup = false) => {
  if (!bundleData) return;

  const value = formatCurrencyValue(bundleData.price);

  pushToDataLayer({
    event: 'view_item',
    ecommerce: {
      currency: bundleData.currency || 'EUR',
      value: value,
      items: [createEcommerceItem(bundleData, 0, isTopup)]
    }
  });
};

// GA4 view_item_list event
export const gtmViewItemListEvent = (items, listName, listId, listType = 'country') => {
  if (!items || items.length === 0) return;

  // Determine if this is a topup list based on listType
  const isTopupList = listType === 'topup';

  // Limit to 10 items for performance and create ecommerce items
  const ecommerceItems = items.slice(0, 10).map((item, index) => {
    let itemCategory;
    if (isTopupList) {
      itemCategory = 'topup';
    } else if (listType === 'region') {
      itemCategory = 'region_bundles';
    } else {
      itemCategory = 'country_bundles';
    }

    return {
      ...createEcommerceItem(item, index, isTopupList),
      item_category: itemCategory
    };
  });

  pushToDataLayer({
    event: 'view_item_list',
    ecommerce: {
      item_list_name: listName,
      item_list_id: listId,
      items: ecommerceItems
    }
  });
};

// GA4 add_to_cart event
export const gtmAddToCartEvent = (bundleData, isTopup = false, iccid = null) => {
  if (!bundleData) return;

  const value = formatCurrencyValue(bundleData.price);

  pushToDataLayer({
    event: 'add_to_cart',
    ecommerce: {
      currency: bundleData.currency || 'EUR',
      value: value,
      items: [createEcommerceItem(bundleData, 0, isTopup)]
    }
  });
};

// GA4 begin_checkout event
export const gtmBeginCheckoutEvent = (orderData) => {
  if (!orderData) return;

  const {
    bundle_details,
    order_amount,
    order_fee,
    order_vat,
    currency,
    iccid,
    promo_code,
    coupon
  } = orderData;

  const totalValue = formatCentsToValue(order_amount + order_fee + order_vat);
  const isTopup = !!iccid;

  const ecommerceData = {
    currency: currency || 'EUR',
    value: totalValue,
    items: [{
      item_id: bundle_details?.bundle_code || 'unknown',
      item_name: bundle_details?.display_title || bundle_details?.name || 'Bundle',
      item_brand: 'ChillSim',
      item_category: isTopup ? 'topup' : 'esim_bundle',
      price: formatCentsToValue(order_amount),
      quantity: 1
    }]
  };

  // Add coupon information if available
  const couponCode = promo_code || coupon;
  if (couponCode) {
    ecommerceData.coupon = couponCode;
  }

  pushToDataLayer({
    event: 'begin_checkout',
    ecommerce: ecommerceData
  });
};