import React, { useState, useEffect } from "react";
import Select from "react-select";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Button,
  FormHelperText,
} from "@mui/material";
import {
  FormInput,
} from "../shared/form-components/FormComponents";
import { getBillingInfo, saveBillingInfo } from "../../core/apis/userAPI";
import { romanianCities } from "../tmp-login/regions";
import { countries } from "../tmp-login/country";
import { romanianCounties } from "../tmp-login/counties";
import { gtmEvent } from "../../core/utils/gtm.jsx";
import { useBillingFormSchema, defaultBillingValues } from "./BillingFormModel";

const BillingFormView = ({ onSubmitSuccess, showHeader = true, submitButtonText = null }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const nextUrl = params.get("next");

  const isAuthenticated = useSelector(
    (state) => state.authentication?.tmp?.isAuthenticated || state.authentication?.isAuthenticated
  );
  
  const authUser = useSelector((state) => 
    state.authentication?.tmp?.isAuthenticated 
      ? state.authentication?.tmp 
      : state.authentication
  );
  
  const userEmail = authUser?.user_info?.email || authUser?.email;

  const schema = useBillingFormSchema();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: defaultBillingValues,
    resolver: yupResolver(schema),
    mode: "all",
  });

  const selectedCountry = watch("country");
  const [billingType, setBillingType] = useState("individual");

  const handleCountryChange = (countryValue) => {
    setValue("country", countryValue);
    // Clear city and state when user manually changes country
    setValue("city", "");
    setValue("state", "");
  };

  const fetchBillingInfo = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await getBillingInfo();
      if (res?.data?.data) {
        const data = res?.data?.data;
        
        console.log("Setting billing info from API:", data);
        
        // Set all values - prioritize user's auth email over saved billing email
        setValue("email", userEmail || data.email || "");
        setValue("firstName", data.firstName || "");
        setValue("lastName", data.lastName || "");
        setValue("country", data.country || "");
        setValue("city", data.city || "");
        setValue("state", data.state || "");
        setValue("billingAddress", data.billingAddress || "");
        setValue("companyName", data.companyName || "");
        setValue("vatCode", data.vatCode || "");
        setValue("tradeRegistry", data.tradeRegistry || "");

        if (data.companyName || data.vatCode || data.tradeRegistry) {
          setBillingType("business");
          setValue("billingType", "business");
        }
      } else {
        // If no billing info exists, still set the user's email
        setValue("email", userEmail || "");
      }
    } catch (error) {
      console.error("Error fetching billing info:", error);
      // Even on error, set the user's email if available
      setValue("email", userEmail || "");
    }
  };

  const handleSubmitForm = async (payload) => {
    setIsSubmitting(true);
    let canNavigate = false;
    
    const submissionPayload = {
      ...payload,
      email: payload.email ? payload.email.toLowerCase() : "",
    };

    try {
      const res = await saveBillingInfo(submissionPayload);
      if (res?.data?.status !== "success") {
        throw new Error(res?.data?.message || "Failed to save billing info");
      } else {
        canNavigate = true;
        gtmEvent("cart_save_billing_info", {});
        
        if (onSubmitSuccess) {
          onSubmitSuccess(submissionPayload);
        } else if (nextUrl) {
          navigate(nextUrl);
        }
      }
    } catch (error) {
      console.error("Error saving billing info:", error);
      toast.error(error.message || t("checkout.failedToSaveInfo"));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchBillingInfo();
  }, []);

  // Set the user's email when it becomes available
  useEffect(() => {
    if (userEmail) {
      setValue("email", userEmail);
    }
  }, [userEmail, setValue]);

  return (
    <form
      onSubmit={handleSubmit(handleSubmitForm)}
      className="flex flex-col gap-6 w-full"
    >
      {/* Billing Info Header */}
      {showHeader && (
        <h2 className="text-xl font-bold">{t("checkout.billingInformation")}</h2>
      )}

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
        <div className="flex flex-col gap-4">
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
        </div>
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
              disabled={true}
              sx={{
                '& .MuiInputBase-input': {
                  backgroundColor: '#f5f5f5',
                  color: '#666666',
                },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                  '&.Mui-disabled': {
                    backgroundColor: '#f5f5f5',
                  },
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#666666',
                  '&.Mui-disabled': {
                    color: '#666666',
                  },
                },
              }}
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
                  value: country.alpha2.trim(),
                  label: country.name,
                }))}
                placeholder={t("checkout.selectCountry")}
                onChange={(option) => handleCountryChange(option?.value)}
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
          render={({ field, fieldState }) => {
            const isRomaniaSelected = selectedCountry === "RO";
            
            // Generate Romanian city options
            const romanianCityOptions = isRomaniaSelected 
              ? Object.keys(romanianCities).flatMap((county) =>
                  romanianCities[county]?.map((city) => ({
                    value: city.name,
                    label: city.name,
                  })) || []
                ).filter(Boolean)
              : [];
            
            return isRomaniaSelected ? (
              <div>
                <Select
                  {...field}
                  options={romanianCityOptions}
                  placeholder={t("checkout.selectCity")}
                  onChange={(option) => field.onChange(option?.value)}
                  value={
                    field.value ? { value: field.value, label: field.value } : null
                  }
                  isSearchable
                  isClearable
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
                error={!!fieldState.error}
              />
            );
          }}
        />
        
        <Controller
          name="state"
          control={control}
          render={({ field, fieldState }) =>
            selectedCountry === "RO" ? (
              <div>
                <Select
                  {...field}
                  options={romanianCounties.map((county) => ({
                    value: county.alpha3.trim(),
                    label: county.name,
                  }))}
                  placeholder={t("checkout.selectCounty")}
                  onChange={(option) => field.onChange(option?.value)}
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
        render={({ field, fieldState }) => (
          <FormInput
            {...field}
            label={t("checkout.billingAddress")}
            placeholder={t("checkout.billingAddress")}
            helperText={fieldState.error?.message}
          />
        )}
      />

      {/* Submit */}
      <Button
        disabled={isSubmitting}
        color="primary"
        type="submit"
        variant="contained"
        sx={{ width: "auto", alignSelf: "flex-start" }}
      >
        {isSubmitting 
          ? t("btn.savingChanges") 
          : submitButtonText || t("btn.saveBillingInfo")
        }
      </Button>
    </form>
  );
};

export default BillingFormView;