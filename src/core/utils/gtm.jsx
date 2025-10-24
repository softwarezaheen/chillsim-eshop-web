/**
 * Dual-Provider Analytics Integration
 * Sends events to both Google Analytics 4 (via GTM) and Facebook Pixel
 */

import {
  PurchaseEvent,
  AddToCartEvent,
  ViewItemEvent,
  ViewItemListEvent,
  BeginCheckoutEvent,
  EcommerceItem,
} from '../analytics/eventModels';
import {
  sendFacebookPurchase,
  sendFacebookAddToCart,
  sendFacebookViewContent,
  sendFacebookInitiateCheckout,
} from '../analytics/facebookPixel';

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

// GA4 ecommerce purchase event (DUAL-PROVIDER: GA4 + Facebook)
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

  // ✅ Backend sends amounts in ACTUAL CURRENCY (not cents)
  // Use values directly per implementation guide
  const totalValue = parseFloat((total_amount || (order_amount + order_fee + order_vat)).toFixed(2));
  const itemPrice = parseFloat((order_amount || 0).toFixed(2));
  const feeAmount = parseFloat((order_fee || 0).toFixed(2));
  const taxAmount = parseFloat((order_vat || 0).toFixed(2));
  const discountAmount = parseFloat((discount || 0).toFixed(2));

  console.log('💰 Purchase event amounts (currency format):', {
    totalValue,
    itemPrice,
    feeAmount,
    taxAmount,
    discountAmount
  });

  // Create event model for dual-provider tracking
  const purchaseEvent = new PurchaseEvent({
    items: [{
      id: bundle_details?.bundle_code || 'unknown',
      name: bundle_details?.display_title || bundle_details?.name || 'Bundle',
      category: iccid ? 'topup' : 'esim',
      price: itemPrice,
      quantity: 1,
    }],
    currency: currency || 'EUR',
    transactionId: order_id,
    shipping: feeAmount,
    tax: taxAmount,
    discount: discountAmount,
    coupon: promo_code || null,
    paymentType: payment_type || null,
  });

  // Send to GA4 via GTM dataLayer
  pushToDataLayer({
    event: eventName,
    ...purchaseEvent.ga4Parameters,
    // Additional parameters
    ...(iccid && { iccid }),
  });

  // Send to Facebook Pixel
  sendFacebookPurchase(purchaseEvent.facebookParameters, order_id);

  console.log('✅ Purchase event sent to both GA4 and Facebook', {
    ga4: purchaseEvent.ga4Parameters,
    facebook: purchaseEvent.facebookParameters,
  });
};

// GA4 view_item event (DUAL-PROVIDER: GA4 + Facebook)
export const gtmViewItemEvent = (bundleData, isTopup = false) => {
  if (!bundleData) return;

  // Create event model
  const viewItemEvent = new ViewItemEvent({
    item: {
      id: bundleData.bundle_code || bundleData.id || 'unknown',
      name: bundleData.display_title || bundleData.title || bundleData.name || 'Bundle',
      category: isTopup ? 'topup' : 'esim_bundle',
      price: bundleData.price || 0,
      quantity: 1,
    },
    currency: bundleData.currency || 'EUR',
  });

  // Send to GA4 via GTM
  pushToDataLayer(viewItemEvent.ga4Parameters);

  // Send to Facebook Pixel (ViewContent)
  sendFacebookViewContent(viewItemEvent.facebookParameters);

  console.log('✅ ViewItem event sent to both GA4 and Facebook');
};

// GA4 view_item_list event (DUAL-PROVIDER: GA4 + Facebook)
export const gtmViewItemListEvent = (items, listName, listId, listType = 'country') => {
  if (!items || items.length === 0) return;

  // Determine if this is a topup list based on listType
  const isTopupList = listType === 'topup';

  // Map items to EcommerceItem format
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
      id: item.bundle_code || item.id || `item_${index}`,
      name: item.display_title || item.title || item.name || item.country || 'Bundle',
      category: itemCategory,
      price: item.price || 0,
      quantity: 1,
    };
  });

  // Assume first item's currency for the list (or default to EUR)
  const currency = items[0]?.currency_code || items[0]?.currency || 'EUR';

  // Create event model
  const viewListEvent = new ViewItemListEvent({
    items: ecommerceItems,
    listName: listName,
    listId: listId,
    currency: currency,
  });

  // Send to GA4 via GTM
  pushToDataLayer(viewListEvent.ga4Parameters);

  // Send to Facebook Pixel (ViewContent with multiple items)
  sendFacebookViewContent(viewListEvent.facebookParameters);

  console.log('✅ ViewItemList event sent to both GA4 and Facebook');
};

// GA4 add_to_cart event (DUAL-PROVIDER: GA4 + Facebook)
export const gtmAddToCartEvent = (bundleData, isTopup = false, iccid = null) => {
  if (!bundleData) return;

  // Create event model
  const addToCartEvent = new AddToCartEvent({
    item: {
      id: bundleData.bundle_code || bundleData.id || 'unknown',
      name: bundleData.display_title || bundleData.title || bundleData.name || 'Bundle',
      category: isTopup ? 'topup' : 'esim_bundle',
      price: bundleData.price || 0,
      quantity: 1,
    },
    currency: bundleData.currency || 'EUR',
  });

  // Send to GA4 via GTM
  pushToDataLayer({
    ...addToCartEvent.ga4Parameters,
    ...(iccid && { iccid }), // Add iccid if present
  });

  // Send to Facebook Pixel
  sendFacebookAddToCart(addToCartEvent.facebookParameters);

  console.log('✅ AddToCart event sent to both GA4 and Facebook');
};

// GA4 begin_checkout event (DUAL-PROVIDER: GA4 + Facebook)
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

  // ⚠️ NOTE: begin_checkout uses order amounts in CENTS
  // Convert to currency format
  const itemPrice = formatCentsToValue(order_amount);
  const feeAmount = formatCentsToValue(order_fee);
  const taxAmount = formatCentsToValue(order_vat);

  const isTopup = !!iccid;
  const couponCode = promo_code || coupon;

  // Create event model
  const beginCheckoutEvent = new BeginCheckoutEvent({
    items: [{
      id: bundle_details?.bundle_code || 'unknown',
      name: bundle_details?.display_title || bundle_details?.name || 'Bundle',
      category: isTopup ? 'topup' : 'esim_bundle',
      price: itemPrice,
      quantity: 1,
    }],
    currency: currency || 'EUR',
    shipping: feeAmount,
    tax: taxAmount,
    coupon: couponCode || null,
  });

  // Send to GA4 via GTM
  pushToDataLayer(beginCheckoutEvent.ga4Parameters);

  // Send to Facebook Pixel (InitiateCheckout)
  sendFacebookInitiateCheckout(beginCheckoutEvent.facebookParameters);

  console.log('✅ BeginCheckout event sent to both GA4 and Facebook');
};