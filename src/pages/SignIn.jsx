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
  Link as MuiLink,
} from "@mui/material";
import OtpVerification from "../components/OtpVerification";
import {
  FormCheckBox,
  FormInput,
} from "../components/shared/form-components/FormComponents";
import { userLogin } from "../core/apis/authAPI";
import EmailSent from "../components/shared/popups/EmailSent";
import { useAuth } from "../core/context/AuthContext";

const schema = yup.object().shape({
  email: yup
    .string()
    .label("Email")
    .email()
    .test("no-alias", "Alias emails (with '+') are not allowed", (value) => {
      if (!value) return true;
      const [localPart] = value.split("@");
      return !localPart.includes("+");
    })
    .required()
    .nullable(),
  confirm: yup.boolean().oneOf([true], "Confirmation is required").required(),
});

const SignIn = () => {
  const { t } = useTranslation();
  const { signinWithGoogle, loadingSocial, signinWithFacebook } = useAuth();
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      confirm: false,
    },
    resolver: yupResolver(schema),
    mode: "all",
  });

  const handleSubmitForm = (payload) => {
    setIsSubmitting(true);
    userLogin({ ...payload, email: payload?.email?.toLowerCase() })
      .then((res) => {
        if (res?.data?.status === "success") {
          setShowEmailSent(true);
        }
      })
      .catch((e) => {
        toast?.error(
          e?.response?.data?.message || e?.message || "Failed to send message"
        );
      })
      .finally(() => setIsSubmitting(false));
  };

  if (showOtpVerification) {
    return (
      <div className="bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <OtpVerification
            email={getValues("email")}
            setShowEmailSent={setShowEmailSent}
          />
        </div>
        {showEmailSent && (
          <EmailSent
            email={getValues("email")}
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
          Welcome back! Please enter your email.
        </p>

        <form
          className="flex flex-col gap-[1rem]"
          onSubmit={handleSubmit(handleSubmitForm)}
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Controller
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <FormInput
                  placeholder={"Enter email"}
                  value={value}
                  helperText={error?.message}
                  onChange={(value) => onChange(value)}
                />
              )}
              name="email"
              control={control}
            />
          </div>

          <div className="flex items-center">
            <Controller
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <FormCheckBox
                  placeholder={"Enter email"}
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
                        I accept the{" "}
                        <MuiLink
                          rel="noopener noreferrer"
                          target="_blank"
                          color="secondary"
                          href="/terms"
                          underline="none"
                        >
                          Terms & Conditions
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
      </div>
      {showEmailSent && (
        <EmailSent
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
