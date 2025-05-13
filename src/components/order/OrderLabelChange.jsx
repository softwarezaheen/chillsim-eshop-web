//UTILITIES
import React, { useState } from "react";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
//COMPONENT
import { Button, Dialog, DialogContent, IconButton } from "@mui/material";
import { FormInput } from "../shared/form-components/FormComponents";
import { updateBundleLabel } from "../../core/apis/userAPI";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Close } from "@mui/icons-material";

const schema = yup.object().shape({
  label: yup.string().label("Label").max(30).required().nullable(),
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
      label: bundle?.label_name || bundle?.display_title,
    },
    resolver: yupResolver(schema),
    mode: "all",
  });

  const handleSubmitForm = async (payload) => {
    console.log(bundle, "vvvvv");
    setIsSubmitting(true);

    updateBundleLabel({ ...payload, code: bundle?.bundle_code })
      .then((res) => {
        if (res?.data?.status === "success") {
          toast.success("Your message has been sent successfully!");
          onClose();
          refetch();
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
            sx={(theme) => ({
              position: "absolute",
              right: 8,
              top: 8,
              color: "black",
            })}
          >
            <Close />
          </IconButton>
        </div>
        <form
          className={"flex flex-col gap-[1rem]"}
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
                  placeholder={"Enter name"}
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
