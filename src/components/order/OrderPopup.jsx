//UTILITIES
import React, { useEffect } from "react";
import QRCode from "react-qr-code";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

//API
import { getOrderByID } from "../../core/apis/userAPI";
//COMPONENT
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import NoDataFound from "../shared/no-data-found/NoDataFound";
import { Close } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Skeleton,
} from "@mui/material";
import { Link } from "react-router-dom";

const OrderPopup = ({ id, onClose, orderData }) => {
  const { t } = useTranslation();
  const { isAuthenticated, user_info, tmp } = useSelector(
    (state) => state.authentication
  );

  const { data, isLoading, error } = useQuery({
    queryKey: [`${user_info?.id}-order-${id}`],
    queryFn: () => getOrderByID(id).then((res) => res?.data?.data),
    enabled: !!id,
  });

  useEffect(() => {
    //   //close popup if 401
    if (!isAuthenticated && !tmp?.isAuthenticated) {
      onClose();
    }
  }, []);

  console.log(data, "dataaaaaaaaaaaaaaaaaaa", error);
  return (
    <Dialog open={true} maxWidth="sm">
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
        <h1 className={"text-center"}>{t("orders.qrcode_detail")}</h1>
        <p className={"text-center text-content-600 font-medium"}>
          {t("orders.qrcode_sent_text")}
        </p>
        {isLoading || (!isLoading && (data || orderData)) ? (
          <>
            <div
              className={
                "bg-primary-50 p-4 rounded-2xl flex items-center justify-center shadow-sm"
              }
            >
              <div
                className={
                  "bg-white p-2 flex items-center justify-center w-[200px] h-[200px] rounded-md shadow-sm"
                }
              >
                {isLoading ? (
                  <Skeleton variant="rectangle" width={100} height={100} />
                ) : orderData?.qr_code_value || data?.qr_code_value ? (
                  <QRCode
                    size={100}
                    style={{ height: "150px", width: "150px" }}
                    value={data?.qr_code_value || orderData?.qr_code_value}
                    viewBox={`0 0 256 256`}
                  />
                ) : (
                  <NoDataFound text="QR code not generated" />
                )}
              </div>
            </div>
            <div className={"flex flex-col gap-[0.5rem]"}>
              <label className={"font-semibold"}>SM-DP+ Address</label>
              <div
                className={
                  "flex flex-row justify-between items-center bg-white shadow-sm p-[0.8rem] rounded-md"
                }
              >
                <p className={"font-medium text-content-500 truncate "}>
                  {isLoading ? (
                    <Skeleton width={100} />
                  ) : (
                    data?.smdp_address || orderData?.smdp_address
                  )}
                </p>
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(
                      data?.smdp_address || orderData?.smdp_address
                    );
                    toast.success("Copied Successfully");
                  }}
                >
                  <ContentCopyIcon fontSize="small" color="primary" />
                </IconButton>
              </div>
            </div>
            <div className={"flex flex-col gap-[0.5rem]"}>
              <label className={"font-semibold"}>Activate Code</label>
              <div
                className={
                  "flex flex-row justify-between items-center bg-white shadow-sm p-[0.8rem] rounded-md"
                }
              >
                <p className={"font-medium text-content-500 truncate"}>
                  {isLoading ? (
                    <Skeleton width={100} />
                  ) : (
                    orderData?.activation_code || data?.activation_code
                  )}
                </p>
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(
                      orderData?.activation_code || data?.activation_code
                    );
                    toast.success("Copied Successfully");
                  }}
                >
                  <ContentCopyIcon fontSize="small" color="primary" />
                </IconButton>
              </div>
            </div>{" "}
          </>
        ) : (
          <NoDataFound
            text={`Failed to load order data.${
              !isAuthenticated ? " Please sign in to check more details" : ""
            } `}
          />
        )}
        {!isAuthenticated && (
          <Button
            variant="contained"
            color="primary"
            to={"/signin"}
            component={Link}
          >
            {t("btn.signin_signup")}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderPopup;
