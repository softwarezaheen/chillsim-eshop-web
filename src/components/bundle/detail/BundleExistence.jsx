//UTILITIES
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
//COMPONENT
import { Check, Close } from "@mui/icons-material";
import { Button, Dialog, DialogContent, IconButton, CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { hasBillingInfo } from "../../../core/apis/userAPI";

const BundleExistence = ({ onClose, bundle }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);

  const handleBuyNewEsim = async () => {
    setIsChecking(true);
    try {
      const hasCompleteBilling = await hasBillingInfo();
      const checkoutPath = `/checkout/${bundle?.bundle_code}`;
      
      if (hasCompleteBilling) {
        navigate(checkoutPath);
      } else {
        navigate(`/billing?next=${encodeURIComponent(checkoutPath)}`);
      }
    } catch (error) {
      // Fallback to billing page on error
      navigate(`/billing?next=${encodeURIComponent(`/checkout/${bundle?.bundle_code}`)}`);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Dialog fullWidth open={true} maxWidth={"sm"}>
      <DialogContent className={"flex flex-col gap-6 "}>
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
        <div
          className={
            "mt-2 flex flex-col gap-[1rem] justify-center items-center text-center"
          }
        >
          <CheckCircleIcon fontSize="large" color="primary" />
          <h6>{t("bundle.bundle_existence_title")}</h6>
          <p className={"text-content-600"}>
            {t("bundle.bundle_existence_text")}
          </p>

          <Button
            onClick={handleBuyNewEsim}
            disabled={isChecking}
            className={"max-w-xs"}
            variant={"contained"}
            color="primary"
          >
            {isChecking ? <CircularProgress size={24} color="inherit" /> : t("btn.buy_new_esim")}
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
