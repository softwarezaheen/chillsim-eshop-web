import { Close } from "@mui/icons-material";
import { Button, Dialog, DialogContent, IconButton } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FormInput } from "../shared/form-components/FormComponents";

const OrderShare = ({ onClose }) => {
  const { t } = useTranslation();
  return (
    <Dialog open={true} maxWidth="md">
      <DialogContent className="flex flex-col gap-[1rem] xs:!px-8 !py-10 min-w-[200px] max-w-[500px]">
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
        <div className={"flex flex-col gap-[1rem]"}>
          <h1 className={"text-center"}>{t("orders.share_your_bundle")}</h1>
          <p className={"text-center text-primary"}>
            {t("orders.share_your_bundle_text")}
          </p>
          <div className={"label-input-wrapper"}>
            <label>{t("label.link")}</label>
            <FormInput value={"https://google.com"} disabled />
          </div>
          <Button
            variant={"contained"}
            sx={{ width: "fit-content", alignSelf: "center" }}
            color="secondary"
            onClick={() => {
              navigator.clipboard.writeText("https://google.com");
              toast.success("Copied Successfully");
            }}
          >
            {t("btn.copy_link")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderShare;
