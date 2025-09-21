export const gtmEvent = (eventName, params = {}) => {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...params,
    });

    // Immediately clear the params to avoid leaking to the next event
    const resetObj = {};
    Object.keys(params).forEach((key) => {
      resetObj[key] = null;
    });
    window.dataLayer.push(resetObj);
  }
};