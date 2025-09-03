import { Close } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import NoDataFound from "../shared/no-data-found/NoDataFound";
import { useSelector } from "react-redux";

const getEuroPrice = (displayPrice) => {
  const match = String(displayPrice).match(/[\d.]+/);
  const price = match ? parseFloat(match[0]) : 0;
  return (price).toFixed(2) + " EUR";
};

const getEuroPriced = (displayPrice) => {
  const match = String(displayPrice).match(/[\d.]+/);
  const price = match ? parseFloat(match[0]) : 0;
  return price;
};

const getStripedFee = (displayPrice) => {
  const match = String(displayPrice).match(/[\d.]+/);
  const price = match ? parseFloat(match[0]) : 0;
  const fee = ((price) * 0.84173) * 0.012 + 0.25 / 0.84173;
  if (fee < 0.5) {
    return 0.5;
  }
  else 
    if (fee < 1) {
      return 1;
    }
    else
      if (fee < 1.5) {
        return 1.5;
      }
      else
        if (fee < 2) {
          return 2;
        }
        else
          if (fee < 2.5) {
            return 2.5 ;
          }
          else
            return 3;
};

const getTaxValue = (displayPrice) => {
  const match = String(displayPrice).match(/[\d.]+/);
  const price = match ? parseFloat(match[0]) : 0;
  const fee = getStripedFee(displayPrice);
  return ((price + fee) * 0.21).toFixed(2) + " EUR";
};

const getTaxedValue = (displayPrice) => {
  const match = String(displayPrice).match(/[\d.]+/);
  const price = match ? parseFloat(match[0]) : 0;
  const fee = getStripedFee(displayPrice);
  return (price + fee) * 0.21;
};

const getStripeFee = (displayPrice) => {
  const match = String(displayPrice).match(/[\d.]+/);
  const price = match ? parseFloat(match[0]) : 0;
  const fee = (((price) * 0.84173) * 0.012 + 0.25 / 0.84173).toFixed(2);
  if (fee < 0.5) {
    return "0.50 EUR";
  }
  else 
    if (fee < 1) {
      return "1.00 EUR";
    }
    else
      if (fee < 1.5) {
        return "1.50 EUR";
      }
      else
        if (fee < 2) {
          return "2.00 EUR";
        }
        else
          if (fee < 2.5) {
            return "2.50 EUR";
          }
          else
            return "3.00 EUR";
};

const getPartialValue = (displayPrice) => {
  const match = String(displayPrice).match(/[\d.]+/);
  const price = match ? parseFloat(match[0]) : 0;
  const fee = getStripedFee(displayPrice);
  return (price + fee).toFixed(2) + " EUR";
};

const getTotalValue = (displayPrice) => {
  const match = String(displayPrice).match(/[\d.]+/);
  const price = match ? parseFloat(match[0]) : 0;
  const tax = getTaxedValue(displayPrice);
  const fee = getStripedFee(displayPrice);
  return (price + tax + fee).toFixed(2) + " EUR";
};

const OrderReceipt = ({ order, onClose, isLoading }) => {
  const { t } = useTranslation();

  const orderDisplay = useMemo(() => {
    if (!order) return {};

    return {
      [t("orders.companyName")]: order.company_name,
      [t("orders.address")]: order.company_address,
      [t("orders.email")]: order.company_email,
      [t("orders.orderId")]: order.order_number,
      [t("orders.orderType")]: order.order_type,
    };
  }, [order, t]);

  return (
    <Dialog fullWidth open={true} maxWidth={"md"} onClose={onClose}>
      <DialogContent className={"flex flex-col gap-[1rem]"}>
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
        <div>
          <img src={"/logo/logo.png"} className={"mt-2 h-16"} />
        </div>
        {isLoading || (!isLoading && order) ? (
          <>
            {Object.keys(orderDisplay)?.map((orderElement, index) => (
              <div key={index} className={"flex flex-col gap-[1rem]"}>
                <div className={"flex flex-col gap-[0.5rem]"}>
                  <label className={"text-title"}>{orderElement}</label>
                  <p className={"text-primary font-bold break-words"}>
                    {isLoading ? (
                      <Skeleton width={100} />
                    ) : (
                      orderDisplay?.[orderElement] || t("common.notAvailable")
                    )}
                  </p>
                </div>

                <hr />
              </div>
            ))}
            <label className={"text-title"}>{t("checkout.summary")}</label>
            <TableContainer
              component={Paper}
              sx={{ boxShadow: "none", minHeight: "110px" }}
            >
              <Table sx={{ border: "1px solid black" }} dir="ltr">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {t("orders.qty")}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {t("orders.product")}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {t("orders.unitPrice")}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {t("orders.fees")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {isLoading ? <Skeleton width={50} /> : order?.quantity}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {isLoading ? (
                        <Skeleton width={50} />
                      ) : (
                        order?.bundle_details?.display_title
                      )}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {isLoading ? (
                        <Skeleton width={50} />
                      ) : (
                        order?.order_display_price
                      )}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {isLoading ? (
                        <Skeleton width={50} />
                      ) : (
                        getStripeFee(order?.order_display_price)
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <div
              className={
                "flex flex-col gap-[0.5rem] font-bold items-end text-primary"
              }
            >
              <p>
                {t("orders.tax")}{" "}
                {isLoading ? (
                  <Skeleton width={50} />
                ) : (
                  getTaxValue(order?.order_display_price)
                )}
              </p>
              <p>
                {t("orders.finalPrice")}{" "}
                {isLoading ? (
                  <Skeleton width={50} />
                ) : (
                  getTotalValue(order?.order_display_price)
                )}
              </p>
            </div>
          </>
        ) : (
          <NoDataFound text={t("orders.failedToLoadOrderReceiptDetails")} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderReceipt;
