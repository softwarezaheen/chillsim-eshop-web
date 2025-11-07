import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { isValidPhoneNumber } from "react-phone-number-input";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
//COMPONENT
import {
  FormDropdownList,
  FormInput,
  FormPhoneInput,
  FormSwitch,
} from "../../components/shared/form-components/FormComponents";
import { Button, Card, CardContent, Tooltip, Switch, FormControlLabel } from "@mui/material";
import { updateUserInfo } from "../../core/apis/authAPI";
import { UpdateAuthInfo } from "../../redux/reducers/authReducer";
import { getActiveCurrencies } from "../../core/apis/configurationsAPI";
import { useQuery } from "react-query";
import { UpdateCurrency } from "../../redux/reducers/currencyReducer";
import { Info } from "@mui/icons-material";
import { queryClient } from "../../main";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user_info } = useSelector((state) => state.authentication);
  const login_type = useSelector((state) => state.currency?.login_type);
  const system_currency = useSelector(
    (state) => state.currency?.system_currency
  );

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
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      email: user_info?.email || "",
      msisdn: user_info?.msisdn || "",
      first_name: user_info?.first_name || "",
      last_name: user_info?.last_name || "",
      should_notify: user_info?.should_notify || false,
      user_currency: null,
    },
    resolver: yupResolver(schema),
    mode: "all",
  });

  console.log("login type", login_type, "errors", errors);

  const handleSubmitForm = (payload) => {
    setIsSubmitting(true);
    const { email, ...rest } = payload;
    const finalPayload =
      email && email.trim() !== "" ? { ...rest, email: email } : rest;
    updateUserInfo({
      ...finalPayload,
    })
      .then((res) => {
        const statusBool = res?.data?.status === "success";
        if (statusBool) {
          if (payload?.user_currency) {
            sessionStorage?.setItem(
              "user_currency",
              payload?.user_currency?.currency
            );
          } else {
            sessionStorage?.removeItem("user_currency");
          }
          queryClient.invalidateQueries();

          dispatch(
            UpdateCurrency({ user_currency: payload?.user_currency || null })
          );
          dispatch(UpdateAuthInfo(res?.data?.data?.user_info));
        }
        toast?.[statusBool ? "success" : "error"](
          statusBool
            ? t("profile.infoUpdatedSuccessfully")
            : t("profile.failedToUpdateUserInfo")
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  useEffect(() => {
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
  }, [user_info, currencies]);

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
            </div>
            {login_type != "phone" && (
              <div className="space-y-2">
                <div className="bg-gradient-to-r from-warning-50 to-primary-50 p-4 rounded-xl border-2 border-warning-200">
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
                <p className="text-xs text-content-500 leading-relaxed px-1">
                  {t("promotions.modal.disclaimer")}
                </p>
              </div>
            )}
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
