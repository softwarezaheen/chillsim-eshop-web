import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
//COMPONENT
import { Button, TextField } from "@mui/material";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resendOrderOTP, userLogin, verifyOTP } from "../core/apis/authAPI";
import { verifyOrderOTP } from "../core/apis/userAPI";
import { dcbMessage } from "../core/variables/ProjectVariables";
import { queryClient } from "../main";
import { SignIn } from "../redux/reducers/authReducer";

const schema = ({ t }) =>
  yup.object().shape({
    otp: yup
      .array()
      .of(
        yup
          .string()
          .matches(/^\d$/, t("auth.otpMustBeNumber"))
          .required(t("auth.otpRequired"))
          .length(1, t("auth.otpDigitLength"))
      )
      .length(6, t("auth.otpSixDigits")),
  });

const OtpVerification = ({
  email,
  onVerify,
  setShowEmailSent,
  phone,
  orderDetail,
  verifyBy,
  checkout = false,
  recallAssign,
}) => {
  const { iccid } = useParams();

  const { t } = useTranslation();
  console.log(checkout, "sssssssssssssssss");
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isVerifying, setIsVerifying] = useState(false);
  const [resend, setResend] = useState(true);
  const [timer, setTimer] = useState(120); // 120 seconds = 2 minutes
  const { login_type, otp_channel } = useSelector((state) => state.currency);
  const [_, setVerifiedBy] = useState("email");
  const [proceed] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      otp: ["", "", "", "", "", ""],
    },
    resolver: yupResolver(schema({ t })),
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

  useEffect(() => {
    setVerifiedBy(otp_channel?.[0]);
  }, [otp_channel]);

  const handleSubmitForm = (payload) => {
    setIsVerifying(true);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("order_id", orderDetail?.order_id);
    let handleAPI = checkout ? verifyOrderOTP : verifyOTP;
    handleAPI({
      ...payload,
      ...(checkout
        ? {
            order_id: orderDetail?.order_id,
            otp: payload.otp.join(""),
            iccid: iccid,
          }
        : {
            ...(login_type === "phone"
              ? { phone: phone }
              : { user_email: email }),
            verification_pin: payload.otp.join(""),
            provider_token: "",
            provider_type: "",
          }),
    })
      .then((res) => {
        if (res?.data?.status === "success") {
          if (checkout) {
            // Delay invalidation by 5 seconds
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ["my-esim"] });
              if (iccid) {
                queryClient.invalidateQueries({
                  queryKey: [`esim-detail-${iccid}`],
                });
              }

              navigate({
                pathname: iccid ? `/esim/${iccid}` : "/plans",
                search: !iccid ? `?${searchParams.toString()}` : "",
              });
            }, 5000); // 5000 ms = 5 seconds
          } else {
            //login user
            dispatch(
              SignIn({
                ...res?.data?.data,
              })
            );
          }
        } else {
          toast.error(t("auth.failedToVerifyOtp"));
          setIsVerifying(false);
        }
      })
      .catch((error) => {
        reset();

        toast.error(error?.developerMessage || t("auth.failedToVerifyOtp"));
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
    console.log(orderDetail, "ordrrr detaill");
    if (checkout) {
      resendOrderOTP(orderDetail?.order_id)
        .then((res) => {
          if (res?.data?.status === "success") {
            setResend(true);
            setTimer(120);
          }
        })
        .catch((e) => {
          toast?.error(e?.message || "Failed to send message");
        });
    } else {
      userLogin({
        [login_type]: login_type === "phone" ? phone : email,
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
    }
  };

  const shouldBeDisabled = useMemo(() => {
    return (
      Object.keys(errors)?.length !== 0 ||
      getValues("otp").some((el) => el === "")
    );
  }, [errors, getValues()]);

  console.log(checkout, otp_channel, proceed);
  //EXPLANATION : PLEASE DON'T CHANGE THIS AS IT WILL BE APPLIED LATER

  // if (checkout && otp_channel?.length > 1 && !proceed) {
  //   return (
  //     <div className={"flex flex-col gap-[1rem]"}>
  //       <RadioGroup
  //         name="use-radio-group"
  //         value={verifiedBy}
  //         onChange={(e) => setVerifiedBy(e.target.value)}
  //         row
  //         sx={{ columnGap: 2, flexWrap: "nowrap", overflowX: "auto" }}
  //       >
  //         {otp_channel?.map((channel) => (
  //           <FormControlLabel
  //             sx={{
  //               alignItems: "center !important",
  //               whiteSpace: "nowrap",
  //             }}
  //             value={channel}
  //             label={
  //               <div className="flex flex-row gap-[0.5rem] items-center">
  //                 <Typography
  //                   fontWeight={"bold"}
  //                   color="primary"
  //                   fontSize={"1rem"}
  //                 >
  //                   Verify by {channel}
  //                 </Typography>
  //               </div>
  //             }
  //             control={<Radio checked={verifiedBy === channel} />}
  //           />
  //         ))}
  //       </RadioGroup>
  //       <div className={"flex flex-row justify-center sm:justify-start "}>
  //         <Button
  //           onClick={() => setProceed(true)}
  //           color="primary"
  //           type="submit"
  //           variant="contained"
  //           sx={{ width: "30%" }}
  //         >
  //           Confirm
  //         </Button>
  //       </div>
  //     </div>
  //   );
  // } else
  return (
    <form
      onSubmit={handleSubmit(handleSubmitForm)}
      className={clsx("w-full max-w-md  flex flex-col gap-[2rem] sm:px-unset", {
        "px-8 mx-auto": !checkout,
      })}
    >
      <h1 className="font-bold text-center text-primary">
        {t("auth.verifyEmail", { verifyBy: t(`auth.${verifyBy}`) })}
      </h1>
      <p className="text-center font-semibold text-content-600">
        {checkout
          ? t(`auth.${dcbMessage}`, { verifyBy: t(`auth.${verifyBy}`) })
          : t("auth.verificationCodeSent", { verifyBy: t(`auth.${verifyBy}`) })}
        <br />
        <span dir="ltr" className="font-medium">
          {login_type === "phone"
            ? phone?.toLowerCase() || ""
            : email?.toLowerCase() || ""}
        </span>
      </p>

      {/* OTP Input */}
      <div className="flex justify-center gap-2" dir="ltr">
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
                  inputRef={(el) => (inputRefs.current[index] = el)}
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
                  dir="ltr"
                  inputProps={{
                    maxLength: 1,
                    dir: "ltr",
                    style: { textAlign: "center" },
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
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
                role="button"
                tabIndex={0}
                onClick={handleResendOtp}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleResendOtp();
                }}
                className="text-secondary underline cursor-pointer"
              >
                {t("auth.resendNow")}
              </span>
            </>
          ) : (
            <p className={"text-secondary font-bold"}>
              {t("auth.resendCode")} {Math.floor(timer / 60)}:
              {(timer % 60).toString().padStart(2, "0")}
            </p>
          )}
        </div>
      </div>
    </form>
  );
};

export default OtpVerification;
