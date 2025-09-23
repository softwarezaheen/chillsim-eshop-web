import * as yup from "yup";
import { useTranslation } from "react-i18next";

export const useBillingFormSchema = () => {
  const { t } = useTranslation();

  return yup.object().shape({
    billingType: yup.string().oneOf(["individual", "business"]).required(),
    companyName: yup.string().when("billingType", {
      is: "business",
      then: (s) => s.required(t("checkout.companyNameRequired")),
      otherwise: (s) => s.notRequired(),
    }),
    vatCode: yup.string().when("billingType", {
      is: "business",
      then: (s) => s.required(t("checkout.vatCodeRequired")),
      otherwise: (s) => s.notRequired(),
    }),
    tradeRegistry: yup.string().when("billingType", {
      is: "business",
      then: (s) => s.notRequired(),
      otherwise: (s) => s.notRequired(),
    }),
    firstName: yup.string().required(t("profile.errors.firstNameRequired")),
    lastName: yup.string().required(t("profile.errors.lastNameRequired")),
    email: yup
      .string()
      .email(t("checkout.invalidEmail"))
      .required(t("checkout.emailRequired"))
      .test("no-alias", t("checkout.aliasEmailNotAllowed"), (value) => {
        if (!value) return true;
        const [localPart] = value.split("@");
        return !localPart.includes("+");
      }),
    city: yup.string().when("country", {
      is: (val) => val !== "phone", // This seems wrong in original, might need adjustment
      then: (s) => s.required(t("checkout.cityRequired")),
      otherwise: (s) => s.notRequired(),
    }),
    country: yup.string().required(t("checkout.countryRequired")),
    state: yup.string().when("country", {
      is: (val) => val === "RO",
      then: (s) => s.required(t("checkout.stateRequired")),
      otherwise: (s) => s.notRequired(),
    }),
    billingAddress: yup.string().notRequired(),
  });
};

export const defaultBillingValues = {
  billingType: "individual",
  email: "",
  firstName: "",
  lastName: "",
  country: "",
  city: "",
  state: "",
  billingAddress: "",
  companyName: "",
  vatCode: "",
  tradeRegistry: "",
};