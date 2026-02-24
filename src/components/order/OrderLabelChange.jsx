//UTILITIES
import React, { useState } from "react";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
//COMPONENT
import { Button, Dialog, DialogContent, IconButton } from "@mui/material";
import { FormInput } from "../shared/form-components/FormComponents";
import { updateBundleLabelByIccid } from "../../core/apis/userAPI";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Close } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { queryClient } from "../../main";

const schema = ({ t }) =>
  yup.object().shape({
    label: yup
      .string()
      .label("Label")
      .max(
        30,
        t("errors.maxCharacter", {
          field: t("label.bundle_name"),
          character: 60,
        })
      )
      .required()
      .nullable(),
  });

const OrderLabelChange = ({ refetch, onClose, bundle }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      label: bundle?.display_title,
    },
    resolver: yupResolver(schema({ t })),
    mode: "all",
  });

  const handleSubmitForm = async (payload) => {
    console.log(bundle, "vvvvv");
    setIsSubmitting(true);

    updateBundleLabelByIccid({ ...payload, code: bundle?.iccid })
      .then((res) => {
        if (res?.data?.status === "success") {
          toast.success(t("contactUs.messageSentSuccessfully"));
          onClose();
          refetch();
          queryClient.invalidateQueries({
            queryKey: [`my-esim`],
          });
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
  return (
    <Dialog open={true} maxWidth="sm" fullWidth>
      <DialogContent className="flex flex-col gap-[1rem] xs:!px-8 !py-10 ">
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
        <form
          className={"mt-2 flex flex-col gap-[1rem]"}
          onSubmit={handleSubmit(handleSubmitForm)}
        >
          <h1 className={"text-center"}>{t("orders.edit_name")}</h1>
          <div className={"label-input-wrapper"}>
            <label>{t("label.bundle_name")}</label>
            <Controller
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <FormInput
                  placeholder={t("label.enterName")}
                  value={value}
                  helperText={error?.message}
                  onChange={(value) => onChange(value)}
                />
              )}
              name="label"
              control={control}
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            variant={"contained"}
            sx={{ width: "fit-content", alignSelf: "center" }}
            color="primary"
          >
            {t("btn.save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderLabelChange;
