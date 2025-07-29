import { yupResolver } from "@hookform/resolvers/yup";
import { Close } from "@mui/icons-material";
import { Button, Dialog, IconButton } from "@mui/material";
import { deleteToken } from "firebase/messaging";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import * as yup from "yup";
import { messaging } from "../../../firebaseconfig";
import { DeleteAccountSVG } from "../../assets/icons/Common";
import { deleteAccount } from "../../core/apis/authAPI";
import { queryClient } from "../../main";
import { SignOut } from "../../redux/reducers/authReducer";
import { FormInput } from "../shared/form-components/FormComponents";

const schema = yup.object().shape({
  email: yup.string().email().required().nullable(),
});

const DeleteAccountPopup = ({ onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
    },
    resolver: yupResolver(schema),
    mode: "all",
  });

  const handleSubmitForm = async (payload) => {
    setIsSubmitting(true);

    deleteAccount({ ...payload })
      .then((res) => {
        if (res?.data?.status === "success") {
          toast.success("Account Deleted Successfully");
          dispatch(SignOut());
          queryClient.clear();
          deleteToken(messaging);
        } else {
          toast.error(res?.message);
        }
      })
      .catch((e) => {
        toast?.error(e?.message || "Failed to delete account");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Dialog open={true} maxWidth="sm">
      <form
        className="flex flex-col gap-[1rem] p-4 sm:p-10 xs:!px-8 !py-10 min-w-[200px] max-w-[500px]"
        onSubmit={handleSubmit(handleSubmitForm)}
      >
        <div className={"flex flex-row justify-end"}>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={() =>
              localStorage.getItem("i18nextLng") === "ar"
                ? {
                    position: "absolute",
                    left: 8,
                    top: 8,
                    color: "black",
                  }
                : {
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: "black",
                  }
            }
          >
            <Close />
          </IconButton>
        </div>
        <div className={"mt-2 flex flex-col items-center gap-[1rem]"}>
          <DeleteAccountSVG />
          <h1>{t("account.delete_account")}</h1>
          <p className={"text-primary text-center"}>
            {t("account.delete_account_paragraph")}
          </p>
          <p className={"text-content-600 text-center"}>
            {t("account.delete_account_confirmation")}
          </p>
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <Controller
            render={({ field: { onChange, value }, fieldState: { error } }) => (
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
        <Button variant="contained" color="secondary" type="submit">
          {t("btn.delete")}
        </Button>
      </form>
    </Dialog>
  );
};

export default DeleteAccountPopup;
