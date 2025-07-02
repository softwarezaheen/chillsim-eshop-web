//UTILITIES
import React, { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
import { toast } from "react-toastify";
//COMPONENT
import {
  Backdrop,
  Button,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  Link as MuiLink,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import OtpVerification from "../components/OtpVerification";
import {
  FormCheckBox,
  FormInput,
  FormPhoneInput,
} from "../components/shared/form-components/FormComponents";
import { userLogin } from "../core/apis/authAPI";
import EmailSent from "../components/shared/popups/EmailSent";
import { useAuth } from "../core/context/AuthContext";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useSelector } from "react-redux";
import { supportedPrefix } from "../core/variables/ProjectVariables";

const SignIn = () => {
  const { t } = useTranslation();
  const { signinWithGoogle, loadingSocial, signinWithFacebook } = useAuth();
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login_type, otp_channel, social_login } = useSelector(
    (state) => state.currency
  );

  const schema = ({ t }) =>
    yup.object().shape({
      phone: yup
        .string()
        .label("Phone number")
        .nullable()
        .when("$signinType", {
          is: (val) => login_type == "phone",
          then: (schema) => schema.required(`${t("auth.phoneRequired")}`),
          otherwise: (schema) => schema.notRequired(),
        })
        .test("is-valid-phone", `${t("auth.invalidPhone")}`, (value) => {
          if (!value) return true;

          // Validate phone number format
          if (!isValidPhoneNumber(value)) return false;

          // Validate first 2 digits after +963
          const cleaned = value.replace(/^(\+?963)/, "");

          const prefix = cleaned.substring(0, 2);
          const validPrefixes = supportedPrefix;
          return validPrefixes.includes(prefix);
        }),

      email: yup
        .string()
        .label("Email")
        .email(`${t("auth.emailMustBeValid")}`)
        .test("no-alias", `${t("checkout.aliasEmailNotAllowed")}`, (value) => {
          if (!value) return true;
          const [localPart] = value.split("@");
          return !localPart.includes("+");
        })
        .nullable()
        .when("$signinType", {
          is: (val) => login_type !== "phone",
          then: (schema) => schema.required(`${t("checkout.emailRequired")}`),
          otherwise: (schema) => schema.notRequired(),
        }),
      confirm: yup
        .boolean()
        .oneOf([true], t("auth.confirmationRequired"))
        .required(),
      verify_by: yup.string().when("$signinType", {
        is: (val) => otp_channel?.length > 1,
        then: (schema) => schema.required(t("auth.selectVerificationMethod")),
        otherwise: (schema) => schema.notRequired(),
      }),
    });

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      phone: "",
      confirm: false,
      verify_by: otp_channel?.[0],
    },
    resolver: yupResolver(schema({ t })),
    mode: "all",
  });

  const handleSubmitForm = (payload) => {
    setIsSubmitting(true);
    userLogin({
      verify_by: payload?.verify_by,
      confirm: payload?.confirm,
      [login_type]: payload?.[login_type]?.toLowerCase(),
    })
      .then((res) => {
        if (res?.data?.status === "success") {
          setShowEmailSent(true);
        }
      })
      .catch((e) => {
           toast?.error(e?.message || t("checkout.failedToSendMessage"))
      })
      .finally(() => setIsSubmitting(false));
  };

  if (showOtpVerification) {
    return (
      <div className="bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <OtpVerification
            email={getValues("email")}
            phone={getValues("phone")}
            verifyBy={getValues("verify_by")}
            setShowEmailSent={setShowEmailSent}
          />
        </div>
        {showEmailSent && (
          <EmailSent
            email={getValues("email")}
            phone={getValues("phone")}
            verifyBy={getValues("verify_by")}
            onClose={() => {
              setShowEmailSent(false);
              setShowOtpVerification(true);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col gap-[1.5rem] px-[30px]">
        <h1 className="text-center text-4xl font-bold">
          {t("auth.signInTitle")}
        </h1>
        <p className="text-center text-content-400 font-semibold">
          {t("auth.welcomeBackEnterEmail", {
            loginType: t(`auth.${login_type}`),
          })}
        </p>

        <form
          className="flex flex-col gap-[1rem]"
          onSubmit={handleSubmit(handleSubmitForm)}
        >
          {login_type === "phone" ? (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                {t("auth.phoneNumber")}
              </label>
              <Controller
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <FormPhoneInput
                    value={value}
                    defaultCountry="RO"
                    countries={["RO"]}
                    international={false}
                    countrySelectProps={{ disabled: true }}
                    helperText={error?.message}
                    onChange={(value, country) => onChange(value)}
                  />
                )}
                name="phone"
                control={control}
              />
            </div>
          ) : (
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                {t("auth.email")}
              </label>
              <Controller
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <FormInput
                    placeholder={t("checkout.enterEmail")}
                    value={value}
                    helperText={error?.message}
                    onChange={(value) => onChange(value)}
                  />
                )}
                name="email"
                control={control}
              />
            </div>
          )}
          {otp_channel?.length > 1 && (
            <Controller
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <div className={"flex flex-col gap-[0.5rem]"}>
                  <RadioGroup
                    name="use-radio-group"
                    value={value}
                    onChange={onChange}
                    row
                    sx={{ columnGap: 2, flexWrap: "nowrap", overflowX: "auto" }}
                  >
                    {otp_channel?.map((channel) => (
                      <FormControlLabel
                        sx={{
                          alignItems: "center !important",
                          whiteSpace: "nowrap",
                        }}
                        value={channel}
                        label={
                          <div className="flex flex-row gap-[0.5rem] items-center">
                            <Typography
                              fontWeight={"bold"}
                              color="primary"
                              fontSize={"1rem"}
                            >
                              {t("auth.verifyByChannel", {
                                channel: channel,
                              })}
                            </Typography>
                          </div>
                        }
                        control={<Radio checked={value === channel} />}
                      />
                    ))}
                  </RadioGroup>
                  {error?.message !== "" && (
                    <FormHelperText>{error?.message}</FormHelperText>
                  )}
                </div>
              )}
              name="verify_by"
              control={control}
            />
          )}

          <div className="flex">
            <Controller
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <FormCheckBox
                  placeholder={t("checkout.enterEmail")}
                  value={value}
                  helperText={error?.message}
                  onChange={(value) => onChange(value)}
                  label={
                    <div
                      className={
                        "flex flex-col text-sm gap-[0.1rem] font-semibold"
                      }
                    >
                      <div>
                        {t("auth.acceptTerms")}&nbsp;
                        <MuiLink
                          rel="noopener noreferrer"
                          target="_blank"
                          color="secondary"
                          href="/terms"
                          underline="none"
                        >
                          {t("checkout.terms")}
                        </MuiLink>{" "}
                      </div>
                    </div>
                  }
                />
              )}
              name="confirm"
              control={control}
            />
          </div>

          <div>
            <Button
              disabled={isSubmitting}
              type="submit"
              color="primary"
              variant="contained"
            >
              {isSubmitting ? t("auth.signingIn") : t("auth.signIn")}
            </Button>
          </div>
        </form>

        {social_login && (
          <>
            <div className="flex items-center">
              <div className="flex-grow border-t-[0.1rem] border-500"></div>
              <span className="px-4"> {t("auth.orContinueWith")}</span>
              <div className="flex-grow border-t-[0.1rem] border-500"></div>
            </div>
            <div className="flex flex-col gap-[1rem]">
              <button
                onClick={signinWithGoogle}
                className="flex items-center justify-center gap-[0.5rem] w-full py-2 px-4 border border-gray-300 rounded shadow-sm bg-white text-sm font-medium text-primary hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2]"
              >
                <img src={"/media/google.svg"} className="h-5 w-5" />
                {t("auth.signInWithGoogle")}
              </button>

              {/* <button
            onClick={signinWithFacebook}
            className="flex items-center justify-center gap-[0.5rem] w-full py-2 px-4 border border-gray-300 rounded shadow-sm bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2]"
          >
            <img src={"/media/facebook.svg"} className="h-5 w-5" />
            {t("auth.signInWithFacebook")}
          </button> */}
            </div>
          </>
        )}
      </div>
      {showEmailSent && (
        <EmailSent
          verifyBy={getValues("verify_by")}
          phone={getValues("phone")}
          email={getValues("email")}
          onClose={() => {
            setShowEmailSent(false);
            setShowOtpVerification(true);
          }}
        />
      )}
      {loadingSocial && (
        <Backdrop
          sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
          open={true}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
    </div>
  );
};

export default SignIn;
