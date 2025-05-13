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
import { Button, Card, CardContent, Tooltip } from "@mui/material";
import { updateUserInfo } from "../../core/apis/authAPI";
import { UpdateAuthInfo } from "../../redux/reducers/authReducer";
import { getActiveCurrencies } from "../../core/apis/configurationsAPI";
import { useQuery } from "react-query";
import { UpdateCurrency } from "../../redux/reducers/currencyReducer";
import { Info } from "@mui/icons-material";
import { queryClient } from "../../main";

const schema = yup.object().shape({
  email: yup.string().email().required().nullable(),
  first_name: yup
    .string()
    .label("First name")
    .required()
    .matches(/^[A-Za-z\s]+$/, "Only letters are allowed")
    .nullable()
    .max(60),
  last_name: yup
    .string()
    .label("Last name")
    .required()
    .matches(/^[A-Za-z\s]+$/, "Only letters are allowed")
    .nullable()
    .max(60),
  msisdn: yup
    .string()
    .label("Phone number")
    .nullable()
    .test("is-valid-phone", "Invalid phone number", (value) => {
      if (!value) return true;
      return isValidPhoneNumber(value);
    }),
  should_notify: yup.bool(),
  default_currency: yup.object().nullable(),
});

const Profile = () => {
  const dispatch = useDispatch();
  const { user_info } = useSelector((state) => state.authentication);
  const system_currency = useSelector(
    (state) => state.currency?.system_currency
  );

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
      first_name: user_info?.first_name || "",
      last_name: user_info?.last_name || "",
      should_notify: user_info?.should_notify || false,
      user_currency: null,
    },
    resolver: yupResolver(schema),
    mode: "all",
  });

  const handleSubmitForm = (payload) => {
    setIsSubmitting(true);
    updateUserInfo({
      ...payload,
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
            ? "Information Updated Successfully"
            : "Failed to update user info"
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  useEffect(() => {
    reset({
      email: user_info?.email,
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
        <h1>Account Information</h1>
        <Card>
          <CardContent className={"flex flex-col gap-[1rem]"}>
            {" "}
            <div
              className={
                "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-[1rem]"
              }
            >
              <div>
                <label>Email</label>
                <Controller
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <FormInput
                      disabled
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
              <div>
                <label>First Name</label>
                <Controller
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <FormInput
                      placeholder={"Enter first name"}
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
                <label>Last Name</label>
                <Controller
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <FormInput
                      placeholder={"Enter last name"}
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
                <label>Phone Number</label>
                <Controller
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <FormPhoneInput
                      value={value}
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
                  Default Currency{" "}
                  <Tooltip
                    title={`If no default currency is specified, the system will fall back to using ${system_currency} as the default currency.`}
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
                      placeholder={"Select default currency"}
                      onChange={(value) => onChange(value)}
                    />
                  )}
                  name="user_currency"
                  control={control}
                />
              </div>
            </div>
            <div className={"flex flex-row"}>
              <Controller
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <FormSwitch
                    label={
                      "Receive update about our services, news, and offers by email"
                    }
                    disabled
                    placeholder={"Enter email"}
                    value={value}
                    helperText={error?.message}
                    onChange={(value) => onChange(value)}
                  />
                )}
                name="should_notify"
                control={control}
              />
            </div>
            <div className={"flex flex-row gap-[1rem] items-end justify-end "}>
              <Button
                variant={"contained"}
                color="secondary"
                disabled={!isDirty}
                sx={{ width: "150px" }}
                onClick={() => reset()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !isDirty}
                variant={"contained"}
                color="primary"
                sx={{ width: "150px" }}
              >
                {isSubmitting ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default Profile;
