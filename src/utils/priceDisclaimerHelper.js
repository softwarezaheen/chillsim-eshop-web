/**
 * Gets dynamic price disclaimer text based on tax_mode and fee_enabled configurations
 * @param {Function} t - i18n translation function
 * @returns {string} Appropriate price disclaimer text
 */
export const getPriceDisclaimerText = (t) => {
  try {
    const configurations = JSON.parse(sessionStorage.getItem("configurations") || "{}");
    const taxMode = (configurations.tax_mode || "exclusive").toLowerCase();
    const feeEnabled = (configurations.fee_enabled || "false").toLowerCase() === "true";

    // Tax mode: inclusive - tax is already included in displayed price
    // Tax mode: exclusive - tax will be added at checkout
    // Tax mode: none - no tax applied
    // Fee enabled: true - transaction fee will be added
    // Fee enabled: false - no transaction fee

    if (taxMode === "inclusive") {
      if (feeEnabled) {
        return t("price_details.inclusive_with_fees", {
          defaultValue: "Prices displayed include taxes. Transaction fees apply at checkout"
        });
      } else {
        return t("price_details.inclusive_no_fees", {
          defaultValue: "Prices displayed are final and include all taxes"
        });
      }
    } else if (taxMode === "exclusive") {
      if (feeEnabled) {
        return t("price_details.exclusive_with_fees", {
          defaultValue: "Prices shown exclude taxes and transaction fees"
        });
      } else {
        return t("price_details.exclusive_no_fees", {
          defaultValue: "Prices shown exclude taxes"
        });
      }
    } else {
      // tax_mode == "none"
      if (feeEnabled) {
        return t("price_details.none_with_fees", {
          defaultValue: "Transaction fees apply at checkout"
        });
      } else {
        return t("price_details.none_no_fees", {
          defaultValue: "Prices displayed are final"
        });
      }
    }
  } catch (error) {
    console.error("Error getting price disclaimer:", error);
    // Fallback to default
    return t("price_details", {
      defaultValue: "Prices shown exclude taxes and transaction fees"
    });
  }
};
