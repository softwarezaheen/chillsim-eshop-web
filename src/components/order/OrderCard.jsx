import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LanguageIcon from "@mui/icons-material/Language";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WifiIcon from "@mui/icons-material/Wifi";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Skeleton,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { CustomPopover } from "../../assets/CustomComponents";
import { getOrderHistoryById } from "../../core/apis/userAPI";
import { formatValidity } from "../../assets/utils/formatValidity";
import OrderReceipt from "../receipt/OrderReceipt";
import TagComponent from "../shared/tag-component/TagComponent";
const OrderCard = ({ order }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [collapseElement, setCollapseElement] = useState(null);
  const [openOrderReceipt, setOpenOrderReceipt] = useState(false);

  const getOrderTypeIcon = (orderType) => {
    switch (orderType) {
      case "Topup":
        return "/media/esimTopUp.png";
      case "AutoTopup":
        return "/media/esimAutoTopUp.png";
      case "Assign":
      default:
        return "/media/esim.png";
    }
  };

  const getOrderTypeLabel = (orderType) => {
    switch (orderType) {
      case "Topup":
        return t("orders.orderTypeTopup");
      case "AutoTopup":
        return t("orders.orderTypeAutoTopup");
      case "Assign":
      default:
        return t("orders.orderTypeNewEsim");
    }
  };

  const { data: orderDetail, isLoading } = useQuery({
    queryKey: [`${collapseElement}-order-history-id`, collapseElement],
    queryFn: () =>
      getOrderHistoryById(collapseElement).then((res) => res?.data?.data),
    enabled: !!collapseElement,
  });

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const handleClick = (event) => {
    if (order?.bundle_details?.countries?.length === 0) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <Card key={order.order_number || order?.iccid}>
      <CardContent className={"flex flex-col gap-[1rem]"}>
        <div className="flex flex-row justify-between items-start w-full">
          <div className="flex flex-row gap-3 items-center flex-1 min-w-0">
            <Avatar
              src={getOrderTypeIcon(order?.order_type)}
              alt={
                order?.bundle_details?.display_title ||
                order?.bundle_details?.label_name ||
                ""
              }
              sx={{ width: 45, height: 45, display: { xs: 'none', sm: 'flex' } }}
            >
              <img
                src="/media/esim.png"
                className="bg-white"
                alt={
                  order?.bundle_details?.display_title ||
                  order?.bundle_details?.label_name ||
                  ""
                }
              />
            </Avatar>
            <div className="flex flex-col justify-between items-start min-w-0 flex-1">
              <p className="text-xs text-gray-500 hidden sm:block">
                {getOrderTypeLabel(order?.order_type)}
              </p>
              <p className="text-base sm:text-xl font-bold text-primary truncate w-full hidden sm:block">
                <span dir="ltr" className="truncate">
                  {order?.bundle_details?.display_title || order?.bundle_details?.label_name || ""}
                </span>
              </p>
              <p className="text-base font-bold text-primary truncate w-full sm:hidden">
                <span dir="ltr" className="truncate">
                  {order?.bundle_details?.display_title || order?.bundle_details?.label_name || ""}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center flex-shrink-0 gap-2">
            <div className="text-xl font-bold text-end hidden sm:block text-primary whitespace-nowrap">
              {/* <span dir="ltr">{order?.bundle_details?.price_display}</span> */}
              <span dir="ltr">{order?.order_display_price || ""}</span>
            </div>
            <Button
              variant="text"
              size="small"
              onClick={() =>
                setCollapseElement(
                  collapseElement ==
                    (order?.bundle_details?.order_number || order?.order_number)
                    ? null
                    : order?.bundle_details?.order_number || order?.order_number
                )
              }
              endIcon={collapseElement == (order?.bundle_details?.order_number || order?.order_number) ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              sx={{ textTransform: "none", color: "text.secondary" }}
            >
              {t("btn.details")}
            </Button>
          </div>
        </div>

        <div className={"flex flex-wrap flex-row gap-[0.5rem]"}>
          <Chip
            size="small"
            icon={
              <CalendarMonthIcon
                fontSize="small"
                style={
                  localStorage.getItem("i18nextLng") === "ar"
                    ? { marginRight: "6px" }
                    : {}
                }
              />
            }
            label={dayjs
              .unix(order?.order_date || order?.bundle_details?.payment_date)
              .format("MMM D, YYYY")}
            color="secondary"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
          />
          <Chip
            size="small"
            icon={
              <AccessTimeIcon
                style={
                  localStorage.getItem("i18nextLng") === "ar"
                    ? { marginRight: "6px" }
                    : {}
                }
                fontSize="small"
              />
            }
            label={formatValidity(order?.bundle_details?.validity_display)}
            color="secondary"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
          />
          <Chip
            size="small"
            icon={
              <WifiIcon
                style={
                  localStorage.getItem("i18nextLng") === "ar"
                    ? { marginRight: "6px" }
                    : {}
                }
                fontSize="small"
              />
            }
            label={
              <span dir={"ltr"}>
                {order?.bundle_details?.gprs_limit_display}
              </span>
            }
            color="secondary"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
          />
          <Chip
            size="small"
            onClick={handleClick}
            sx={{
              cursor:
                order?.bundle_details?.countries?.length !== 0
                  ? "pointer"
                  : "default",
              fontSize: { xs: '0.75rem', sm: '0.8125rem' }
            }}
            aria-describedby={id}
            icon={
              <LanguageIcon
                style={
                  localStorage.getItem("i18nextLng") === "ar"
                    ? { marginRight: "6px" }
                    : {}
                }
              />
            }
            label={
              <span dir={"ltr"}>
                {`${order?.bundle_details?.countries?.length} ${t(
                  "btn.countries"
                )}`}
              </span>
            }
            color="secondary"
          />
          {open && (
            <CustomPopover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              sx={{
                mb: 1.5,
              }}
            >
              <div
                className={
                  "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6"
                }
              >
                {order?.bundle_details?.countries?.map((country) => (
                  <div className={"flex flex-row gap-[0.5rem]"}>
                    <Avatar
                      src={country?.icon}
                      alt={country?.country || "country-flag"}
                      sx={{ width: 25, height: 25 }}
                    />
                    {country?.country || t("common.notAvailable")}
                  </div>
                ))}
              </div>
            </CustomPopover>
          )}
        </div>

        {/* Mobile-only row: order type + price */}
        <div className="flex sm:hidden flex-row justify-between items-center">
          <p className="text-xs text-gray-500">
            {getOrderTypeLabel(order?.order_type)}
          </p>
          <div className="text-xl font-bold text-primary whitespace-nowrap">
            <span dir="ltr">{order?.order_display_price || ""}</span>
          </div>
        </div>

        <Collapse
          in={
            collapseElement ==
            (order?.bundle_details?.order_number || order?.order_number)
          }
        >
          <div className={"flex flex-col gap-[1rem]"}>
            {" "}
            <hr />
            <div
              className={
                "flex flex-row flex-wrap justify-between items-center gap-[1rem] sm:gap-[3rem]"
              }
            >
              <div className={"flex flex-col gap-[0.5rem]"}>
                <label className={"font-semibold"}>
                  {t("orders.order_id")}
                </label>
                <p>{order?.order_number}</p>
              </div>
              <div className={"flex flex-col gap-[0.5rem]"}>
                <label className={"font-semibold"}>
                  {t("orders.order_status")}
                </label>
                <TagComponent value={order?.order_status} />
              </div>
              {order?.payment_type === "Card" && (
                <div className={"flex flex-col gap-[0.5rem]"}>
                  <label className={"font-semibold"}>
                    {t("orders.payment_details")}
                  </label>
                  <p>
                    {isLoading ? (
                      <Skeleton width={50} />
                    ) : (
                      orderDetail?.payment_details?.card_display || "N/A"
                    )}
                  </p>
                </div>
              )}

              <Button
                onClick={() => setOpenOrderReceipt(true)}
                sx={{ width: "200px" }}
                variant="outlined"
                color="primary"
                startIcon={
                  <ReceiptLongIcon
                    style={
                      localStorage.getItem("i18nextLng") === "ar"
                        ? { marginLeft: "8px" }
                        : {}
                    }
                  />
                }
              >
                {t("btn.view_receipt")}
              </Button>
            </div>
          </div>
        </Collapse>
        {openOrderReceipt && (
          <OrderReceipt
            order={orderDetail}
            isLoading={isLoading}
            onClose={() => setOpenOrderReceipt(false)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;