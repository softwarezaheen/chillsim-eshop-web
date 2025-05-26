//UTILTIIES
import React from "react";
import { useTranslation } from "react-i18next";
import { Close } from "@mui/icons-material";

//COMPONENT
import { Dialog, DialogContent, IconButton } from "@mui/material";
import BundleList from "../bundle/BundleList";
import { useSelector } from "react-redux";

const OrderTopup = ({ onClose, bundle }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={true} maxWidth="lg" fullWidth>
      <DialogContent className="flex flex-col gap-[1rem] xs:!px-8 !py-10 min-w-[200px]">
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
        <div className={"mt-2 flex flex-col gap-[1rem]"}>
          <h1 className={"text-center"}>{t("orders.top_up_plan")}</h1>
          <p className={"text-center text-primary font-semibold"}>
            {t("orders.top_up_plan_text")}
          </p>
          <BundleList bundleOrder={bundle} topup />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderTopup;
