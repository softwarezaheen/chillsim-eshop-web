import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
//COMPONENT
import { Button, TextField } from "@mui/material";
import { userLogin, verifyOTP } from "../core/apis/authAPI";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { SignIn, SignOut } from "../redux/reducers/authReducer";
import { useNavigate } from "react-router-dom";

const schema = yup.object().shape({
  otp: yup
    .array()
    .of(
      yup
        .string()
        .matches(/^\d$/, "OTP must be a number")
        .required("OTP is required")
        .length(1, "Each OTP digit must be exactly one character")
    )
    .length(6, "OTP must have exactly 6 digits"),
});

const OtpVerification = ({ email, onVerify, setShowEmailSent }) => {
  const { t } = useTranslation();
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isVerifying, setIsVerifying] = useState(false);
  const [resend, setResend] = useState(true);
  const [timer, setTimer] = useState(120); // 120 seconds = 2 minutes

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      otp: ["", "", "", "", "", ""],
    },
    resolver: yupResolver(schema),
    mode: "all",
  });

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !getValues(`otp[${index}]`) && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  useEffect(() => {
    if (timer === 0) {
      setResend(false);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmitForm = (payload) => {
    setIsVerifying(true);
    verifyOTP({
      ...payload,
      user_email: email,
      verification_pin: payload.otp.join(""),
      provider_token: "",
      provider_type: "",
    })
      .then((res) => {
        if (res?.data?.status === "success") {
          //login user
          dispatch(
            SignIn({
              ...res?.data?.data,
            })
          );
        } else {
          toast.error("Failed to verify otp");
          setIsVerifying(false);
        }
      })
      .catch((error) => {
        reset();

        toast.error(error?.message || "Failed to verify otp");
      })
      .finally(() => {
        setIsVerifying(false);
      });
  };

  const handleInput = (index, value) => {
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // If all digits are filled, verify automatically
    if (value && index === 5) {
      handleSubmitForm(getValues());
    }
  };
  const handlePaste = (e, index) => {
    const pastedValue = e.clipboardData?.getData("Text");
    if (/^\d*$/.test(pastedValue)) {
      const digits = pastedValue.split("").slice(0, 6);
      reset({
        otp: digits,
      });
    }
  };

  const handleResendOtp = () => {
    userLogin({
      email: email,
    })
      .then((res) => {
        if (res?.data?.status === "success") {
          setShowEmailSent(true);
          setResend(true);
          setTimer(120);
        }
      })
      .catch((e) => {
        toast?.error(e?.message || "Failed to send message");
      });
  };

  const shouldBeDisabled = useMemo(() => {
    return (
      Object.keys(errors)?.length !== 0 ||
      getValues("otp").some((el) => el === "")
    );
  }, [errors, getValues()]);

  return (
    <form
      onSubmit={handleSubmit(handleSubmitForm)}
      className="w-full max-w-md mx-auto flex flex-col gap-[2rem] px-8 sm:px-unset"
    >
      <h1 className="font-bold text-center text-primary">
        {t("auth.verifyEmail")}
      </h1>
      <p className="text-center font-semibold text-content-600">
        {t("auth.verificationCodeSent")}
        <br />
        <span className="font-medium">{email?.toLowerCase() || ""}</span>
      </p>

      {/* OTP Input */}
      <div className="flex justify-center gap-2">
        {Array(6)
          .fill()
          ?.map((digit, index) => (
            <Controller
              key={`otp-${index}`}
              name={`otp.[${index}]`}
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <TextField
                  inputRef={(el) => (inputRefs.current[index] = el)} // Assign ref4
                  value={value}
                  maxLength={1}
                  onChange={(e) => {
                    if (e.target.value === "" || /^\d*$/.test(e.target.value)) {
                      onChange(e?.target?.value);
                      handleInput(index, e.target.value);
                    }
                  }}
                  onPaste={(e) => handlePaste(e, index)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  inputProps={{ maxLength: 1 }}
                  variant="outlined"
                  fullWidth
                  autoFocus={index === 0}
                />
              )}
            />
          ))}
      </div>

      <div className={"flex flex-col gap-[0.5rem]"}>
        <Button
          type={"submit"}
          color="primary"
          variant="contained"
          disabled={isVerifying || shouldBeDisabled}
        >
          {isVerifying ? t("auth.verifying") : t("auth.verify")}
        </Button>

        <div className="flex flex-row flex-wrap gap-[0.5rem] w-full justify-center text-center text-sm">
          {!resend ? (
            <>
              {t("auth.didntReceiveCode")}{" "}
              <span
                className={"text-secondary underline cursor-pointer"}
                onClick={() => handleResendOtp()}
              >
                {" "}
                {t("auth.resendNow")}
              </span>
            </>
          ) : (
            <p className={"text-secondary font-bold"}>
              Resend Code in {Math.floor(timer / 60)}:
              {(timer % 60).toString().padStart(2, "0")}
            </p>
          )}
        </div>
      </div>
    </form>
  );
};

export default OtpVerification;
