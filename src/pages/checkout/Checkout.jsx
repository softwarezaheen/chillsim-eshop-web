//UTILITIES
import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
//API
import { userLimitedLogin } from "../../core/apis/authAPI";
import { getBundleById } from "../../core/apis/bundlesAPI";
//REDUCER
import {
  LimitedSignIn,
  LimitedSignOut,
} from "../../redux/reducers/authReducer";
//COMPONENT
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  FormCheckBox,
  FormInput,
} from "../../components/shared/form-components/FormComponents";
import { Button, Link, Skeleton } from "@mui/material";
import { StripePayment } from "../../components/stripe-payment/StripePayment";

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

const Checkout = () => {
  const { isAuthenticated, tmp } = useSelector((state) => state.authentication);
  const { id } = useParams();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const { data, isLoading, error } = useQuery({
    queryKey: [`${id}-details`],
    queryFn: () => getBundleById(id).then((res) => res?.data?.data),
    enabled: !!id,
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
      confirm: false,
    },
    resolver: yupResolver(schema),
    mode: "all",
  });

  const handleSubmitForm = async (payload) => {
    setIsSubmitting(true);
    userLimitedLogin({
      ...payload,
    })
      .then((res) => {
        if (res?.data?.status === "success") {
          dispatch(LimitedSignIn({ ...res?.data?.data }));
        } else {
          toast.error(res?.message);
        }
      })
      .catch((e) => {
        toast?.error(e?.message || "Failed to send message");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  const confirmed = useMemo(() => {
    return isAuthenticated || tmp?.isAuthenticated;
  }, [isAuthenticated, tmp]);

  return (
    <div
      className={
        "flex flex-col gap-4 w-full max-w-xxl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16"
      }
    >
      <div
        className={
          "flex flex-row gap-2 items-center font-semibold cursor-pointer"
        }
        onClick={() => {
          navigate(-1);
          dispatch(LimitedSignOut());
        }}
      >
        <ArrowBackIosNewIcon color="primary" fontSize="small" /> Go Back
      </div>

      <div
        className={
          "flex flex-col-reverse items-start gap-4 w-full sm:flex-row sm:items-start sm:gap-4 sm:w-full"
        }
      >
        {isLoading ? (
          <div className={"w-full sm:basis-[50%] shrink-0"}>
            {Array(2)
              .fill()
              ?.map((_, index) => (
                <Skeleton
                  variant="rectangular"
                  height={150}
                  key={`checkout-skeleton-${index}`}
                />
              ))}
          </div>
        ) : // :!data || error ? (
        //   <div className={"w-full sm:basis-[50%] items-center justify-center"}>
        //     <NoDataFound text={"Failed to load bunde checkout info"} />
        //   </div>)
        !confirmed ? (
          <form
            onSubmit={handleSubmit(handleSubmitForm)}
            className={"flex flex-col gap-8 w-full sm:basis-[50%] shrink-0"}
          >
            <div className={"flex flex-col gap-[1rem]"}>
              <div>
                <label
                  htmlFor="email"
                  className="block font-medium text-gray-700 mb-2"
                >
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
                          I confirm that the above email is valid and does not
                          contain any typos.
                        </div>
                        <div>
                          And I accept the{" "}
                          <Link
                            rel="noopener noreferrer"
                            target="_blank"
                            color="secondary"
                            href="/terms"
                            underline="none"
                          >
                            Terms & Conditions
                          </Link>{" "}
                          and I understand that the product only work with eSIM
                          compatible and carrier-unlocked devices.
                        </div>
                      </div>
                    }
                  />
                )}
                name="confirm"
                control={control}
              />
            </div>
            <div className={"flex flex-row justify-center sm:justify-start "}>
              <Button
                disabled={isSubmitting}
                color="primary"
                type="submit"
                variant="contained"
                sx={{ width: "30%" }}
              >
                Confirm
              </Button>
            </div>
          </form>
        ) : (
          <StripePayment bundle={data} />
        )}
        <div
          className={
            "bg-primary-50 p-4 rounded-2xl flex flex-col gap-8 w-full sm:basis-[50%] shadow-sm grow-0 min-w-0"
          }
        >
          <h1 className={"font-bold text-2xl"}>Summary</h1>
          <div className={"flex flex-col gap-2 min-w-0"}>
            <div
              className={
                "flex flex-row justify-between items-start gap-[1rem] min-w-0"
              }
            >
              <label className={"flex-1 font-semibold"}>Bundle Name</label>
              <p className={"flex-1 font-bold text-end truncate"}>
                {data?.display_title || "N/A"}
              </p>
            </div>
            <div
              className={"flex flex-row justify-between items-start gap-[1rem]"}
            >
              <label className={"flex-1 font-semibold"}>Subtotal</label>
              <p className={"flex-1 font-bold text-end"}>
                {data?.price_display}
              </p>
            </div>
            <div
              className={"flex flex-row justify-between items-start gap-[1rem]"}
            >
              <label className={"flex-1 font-semibold"}>Estimated Tax</label>
              <p className={"flex-1 font-bold text-end"}>---</p>
            </div>
          </div>
          <hr />
          <div
            className={"flex flex-row justify-between items-start gap-[1rem]"}
          >
            <label className={"font-semibold"}>Total</label>
            <p className={"font-bold text-2xl"}>{data?.price_display}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
