import i18next from "i18next";

export const formatValidity = (validityDisplay) => {
  if (!validityDisplay) return "";

  const [num, rawUnit] = validityDisplay.split(" ");
  const count = Number(num);
  if (isNaN(count) || !rawUnit) return validityDisplay;

  const unitKeyRaw = rawUnit.toLowerCase().replace(/s$/, "");
  const unitKey = count === 1 ? unitKeyRaw : `${unitKeyRaw}_plural`;

  const translatedUnit = i18next.t(`bundles.unit.${unitKey}`);

  return `${count} ${translatedUnit}`;
};
