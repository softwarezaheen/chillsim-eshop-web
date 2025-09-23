import React, { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
import { Link } from "react-router-dom";
import {
  FormCheckBox,
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
} from "@mui/material";
import { userLimitedLogin } from "../../core/apis/authAPI";
import { isValidPhoneNumber } from "react-phone-number-input";
import { supportedPrefix } from "../../core/variables/ProjectVariables";
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

  // Simplified schema for authentication only
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

    confirm: yup.boolean().oneOf([true], t("auth.confirmationRequired")).required(),

    verify_by: yup.string().when("$signinType", {
      is: (val) => otp_channel?.length > 1,
      then: (schema) => schema.required(t("auth.selectVerificationMethod")),
      otherwise: (schema) => schema.notRequired(),
    }),
  });


  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phone: "",
      confirm: false,
      verify_by: otp_channel?.[0],
    },
    resolver: yupResolver(schema, { context: { signinType: login_type } }),
    mode: "all",
  });

  const handleSubmitForm = async (payload) => {
    setIsSubmitting(true);
    
    const submissionPayload = {
      verify_by: payload?.verify_by,
      confirm: payload?.confirm,
      [login_type]: payload?.[login_type]?.toLowerCase(),
    };
    
    console.log("Submitting authentication with payload:", submissionPayload);
    
    try {
      const res = await userLimitedLogin(submissionPayload);
      if (res?.data?.status === "success") {
        dispatch(LimitedSignIn({ ...res?.data?.data }));
        console.log("Dispatching LimitedSignIn with data:", res?.data?.data);
        console.log("Login successful, navigate to:", nextUrl);
        
        if (nextUrl) {
          navigate(nextUrl);
        }
      } else {
        toast.error(res?.message);
      }
    } catch (e) {
      toast.error(e?.message || t("checkout.failedToSendMessage"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleSubmitForm)}
      className="flex flex-col gap-6 w-full sm:basis-[50%] shrink-0"
    >
      {/* Authentication Header */}
      <h2 className="text-xl font-bold">{t("auth.authentication")}</h2>

      {/* Phone field - only shown when login_type is phone */}
      {login_type === "phone" && (
        <Controller
          name="phone"
          control={control}
          render={({ field, fieldState }) => (
            <FormPhoneInput
              {...field}
              label={t("auth.phoneNumber")}
              placeholder={t("auth.enterPhoneNumber")}
              helperText={fieldState.error?.message}
            />
          )}
        />
      )}

      {/* OTP Channel Selection - only shown when multiple channels available */}
      {otp_channel?.length > 1 && (
        <Controller
          name="verify_by"
          control={control}
          render={({ field, fieldState }) => (
            <>
              <div className="text-sm font-semibold mb-2">
                {t("auth.selectVerificationMethod")}
              </div>
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
                <FormHelperText error>{fieldState.error.message}</FormHelperText>
              )}
            </>
          )}
        />
      )}

      {/* Terms and Confirmation */}
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
        sx={{ width: "auto", alignSelf: "flex-start" }}
      >
        {isSubmitting ? t("auth.authenticating") : t("auth.authenticate")}
      </Button>
    </form>
  );
};

export default TmpLogin;
