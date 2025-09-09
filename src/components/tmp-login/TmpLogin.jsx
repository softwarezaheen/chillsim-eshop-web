import React, { useState, useEffect } from "react";
import Select from "react-select";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
import { Link } from "react-router-dom";
import {
  FormCheckBox,
  FormInput,
  FormPhoneInput,
} from "../shared/form-components/FormComponents";
import { useDispatch, useSelector } from "react-redux";
import { LimitedSignIn } from "../../redux/reducers/authReducer";
import { toast } from "react-toastify";
import {
  Button,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { userLimitedLogin } from "../../core/apis/authAPI";
import { getBillingInfo, saveBillingInfo } from "../../core/apis/userAPI";
import { isValidPhoneNumber } from "react-phone-number-input";
import { supportedPrefix } from "../../core/variables/ProjectVariables";
import { romanianCities } from "./regions";
import { countries } from "./country";
import { romanianCounties } from "./counties";
import { useNavigate, useLocation } from "react-router-dom";

const TmpLogin = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const nextUrl = params.get("next");

  const { login_type, otp_channel } = useSelector((state) => state.currency);
  const isAuthenticated = useSelector(
    (state) => state.authentication?.tmp?.isAuthenticated || state.authentication?.isAuthenticated
  );

  console.log("Login type from Redux:", login_type, 'is auth:', isAuthenticated);

  const schema = yup.object().shape({
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
    firstName: yup.string().required(t("profile.errors.firstNameRequired")),
    lastName: yup.string().required(t("profile.errors.lastNameRequired")),
    phone: yup
      .string()
      .nullable()
      .when("login_type", {
        is: "phone",
        then: (s) => s.required(t("auth.phoneRequired")),
        otherwise: (s) => s.notRequired(),
      })
      .test("is-valid-phone", t("auth.invalidPhoneNumber"), (value) => {
        if (!value) return true;
        if (!isValidPhoneNumber(value)) return false;
        const cleaned = value.replace(/^(\+?963)/, "");
        const prefix = cleaned.substring(0, 2);
        return supportedPrefix.includes(prefix);
      }),

    email: yup
      .string()
      .email(t("checkout.invalidEmail"))
      .required(t("checkout.emailRequired")) // <-- always required
      // .nullable()
      // .when("login_type", {
      //   is: (val) => val !== "phone",
      //   then: (s) => s.required(t("checkout.emailRequired")),
      //   otherwise: (s) => s.notRequired(),
      // })
      // .test("no-alias", t("checkout.aliasEmailNotAllowed"), (value) => {
      //   if (!value) return true;
      //   const [localPart] = value.split("@");
      //   return !localPart.includes("+");
      // }),
      .test("no-alias", t("checkout.aliasEmailNotAllowed"), (value) => {
        if (!value) return true;
        const [localPart] = value.split("@");
        return !localPart.includes("+");
      }),

    city: yup.string().when("country", {
      is: (val) => val !== "phone",
      then: (s) => s.required(t("checkout.cityRequired")),
      otherwise: (s) => s.notRequired(),
    }),
    country: yup.string().required(t("checkout.countryRequired")),
    state: yup.string().when("country", {
      is: (val) => val === "RO",
      then: (s) => s.required(t("checkout.stateRequired")),
      otherwise: (s) => s.notRequired(),
    }),

    confirm: yup.boolean().oneOf([true], t("auth.confirmationRequired")).required(),

    // verify_by: yup.string().when("otp_channel", {
    //   is: (val) => Array.isArray(val) && val.length > 1,
    //   then: (s) => s.required(t("auth.selectVerificationMethod")),
    // }),

    verify_by: yup.string().when("$signinType", {
        is: (val) => otp_channel?.length > 1,
        then: (schema) => schema.required(t("auth.selectVerificationMethod")),
        otherwise: (schema) => schema.notRequired(),
      }),
  });


  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      billingType: "individual",
      email: "",
      phone: "",
      firstName: "",
      lastName: "",
      country: "",
      city: "",
      state: "",
      billingAddress: "",
      companyName: "",
      vatCode: "",
      tradeRegistry: "",
      confirm: false,
      verify_by: otp_channel?.[0],
    },
    resolver: yupResolver(schema, { context: { signinType: login_type } }),
    mode: "all",
  });

  const selectedCountry = watch("country");
  const [billingType, setBillingType] = useState("individual");

  const fetchBillingInfo = async () => {
    
    if (!isAuthenticated) return;
    try {
      const res = await getBillingInfo();
      if (res?.data?.data) {
        const data = res?.data?.data;
        setValue("email", data.email || "");
        setValue("firstName", data.firstName || "");
        setValue("lastName", data.lastName || "");
        setValue("country", data.country || "");
        setValue("city", data.city || "");
        setValue("state", data.state || "");
        setValue("billingAddress", data.billingAddress || "");
        setValue("companyName", data.companyName || "");
        setValue("vatCode", data.vatCode || "");
        setValue("tradeRegistry", data.tradeRegistry || "");
        setValue("phone", data.phone || "");

        if (data.companyName || data.vatCode || data.tradeRegistry) {
          setBillingType("business");
        }
      }
    } catch (error) {
      console.error("Error fetching billing info:", error);
    }
  };

  const handleSubmitForm = async (payload) => {
    let canNavigate = false
    const submissionPayload = {
      ...payload,
      email: payload.email ? payload.email.toLowerCase() : "",
    };
    console.log("Submitting with payload:", submissionPayload);
    await userLimitedLogin({
      verify_by: submissionPayload?.verify_by,
      confirm: submissionPayload?.confirm,
      [login_type]: submissionPayload?.[login_type]?.toLowerCase(),
    }).then((res) => {
        if (res?.data?.status === "success") {
          dispatch(LimitedSignIn({ ...res?.data?.data }));
          console.log("Dispatching LimitedSignIn with data:", res?.data?.data);
          console.log("Login successful, navigate to:", nextUrl);
          
        } else {
          canNavigate = false
          toast.error(res?.message);
        }
      })
      .catch((e) => {
        toast?.error(e?.message || t("checkout.failedToSendMessage"));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
    // setIsSubmitting(true);
    // try {
    //   const res = await userLimitedLogin({
    //     verify_by: submissionPayload?.verify_by,
    //     confirm: submissionPayload?.confirm,
    //     [login_type]: submissionPayload?.[login_type]?.toLowerCase(),
    //   });
    //   if (res?.data?.status === "success") {
    //     dispatch(LimitedSignIn({ ...res?.data?.data }));
    //     navigate(nextUrl);
    //   } else {
    //     toast.error(res?.message);
    //   }
    // } catch (e) {
    //   toast.error(e?.message || t("checkout.failedToSendMessage"));
    // } finally {
    //   setIsSubmitting(false);
    // }
    await saveBillingInfo(submissionPayload).then((res) =>{
      if (res?.data?.status !== "success") {
        throw new Error(res?.data?.message || "Failed to save billing info");
      } else {
        canNavigate = true;
      }
    }).catch((e) => {
      console.error("Error saving billing info:", e);
    });

    if (canNavigate) {
      navigate(nextUrl);
    }
  };

  useEffect(() => {
    fetchBillingInfo();
  }, []);

  return (
    <form
      onSubmit={handleSubmit(handleSubmitForm)}
      className="flex flex-col gap-8 w-full sm:basis-[50%] shrink-0"
    >
      {/* Billing Info */}
      <h2 className="text-xl font-bold">{t("checkout.billingInformation")}</h2>

      {/* Billing type */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="billingType"
            value="individual"
            checked={billingType === "individual"}
            onChange={() => {
              setBillingType("individual");
              setValue("billingType", "individual");
            }}
          />
          {t("checkout.individual")}
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="billingType"
            value="business"
            checked={billingType === "business"}
            onChange={() => {
              setBillingType("business");
              setValue("billingType", "business");
            }}
          />
          {t("checkout.business")}
        </label>
      </div>

      {/* Business fields */}
      {billingType === "business" && (
        <>
          <Controller
            name="companyName"
            control={control}
            render={({ field, fieldState }) => (
              <FormInput
                {...field}
                label={t("checkout.companyName")}
                placeholder={t("checkout.companyName")}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="vatCode"
            control={control}
            render={({ field, fieldState }) => (
              <FormInput
                {...field}
                label={t("checkout.vatCode")}
                placeholder={t("checkout.vatCode")}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="tradeRegistry"
            control={control}
            render={({ field, fieldState }) => (
              <FormInput
                {...field}
                label={t("checkout.tradeRegistry")}
                placeholder={t("checkout.tradeRegistry")}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </>
      )}

      {/* Common fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="lastName"
          control={control}
          render={({ field, fieldState }) => (
            <FormInput
              {...field}
              label={t("checkout.lastName")}
              placeholder={t("checkout.lastName")}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="firstName"
          control={control}
          render={({ field, fieldState }) => (
            <FormInput
              {...field}
              label={t("checkout.firstName")}
              placeholder={t("checkout.firstName")}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <FormInput
              {...field}
              label={t("checkout.email")}
              placeholder={t("checkout.enterEmail")}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="country"
          control={control}
          render={({ field, fieldState }) => (
            <div>
              <Select
                {...field}
                options={countries.map((country) => ({
                  value: country.alpha2.trim(), // use alpha2 as the actual value
                  label: country.name, // display country name
                }))}
                placeholder={t("checkout.selectCountry")}
                onChange={(option) => field.onChange(option?.value)}
                value={
                  field.value
                    ? {
                        value: field.value,
                        label:
                          countries.find((c) => c.alpha2.trim() === field.value)?.name ||
                          field.value,
                      }
                    : null
                }
              />
            {fieldState.error && (
              <FormHelperText error>{fieldState.error.message}</FormHelperText>
            )}
            </div>
          )}
        />

      </div>

      {/* City / State */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

      <Controller
        name="city"
        control={control}
        render={({ field, fieldState }) =>
          selectedCountry === "RO" ? ( // ✅ check against country name
            <div>
              <Select
                {...field}
                options={Object.keys(romanianCities).flatMap((county) =>
                  romanianCities[county].map((city) => ({
                    value: city.name,
                    label: city.name,
                  }))
                )}
                placeholder={t("checkout.selectCity")}
                onChange={(option) => field.onChange(option?.value)}
                value={
                  field.value ? { value: field.value, label: field.value } : null
                }
              />
              {fieldState.error && (
                <FormHelperText error>{fieldState.error.message}</FormHelperText>
              )}
            </div>
          ) : (
            <FormInput
              {...field}
              label={t("checkout.city")}
              placeholder={t("checkout.city")}
              helperText={fieldState.error?.message}
            />
          )
        }
      />
      
      <Controller
        name="state"
        control={control}
        render={({ field, fieldState }) =>
          selectedCountry === "RO" ? ( // ✅ verificare pe alpha2
            <div>
              <Select
                {...field}
                options={romanianCounties.map((county) => ({
                  value: county.alpha3.trim(),
                  label: county.name,
                }))}
                placeholder={t("checkout.selectCounty")}
                onChange={(option) => field.onChange(option?.value)} // sau .label, vezi ce vrei să salvezi
                value={
                  field.value
                    ? {
                        value: field.value,
                        label:
                          romanianCounties.find((c) => c.alpha3.trim() === field.value)?.name ||
                          field.value,
                      }
                    : null
                }
              />
              {fieldState.error && (
                <FormHelperText error>{fieldState.error.message}</FormHelperText>
              )}
            </div>
          ) : (
            <FormInput
              {...field}
              label={t("checkout.state")}
              placeholder={t("checkout.state")}
              helperText={fieldState.error?.message}
            />
          )
        }
      />
    </div>

      {/* Billing Address */}
      <Controller
        name="billingAddress"
        control={control}
        render={({ field }) => (
          <FormInput
            {...field}
            label={t("checkout.billingAddress")}
            placeholder={t("checkout.billingAddress")}
          />
        )}
      />

      {/* Confirm + OTP Channels */}
      {otp_channel?.length > 1 && (
        <Controller
          name="verify_by"
          control={control}
          render={({ field, fieldState }) => (
            <>
              <RadioGroup {...field} row>
                {otp_channel.map((channel) => (
                  <FormControlLabel
                    key={channel}
                    value={channel}
                    control={<Radio />}
                    label={t("auth.verifyByChannel", { channel })}
                  />
                ))}
              </RadioGroup>
              {fieldState.error && (
                <FormHelperText>{fieldState.error.message}</FormHelperText>
              )}
            </>
          )}
        />
      )}

      <Controller
        name="confirm"
        control={control}
        render={({ field, fieldState }) => (
          <FormCheckBox
            {...field}
            helperText={fieldState.error?.message}
            label={
              <div className="text-sm font-semibold flex flex-col gap-1">
                <span>
                  {t("auth.confirmValidAndNoTypos", { login_type })}
                </span>
                <span>
                  {t("auth.andIAcceptThe")}{" "}
                  <Link to="/terms" target="_blank">
                    {t("checkout.terms")}
                  </Link>{" "}
                  {t("auth.andIUnderstandProductWorksWithESIM")}
                </span>
              </div>
            }
          />
        )}
      />

      {/* Submit */}
      <Button
        disabled={isSubmitting}
        color="primary"
        type="submit"
        variant="contained"
        sx={{ width: "30%" }}
      >
        {t("btn.confirm")}
      </Button>
    </form>
  );
};

export default TmpLogin;
