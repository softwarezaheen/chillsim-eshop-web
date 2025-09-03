import React, { useState } from "react";
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
import { isValidPhoneNumber } from "react-phone-number-input";
import { supportedPrefix } from "../../core/variables/ProjectVariables";
import { romanianCities } from "./regions";
import { countries } from "./country";
import { romanianCounties } from "./counties";
import { supabase } from "./supabase";
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

  const schema = yup.object().shape({
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
      .email()
      .nullable()
      .when("login_type", {
        is: (val) => val !== "phone",
        then: (s) => s.required(t("checkout.emailRequired")),
        otherwise: (s) => s.notRequired(),
      })
      .test("no-alias", t("checkout.aliasEmailNotAllowed"), (value) => {
        if (!value) return true;
        const [localPart] = value.split("@");
        return !localPart.includes("+");
      }),

    confirm: yup.boolean().oneOf([true], t("auth.confirmationRequired")).required(),

    verify_by: yup.string().when("otp_channel", {
      is: (val) => Array.isArray(val) && val.length > 1,
      then: (s) => s.required(t("auth.selectVerificationMethod")),
    }),
  });


  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
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

  const handleSubmitForm = async (payload) => {
    console.log("Submitting with payload:", payload);
    userLimitedLogin({ 
      verify_by: payload?.verify_by, 
      confirm: payload?.confirm, 
      [login_type]: payload?.[login_type]?.toLowerCase(),
    });
    setIsSubmitting(true);
    try {
      const res = await userLimitedLogin({
        verify_by: payload?.verify_by,
        confirm: payload?.confirm,
        [login_type]: payload?.[login_type]?.toLowerCase(),
      });
      if (res?.data?.status === "success") {
        dispatch(LimitedSignIn({ ...res?.data?.data }));
        navigate(nextUrl);
      } else {
        toast.error(res?.message);
      }
    } catch (e) {
      toast.error(e?.message || t("checkout.failedToSendMessage"));
    } finally {
      setIsSubmitting(false);
    }
    try {
      const { data, error } = await supabase
        .from("billing_information") 
        .upsert([payload], { onConflict: "email" });

      if (error) throw error;
    } catch (error) {
      console.error(error);
    }
  };

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
            onChange={() => setBillingType("individual")}
          />
          {t("checkout.individual")}
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="billingType"
            value="business"
            checked={billingType === "business"}
            onChange={() => setBillingType("business")}
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
            render={({ field }) => (
              <FormInput
                {...field}
                label={t("checkout.companyName")}
                placeholder={t("checkout.companyName")}
              />
            )}
          />
          <Controller
            name="vatCode"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                label={t("checkout.vatCode")}
                placeholder={t("checkout.vatCode")}
              />
            )}
          />
          <Controller
            name="tradeRegistry"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                label={t("checkout.tradeRegistry")}
                placeholder={t("checkout.tradeRegistry")}
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
          render={({ field }) => (
            <FormInput
              {...field}
              label={t("checkout.lastName")}
              placeholder={t("checkout.lastName")}
            />
          )}
        />
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <FormInput
              {...field}
              label={t("checkout.firstName")}
              placeholder={t("checkout.firstName")}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <FormInput
              {...field}
              label={t("checkout.email")}
              placeholder={t("checkout.enterEmail")}
            />
          )}
        />
        <Controller
          name="country"
          control={control}
          render={({ field, fieldState }) => (
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
            <Select
              {...field}
              options={romanianCounties.map((county) => ({
                value: county.alpha2.trim(),
                label: county.name,
              }))}
              placeholder={t("checkout.selectCounty")}
              onChange={(option) => field.onChange(option?.value)} // sau .label, vezi ce vrei să salvezi
              value={
                field.value
                  ? {
                      value: field.value,
                      label:
                        romanianCounties.find((c) => c.alpha2.trim() === field.value)?.name ||
                        field.value,
                    }
                  : null
              }
            />
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
