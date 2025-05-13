import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import dayjs from "dayjs";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Skeleton,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import AddToPhotosOutlinedIcon from "@mui/icons-material/AddToPhotosOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import ShareIcon from "@mui/icons-material/Share";
import { CustomPopover } from "../../assets/CustomComponents";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LanguageIcon from "@mui/icons-material/Language";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WifiIcon from "@mui/icons-material/Wifi";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useQuery } from "react-query";
import { getOrderHistoryById } from "../../core/apis/userAPI";
import TagComponent from "../shared/tag-component/TagComponent";
import OrderReceipt from "../receipt/OrderReceipt";
import OrderConsumption from "./OrderConsumption";
import OrderShare from "./OrderShare";
import OrderPopup from "./OrderPopup";
import OrderTopup from "./OrderTopup";
import { Edit } from "@mui/icons-material";
import OrderLabelChange from "./OrderLabelChange";
import NoDataFound from "../shared/no-data-found/NoDataFound";

const OrderCard = ({ order, myesim, refetchData }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [collapseElement, setCollapseElement] = useState(null);
  const [openOrderReceipt, setOpenOrderReceipt] = useState(false);
  const [openConsumption, setOpenConsumption] = useState(false);
  const [openQRCode, setOpenQRCode] = useState(false);
  const [openTopUp, setOpenTopUp] = useState(false);
  const [openLabelChange, setOpenLabelChange] = useState(false);

  const {
    data: orderDetail,
    isLoading,
    error,
  } = useQuery({
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

  const esimDetails = [
    {
      title: "purchase_date",
      field: "payment_date",
      type: "date",
    },
    {
      title: "iccid number",
      field: "iccid",
    },
    { title: "order_id", field: "order_number" },
  ];

  const transactionHeaders = [
    "Amount",
    "Type",
    "Validity",
    "Data",
    "Order ID",
    "Purchase Date",
  ];

  const test = [
    {
      user_order_id: "dee75030-2015-415f-9be7-a81963fd12fe",
      iccid: "67005751370677599761",
      bundle_type: "Primary Bundle",
      plan_started: false,
      bundle_expired: false,
      created_at: "1742546922",
      bundle: {
        display_title: "The World is Yours!",
        display_subtitle: "The World is Yours!",
        bundle_code: "4a054dfa-a36d-48b0-bd5c-7dc9b7887805",
        bundle_category: {
          type: "COUNTRY",
          title: "Country",
          code: "de314467-623c-4256-a18a-d8d94f67c410",
        },
        bundle_region: [],
        bundle_marketing_name: "The World is Yours!",
        bundle_name: "The World is Yours!",
        count_countries: 1,
        currency_code: "EUR",
        gprs_limit_display: "1 GB",
        price: 2,
        price_display: "2 EUR",
        unlimited: false,
        validity: 1,
        plan_type: "Data only",
        activity_policy:
          "The validity period starts when the eSIM connects to any supported networks.",
        validity_display: "1 Day",
        countries: [
          {
            id: "dc30e33d-38d7-4f53-8495-fe3702c0b19d",
            alternative_country: "Austria",
            country: "Austria",
            country_code: "Unknown",
            iso3_code: "AUT",
            zone_name: "Unknown",
            icon: "https://bloexfogutsvlprzkyhv.supabase.co/storage/v1/object/public/media/country/aut.png",
            operator_list: null,
          },
        ],
        icon: "https://bloexfogutsvlprzkyhv.supabase.co/storage/v1/object/public/media/country/aut.png",
        label: null,
      },
    },
  ];

  return (
    <Card key={order.order_number || order?.iccid}>
      <CardContent className={"flex flex-col gap-[1rem]"}>
        <div className="flex flex-row justify-between items-start w-full">
          <div className="flex flex-row gap-6 items-center flex-1 min-w-0">
            <Avatar
              src={order?.bundle_details?.icon}
              alt={
                order?.bundle_details?.display_title ||
                order?.bundle_details?.label_name ||
                ""
              }
              sx={{ width: 45, height: 45 }}
            >
              {/* fallback image */}
              <img
                src={"/media/global.svg"}
                className={"bg-white"}
                alt={
                  order?.bundle_details?.display_title ||
                  order?.bundle_details?.label_name ||
                  ""
                }
              />
            </Avatar>
            <div className="flex flex-col justify-between items-start min-w-0 flex-1">
              <div className="w-full overflow-hidden">
                <p className="text-xl font-bold text-primary truncate w-full flex items-center gap-[0.2rem]">
                  <span className="truncate">
                    {order?.bundle_details?.display_title ||
                      order?.bundle_details?.label_name ||
                      ""}{" "}
                  </span>
                  {myesim && (
                    <Edit
                      fontSize="small"
                      sx={{ cursor: "pointer" }}
                      onClick={() => setOpenLabelChange(true)}
                    />
                  )}
                </p>
              </div>
              {myesim && (
                //NOTES: done by request because title and sub title are same
                <p className="text-base text-gray-500 truncate w-full">
                  {order?.bundle_details?.display_subtitle || ""}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center flex-shrink-0 gap-2">
            <div className="text-xl font-bold text-end hidden sm:block text-primary">
              {order?.bundle_details?.price_display}
            </div>
            <IconButton
              onClick={() =>
                setCollapseElement(
                  collapseElement === order?.order_number
                    ? null
                    : order?.order_number
                )
              }
            >
              <KeyboardArrowDownIcon />
            </IconButton>
          </div>
        </div>

        <div className="text-xl font-bold items-center cursor-pointer text-end sm:hidden block">
          {order.bundle_details?.price_display}
        </div>
        <div className={"flex flex-wrap flex-row gap-[0.5rem]"}>
          <Chip
            icon={<CalendarMonthIcon fontSize="small" />}
            label={`Ordered ${dayjs
              .unix(order?.order_date || order?.bundle_details?.payment_date)
              .format("LL")}`}
            color="secondary"
          />
          <Chip
            icon={<AccessTimeIcon fontSize="small" />}
            label={order?.bundle_details?.validity_display}
            color="secondary"
          />
          <Chip
            icon={<WifiIcon fontSize="small" />}
            label={order?.bundle_details?.gprs_limit_display}
            color="secondary"
          />
          <Chip
            onClick={handleClick}
            sx={{
              cursor:
                order?.bundle_details?.countries?.length !== 0
                  ? "pointer"
                  : "default",
            }}
            aria-describedby={id}
            icon={<LanguageIcon />}
            label={`${order?.bundle_details?.countries?.length} Countries`}
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
                    {country?.country || "N/A"}
                  </div>
                ))}
              </div>
            </CustomPopover>
          )}
        </div>

        <Collapse in={collapseElement === order?.order_number}>
          <div className={"flex flex-col gap-[1rem]"}>
            {" "}
            <hr />
            <div
              className={
                "flex flex-row flex-wrap justify-between items-center gap-[1rem] sm:gap-[3rem]"
              }
            >
              {myesim ? (
                esimDetails?.map((el, index) => (
                  <div className={"flex flex-col gap-[0.5rem]"} key={index}>
                    <label className={"font-semibold"}>
                      {t(`label.${el.title}`)}
                    </label>
                    <p>
                      {el.type === "date"
                        ? dayjs
                            .unix(order?.bundle_details?.[el?.field])
                            .format("LL")
                        : order?.bundle_details?.[el?.field]}{" "}
                    </p>
                  </div>
                ))
              ) : (
                <>
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
                  <Button
                    onClick={() => setOpenOrderReceipt(true)}
                    sx={{ width: "200px" }}
                    variant="outlined"
                    color="primary"
                    startIcon={<ReceiptLongIcon />}
                  >
                    {t("btn.view_receipt")}
                  </Button>
                </>
              )}
            </div>
            {myesim && (
              <>
                <h3>{t("orders.plan_history")}</h3>
                <div>
                  {order?.bundle_details?.transaction_history?.length === 0 ? (
                    <NoDataFound text={"No Transaction History"} />
                  ) : (
                    <TableContainer
                      component={Paper}
                      sx={{
                        boxShadow: "none",
                        minHeight: "110px",
                        maxHeight: "300px",
                      }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow>
                            {transactionHeaders?.map((th, index) => (
                              <TableCell key={index}>{th}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {order?.bundle_details?.transaction_history?.map(
                            (tb, index) => (
                              <TableRow
                                key={index}
                                sx={{ "& > *": { border: "none !important" } }}
                              >
                                <TableCell sx={{ minWidth: "100px" }}>
                                  {isLoading ? (
                                    <Skeleton width={50} />
                                  ) : (
                                    tb?.bundle?.price_display
                                  )}
                                </TableCell>
                                <TableCell
                                  sx={{ minWidth: "150px", maxWidth: "200px" }}
                                >
                                  {isLoading ? (
                                    <Skeleton width={50} />
                                  ) : (
                                    tb?.bundle_type
                                  )}
                                </TableCell>
                                <TableCell sx={{ minWidth: "100px" }}>
                                  {isLoading ? (
                                    <Skeleton width={50} />
                                  ) : (
                                    tb?.bundle?.validity_display
                                  )}
                                </TableCell>
                                <TableCell sx={{ minWidth: "100px" }}>
                                  {isLoading ? (
                                    <Skeleton width={50} />
                                  ) : (
                                    tb?.bundle?.gprs_limit_display
                                  )}
                                </TableCell>
                                <TableCell
                                  sx={{ minWidth: "150px", maxWidth: "250px" }}
                                >
                                  {isLoading ? (
                                    <Skeleton width={50} />
                                  ) : (
                                    tb?.user_order_id
                                  )}
                                </TableCell>
                                <TableCell sx={{ minWidth: "150px" }}>
                                  {isLoading ? (
                                    <Skeleton width={50} />
                                  ) : (
                                    dayjs
                                      .unix(tb?.created_at)
                                      .format("DD-MM-YYYY") || ""
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </div>
              </>
            )}
          </div>
        </Collapse>
        {myesim && (
          <>
            <hr />
            <div className="flex flex-wrap gap-[0.3rem] justify-center items-center">
              <Button
                onClick={() => setOpenConsumption(true)}
                startIcon={<LanguageOutlinedIcon fontSize="small" />}
                variant="outlined"
                color="primary"
                sx={{ width: "fit-content" }}
              >
                {t("btn.consumption")}
              </Button>
              <Button
                onClick={() => setOpenQRCode(true)}
                startIcon={<QrCode2OutlinedIcon fontSize="small" />}
                variant="outlined"
                color="primary"
                sx={{ width: "fit-content" }}
              >
                {t("btn.view_qr_code")}
              </Button>
              {order?.bundle_details?.is_topup_allowed && (
                <Button
                  onClick={() => setOpenTopUp(true)}
                  startIcon={<AddToPhotosOutlinedIcon fontSize="small" />}
                  variant="contained"
                  color="primary"
                  sx={{ width: "fit-content" }}
                >
                  {t("btn.add_top_up")}
                </Button>
              )}
            </div>
          </>
        )}

        {openConsumption && (
          <OrderConsumption
            bundle={order?.bundle_details}
            onClose={() => setOpenConsumption(false)}
          />
        )}

        {openQRCode && (
          <OrderPopup
            onClose={() => setOpenQRCode(false)}
            orderData={order?.bundle_details}
          />
        )}

        {openTopUp && (
          <OrderTopup
            onClose={() => setOpenTopUp(false)}
            bundle={order?.bundle_details}
          />
        )}
        {openLabelChange && (
          <OrderLabelChange
            bundle={order?.bundle_details}
            onClose={() => setOpenLabelChange(false)}
            refetch={refetchData}
          />
        )}
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
