//UTILITIES
import React from "react";
import { useTranslation } from "react-i18next";
//COMPONENT
import { Check, Close } from "@mui/icons-material";
import { Button, Dialog, DialogContent, IconButton } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Link } from "react-router-dom";

const BundleExistence = ({ onClose, bundle }) => {
  const { t } = useTranslation();
  return (
    <Dialog fullWidth open={true} maxWidth={"sm"}>
      <DialogContent className={"flex flex-col gap-6 "}>
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
        <div
          className={
            "flex flex-col gap-[1rem] justify-center items-center text-center"
          }
        >
          <CheckCircleIcon fontSize="large" color="primary" />
          <h6>{t("bundle.bundle_existence_title")}</h6>
          <p className={"text-content-600"}>
            {t("bundle.bundle_existence_text")}
          </p>

          <Button
            component={Link}
            to={`/checkout/${bundle?.bundle_code}`}
            className={"max-w-xs"}
            variant={"contained"}
            color="primary"
          >
            {t("btn.buy_new_esim")}
          </Button>
          <Button
            component={Link}
            to={"/esim"}
            variant={"contained"}
            color="secondary"
            className={"max-w-xs"}
          >
            {t("btn.top_up_existing_esim")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BundleExistence;
