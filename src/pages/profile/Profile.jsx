import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { isValidPhoneNumber } from "react-phone-number-input";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { FormHelperText } from "@mui/material";
//COMPONENT
import {
  FormDropdownList,
  FormInput,
  FormPhoneInput,
  FormSwitch,
} from "../../components/shared/form-components/FormComponents";
import { Button, Card, CardContent, Tooltip, Switch, FormControlLabel } from "@mui/material";
import { updateUserInfo } from "../../core/apis/authAPI";
import { getBillingInfo, saveBillingInfo } from "../../core/apis/userAPI";
import { UpdateAuthInfo } from "../../redux/reducers/authReducer";
import { getActiveCurrencies } from "../../core/apis/configurationsAPI";
import { useQuery } from "react-query";
import { UpdateCurrency } from "../../redux/reducers/currencyReducer";
import { Info } from "@mui/icons-material";
import { queryClient } from "../../main";
import { useTranslation } from "react-i18next";
import { countries } from "../../components/tmp-login/country";
import { romanianCounties } from "../../components/tmp-login/counties";
import { romanianCities } from "../../components/tmp-login/regions";
import { gtmEvent } from "../../core/utils/gtm.jsx";

const Profile = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user_info } = useSelector((state) => state.authentication);
  const login_type = useSelector((state) => state.currency?.login_type);
  const system_currency = useSelector(
    (state) => state.currency?.system_currency
  );

  const [billingType, setBillingType] = useState("individual");
  const [availableCities, setAvailableCities] = useState([]);

  const schema = yup.object().shape({
    email:
      login_type === "email"
        ? yup
            .string()
            .email(t("profile.errors.emailInvalid"))
            .required(t("profile.errors.emailRequired"))
            .nullable()
        : yup.string().email(t("profile.errors.emailInvalid")).nullable(),

    first_name: yup
      .string()
      .label(t("profile.firstName"))
      .test(
        "only-letters",
        t("profile.errors.onlyLettersAllowed"),
        (value) => !value || /^[^\d]+$/.test(value)
      )
      .max(
        60,
        t("errors.maxCharacter", {
          field: t("profile.firstName"),
          character: 60,
        })
      )
      .nullable(),

    last_name: yup
      .string()
      .label(t("profile.lastName"))
      .test(
        "only-letters",
        t("profile.errors.onlyLettersAllowed"),
        (value) => !value || /^[^\d]+$/.test(value)
      )
      .max(
        60,
        t("errors.maxCharacter", {
          field: t("profile.lastName"),
          character: 60,
        })
      )
      .nullable(),

    msisdn: yup
      .string()
      .label(t("profile.phoneNumber"))
      .when("$signinType", {
        is: () => login_type === "phone",
        then: (schema) => schema.required(t("profile.errors.phoneRequired")),
        otherwise: (schema) => schema.notRequired(),
      })
      .nullable()
      .test("is-valid-phone", t("profile.errors.invalidPhone"), (value) => {
        if (!value) return true;
        return isValidPhoneNumber(value);
      }),

    should_notify: yup.bool(),
    default_currency: yup.object().nullable(),

    // Billing fields
    country: yup.string().nullable(),
    city: yup.string().nullable(),
    state: yup.string().nullable(),
    billingAddress: yup.string().nullable(),
    companyName: yup.string().nullable(),
    vatCode: yup.string().nullable(),
    tradeRegistry: yup.string().nullable(),
  });

  const {
    data: currencies,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["active-currencies"],
    queryFn: () =>
      getActiveCurrencies().then((res) => {
        return res?.data?.data;
      }),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      email: user_info?.email || "",
      msisdn: user_info?.msisdn || "",
      first_name: user_info?.first_name || "",
      last_name: user_info?.last_name || "",
      should_notify: user_info?.should_notify || false,
      user_currency: null,
      country: "",
      city: "",
      state: "",
      billingAddress: "",
      companyName: "",
      vatCode: "",
      tradeRegistry: "",
    },
    resolver: yupResolver(schema),
    mode: "all",
  });

  const selectedCountry = watch("country");
  const selectedState = watch("state");

  console.log("login type", login_type, "errors", errors);

  const handleCountryChange = (countryValue) => {
    setValue("country", countryValue);
    setValue("city", "");
    setValue("state", "");
    setAvailableCities([]);
  };

  const handleCountyChange = (countyValue) => {
    setValue("state", countyValue);
    setValue("city", "");
    
    if (countyValue && selectedCountry === "RO") {
      const county = romanianCounties.find(c => c.alpha3.trim() === countyValue);
      if (county) {
        // Normalize Romanian characters for lookup (ș→s, ț→t) to match regions.js keys
        const countyKey = county.name.toUpperCase().replace(/Ș/g, 'S').replace(/Ț/g, 'T');
        if (romanianCities[countyKey]) {
          const cities = romanianCities[countyKey].map(city => ({
            value: city.name,
            label: city.name,
          }));
          setAvailableCities(cities);
        }
      } else {
        setAvailableCities([]);
      }
    } else {
      setAvailableCities([]);
    }
  };

  const handleSubmitForm = async (payload) => {
    setIsSubmitting(true);
    
    try {
      // Update user info
      const { email, country, city, state, billingAddress, companyName, vatCode, tradeRegistry, ...userPayload } = payload;
      const userFinalPayload = email && email.trim() !== "" ? { ...userPayload, email: email } : userPayload;
      
      const userRes = await updateUserInfo({ ...userFinalPayload });
      const userStatusBool = userRes?.data?.status === "success";
      
      if (userStatusBool) {
        if (payload?.user_currency) {
          sessionStorage?.setItem("user_currency", payload?.user_currency?.currency);
        } else {
          sessionStorage?.removeItem("user_currency");
        }
        
        dispatch(UpdateCurrency({ user_currency: payload?.user_currency || null }));
        dispatch(UpdateAuthInfo(userRes?.data?.data?.user_info));
      }

      // Update billing info
      const billingPayload = {
        email: email?.toLowerCase() || "",
        firstName: payload.first_name || "",
        lastName: payload.last_name || "",
        country: country || "",
        city: city || "",
        state: state || "",
        billingAddress: billingAddress || "",
        companyName: billingType === "business" ? (companyName || "") : "",
        vatCode: billingType === "business" ? (vatCode || "") : "",
        tradeRegistry: billingType === "business" ? (tradeRegistry || "") : "",
      };

      const billingRes = await saveBillingInfo(billingPayload);
      const billingStatusBool = billingRes?.data?.status === "success";

      if (billingStatusBool) {
        gtmEvent("profile_update_billing_info", {});
      }

      queryClient.invalidateQueries();
      
      toast.success(t("profile.infoUpdatedSuccessfully"));
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t("profile.failedToUpdateUserInfo"));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchBillingInfo = async () => {
      try {
        const res = await getBillingInfo();
        if (res?.data?.data) {
          const data = res.data.data;
          
          if (data.companyName || data.vatCode || data.tradeRegistry) {
            setBillingType("business");
          }
          
          reset({
            email: user_info?.email || "",
            first_name: user_info?.first_name || "",
            last_name: user_info?.last_name || "",
            should_notify: user_info?.should_notify || false,
            msisdn: user_info?.msisdn || "",
            user_currency: currencies
              ? currencies?.find(
                  (el) => el?.currency == sessionStorage.getItem("user_currency")
                )
              : null,
            country: data.country || "",
            city: data.city || "",
            state: data.state || "",
            billingAddress: data.billingAddress || "",
            companyName: data.companyName || "",
            vatCode: data.vatCode || "",
            tradeRegistry: data.tradeRegistry || "",
          });
        } else {
          reset({
            email: user_info?.email || "",
            first_name: user_info?.first_name || "",
            last_name: user_info?.last_name || "",
            should_notify: user_info?.should_notify || false,
            msisdn: user_info?.msisdn || "",
            user_currency: currencies
              ? currencies?.find(
                  (el) => el?.currency == sessionStorage.getItem("user_currency")
                )
              : null,
          });
        }
      } catch (error) {
        console.error("Error fetching billing info:", error);
      }
    };

    if (user_info) {
      fetchBillingInfo();
    }
  }, [user_info, currencies]);

  // Load cities when state/county is set
  useEffect(() => {
    if (selectedCountry === "RO" && selectedState) {
      const county = romanianCounties.find(c => c.alpha3.trim() === selectedState);
      if (county) {
        // Normalize Romanian characters for lookup (ș→s, ț→t) to match regions.js keys
        const countyKey = county.name.toUpperCase().replace(/Ș/g, 'S').replace(/Ț/g, 'T');
        if (romanianCities[countyKey]) {
          const cities = romanianCities[countyKey].map(city => ({
            value: city.name,
            label: city.name,
          }));
          setAvailableCities(cities);
        }
      }
    } else {
      setAvailableCities([]);
    }
  }, [selectedCountry, selectedState]);

  return (
    <div className={"flex flex-col gap-[1rem]"}>
      <form
        className={"flex flex-col gap-[1rem]"}
        onSubmit={handleSubmit(handleSubmitForm)}
      >
        <h1>{t("profile.accountInformation")}</h1>
        <Card>
          <CardContent className={"flex flex-col gap-[1rem]"}>
            {" "}
            {/* Email and Phone */}
            <div
              className={
                "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-[1rem]"
              }
            >
              <div>
                <label>{t("checkout.email")}</label>
                <Controller
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <FormInput
                      placeholder={t("checkout.enterEmail")}
                      value={value}
                      disabled={login_type == "email"}
                      helperText={error?.message}
                      onChange={(value) => onChange(value)}
                    />
                  )}
                  name="email"
                  control={control}
                />
              </div>

              <div>
                <label>{t("profile.phoneNumber")}</label>
                <Controller
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <FormPhoneInput
                      value={value}
                      disabled={login_type == "phone"}
                      helperText={error?.message}
                      onChange={(value, country) => onChange(value)}
                    />
                  )}
                  name="msisdn"
                  control={control}
                />
              </div>
            </div>

            {/* Currency and Marketing Notifications */}
            <div
              className={
                "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-[1rem]"
              }
            >
              <div>
                <label>
                  {t("profile.defaultCurrency")}{" "}
                  <Tooltip
                    title={t("profile.defaultCurrencyFallback", {
                      system_currency,
                    })}
                  >
                    <span className={"cursor-pointer"}>
                      <Info fontSize="small" />
                    </span>
                  </Tooltip>
                </label>
                <Controller
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <FormDropdownList
                      data={currencies || []}
                      value={value}
                      helperText={error?.message}
                      loading={isLoading}
                      accessName={"currency"}
                      accessValue={"currency"}
                      placeholder={t("profile.selectDefaultCurrency")}
                      onChange={(value) => onChange(value)}
                    />
                  )}
                  name="user_currency"
                  control={control}
                />
              </div>

              {login_type != "phone" && (
                <div className="flex items-end">
                  <div className="bg-gradient-to-r from-warning-50 to-primary-50 p-3 rounded-xl border-2 border-warning-200 w-full">
                    <Controller
                      render={({
                        field: { onChange, value },
                        fieldState: { error },
                      }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={value}
                              onChange={(e) => onChange(e.target.checked)}
                              color="warning"
                            />
                          }
                          label={
                            <div>
                              <div className="text-sm font-semibold text-content-900">
                                {value
                                  ? t("promotions.modal.toggleEnabled")
                                  : t("promotions.modal.toggleDisabled")}
                              </div>
                              <div className="text-xs text-content-600 mt-0.5">
                                {t("promotions.modal.toggleHint")}
                              </div>
                            </div>
                          }
                          className="m-0"
                        />
                      )}
                      name="should_notify"
                      control={control}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {login_type != "phone" && (
              <p className="text-xs text-content-500 leading-relaxed px-1">
                {t("promotions.modal.disclaimer")}
              </p>
            )}

            {/* Billing Information Section */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">{t("checkout.billingInformation")}</h3>
              
              {/* Billing type */}
              <div className="flex gap-6 mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="billingType"
                    value="individual"
                    checked={billingType === "individual"}
                    onChange={() => {
                      setBillingType("individual");
                      // Clear business fields when switching to individual
                      setValue("companyName", "");
                      setValue("vatCode", "");
                      setValue("tradeRegistry", "");
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
                    onChange={() => setBillingType("business")}
                  />
                  {t("checkout.business")}
                </label>
              </div>

              {/* Business fields */}
              {billingType === "business" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[1rem] mb-4">
                  <div>
                    <label>{t("checkout.companyName")}</label>
                    <Controller
                      render={({
                        field: { onChange, value },
                        fieldState: { error },
                      }) => (
                        <FormInput
                          placeholder={t("checkout.companyName")}
                          value={value}
                          helperText={error?.message}
                          onChange={(value) => onChange(value)}
                        />
                      )}
                      name="companyName"
                      control={control}
                    />
                  </div>
                  <div>
                    <label>{t("checkout.vatCode")}</label>
                    <Controller
                      render={({
                        field: { onChange, value },
                        fieldState: { error },
                      }) => (
                        <FormInput
                          placeholder={t("checkout.vatCode")}
                          value={value}
                          helperText={error?.message}
                          onChange={(value) => onChange(value)}
                        />
                      )}
                      name="vatCode"
                      control={control}
                    />
                  </div>
                  <div>
                    <label>{t("checkout.tradeRegistry")}</label>
                    <Controller
                      render={({
                        field: { onChange, value },
                        fieldState: { error },
                      }) => (
                        <FormInput
                          placeholder={t("checkout.tradeRegistry")}
                          value={value}
                          helperText={error?.message}
                          onChange={(value) => onChange(value)}
                        />
                      )}
                      name="tradeRegistry"
                      control={control}
                    />
                  </div>
                </div>
              )}

              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1rem] mb-4">
                <div>
                  <label>{t("profile.firstName")}</label>
                  <Controller
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <FormInput
                        placeholder={t("profile.enterFirstName")}
                        value={value}
                        helperText={error?.message}
                        onChange={(value) => onChange(value)}
                      />
                    )}
                    name="first_name"
                    control={control}
                  />
                </div>
                <div>
                  <label>{t("profile.lastName")}</label>
                  <Controller
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <FormInput
                        placeholder={t("profile.enterLastName")}
                        value={value}
                        helperText={error?.message}
                        onChange={(value) => onChange(value)}
                      />
                    )}
                    name="last_name"
                    control={control}
                  />
                </div>
              </div>

              {/* Billing location fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1rem] mb-4">
                <div>
                  <label>{t("checkout.country")}</label>
                  <Controller
                    render={({ field, fieldState: { error } }) => (
                      <div>
                        <Select
                          {...field}
                          options={countries.map((country) => ({
                            value: country.alpha2.trim(),
                            label: country.name,
                          }))}
                          placeholder={t("checkout.selectCountry")}
                          onChange={(option) => {
                            field.onChange(option?.value);
                            handleCountryChange(option?.value);
                          }}
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
                        {error && (
                          <FormHelperText error>{error.message}</FormHelperText>
                        )}
                      </div>
                    )}
                    name="country"
                    control={control}
                  />
                </div>

                <div>
                  <label>{t("checkout.state")}</label>
                  <Controller
                    render={({ field, fieldState: { error } }) =>
                      selectedCountry === "RO" ? (
                        <div>
                          <Select
                            {...field}
                            options={romanianCounties.map((county) => ({
                              value: county.alpha3.trim(),
                              label: county.name,
                            }))}
                            placeholder={t("checkout.selectCounty")}
                            onChange={(option) => {
                              field.onChange(option?.value);
                              handleCountyChange(option?.value);
                            }}
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
                            isSearchable
                            isClearable
                          />
                          {error && (
                            <FormHelperText error>{error.message}</FormHelperText>
                          )}
                        </div>
                      ) : (
                        <FormInput
                          {...field}
                          placeholder={t("checkout.state")}
                          helperText={error?.message}
                          onChange={(value) => field.onChange(value)}
                        />
                      )
                    }
                    name="state"
                    control={control}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1rem] mb-4">
                <div>
                  <label>{t("checkout.city")}</label>
                  <Controller
                    render={({ field, fieldState: { error } }) => {
                      const isRomaniaSelected = selectedCountry === "RO";
                      
                      return isRomaniaSelected ? (
                        <div>
                          <Select
                            {...field}
                            options={availableCities}
                            placeholder={selectedState ? t("checkout.selectCity") : t("checkout.selectCountyFirst")}
                            onChange={(option) => field.onChange(option?.value)}
                            value={
                              field.value ? { value: field.value, label: field.value } : null
                            }
                            isSearchable
                            isClearable
                            isDisabled={!selectedState}
                          />
                          {error && (
                            <FormHelperText error>{error.message}</FormHelperText>
                          )}
                        </div>
                      ) : (
                        <FormInput
                          {...field}
                          placeholder={t("checkout.city")}
                          helperText={error?.message}
                          onChange={(value) => field.onChange(value)}
                        />
                      );
                    }}
                    name="city"
                    control={control}
                  />
                </div>

                <div>
                  <label>{t("checkout.billingAddress")}</label>
                  <Controller
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <FormInput
                        placeholder={t("checkout.billingAddress")}
                        value={value}
                        helperText={error?.message}
                        onChange={(value) => onChange(value)}
                      />
                    )}
                    name="billingAddress"
                    control={control}
                  />
                </div>
              </div>
            </div>

            <div className={"flex flex-row gap-[1rem] items-end justify-end "}>
              <Button
                variant={"contained"}
                color="secondary"
                disabled={!isDirty}
                sx={{ width: "150px" }}
                onClick={() => reset()}
              >
                {t("btn.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !isDirty}
                variant={"contained"}
                color="primary"
                sx={{ width: "150px" }}
              >
                {isSubmitting ? t("btn.savingChanges") : t("btn.saveChanges")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default Profile;
