import { Dialog, DialogContent, LinearProgress } from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SuccessfulPaymentSVG } from "../../assets/icons/Payment";

const PaymentCompletion = ({ setOpenOrderDetail }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpenOrderDetail(true);
      //EXPLANATION://we should wait 15 seconds for payment webhook and creation of order in the backenD
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog fullWidth open={true} maxWidth="sm">
      <DialogContent className="flex flex-col items-center justify-center gap-[2rem] text-center !py-10">
        <SuccessfulPaymentSVG />
        <div className={"flex flex-col gap-2"}>
          <h1 className="font-bold">{t("common.hooray")}</h1>
          <p className="text-content-600 font-semibold">
            {t("orders.payment_successfull")}
          </p>
          <p>{t("orders.please_wait_to_fetch_order")}</p>
          <LinearProgress />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentCompletion;
