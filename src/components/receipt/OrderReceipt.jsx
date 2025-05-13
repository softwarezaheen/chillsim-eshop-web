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

const OrderReceipt = ({ order, onClose, isLoading }) => {
  const { t } = useTranslation();
  const orderDisplay = useMemo(() => {
    return {
      "Company Name": order?.company_name,
      Address: order?.payment_details?.address,
      Email: order?.payment_details?.receipt_email,
      "Order ID": order?.order_number,
      "Payment Details": order?.payment_details?.card_display,
      "Order Type": order?.order_type,
    };
  }, [order]);

  return (
    <Dialog fullWidth open={true} maxWidth={"md"} onClose={onClose}>
      <DialogContent className={"flex flex-col gap-[1rem]"}>
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
        <div>
          <img src={"/logo/logo.png"} className={"h-16"} />
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
                      orderDisplay?.[orderElement] || "N/A"
                    )}
                  </p>
                </div>

                <hr />
              </div>
            ))}
            <label className={"text-title"}>Summary</label>
            <TableContainer
              component={Paper}
              sx={{ boxShadow: "none", minHeight: "110px" }}
            >
              <Table sx={{ border: "1px solid black" }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ border: "1px solid black" }}>
                      Qty
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      Product
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      Unit Price
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      Amount
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
                        order?.bundle_details?.price_display
                      )}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {isLoading ? (
                        <Skeleton width={50} />
                      ) : (
                        order?.order_display_price
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
                Total Price:{" "}
                {isLoading ? (
                  <Skeleton width={50} />
                ) : (
                  order?.order_display_price
                )}
              </p>
              <p>
                Final Price:{" "}
                {isLoading ? (
                  <Skeleton width={50} />
                ) : (
                  order?.order_display_price
                )}
              </p>
            </div>
          </>
        ) : (
          <NoDataFound text={"Failed to load order receipt details"} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderReceipt;
