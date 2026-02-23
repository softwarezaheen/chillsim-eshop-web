import { Edit } from "@mui/icons-material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddToPhotosOutlinedIcon from "@mui/icons-material/AddToPhotosOutlined";
import BoltIcon from "@mui/icons-material/Bolt";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LanguageIcon from "@mui/icons-material/Language";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import WifiIcon from "@mui/icons-material/Wifi";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { CustomPopover } from "../../assets/CustomComponents";
import { getMyEsimConsumption } from "../../core/apis/userAPI";
import { formatValidity } from "../../assets/utils/formatValidity";
import NoDataFound from "../shared/no-data-found/NoDataFound";
import OrderConsumption from "../order/OrderConsumption";
import OrderLabelChange from "../order/OrderLabelChange";
import OrderPopup from "../order/OrderPopup";
import OrderTopup from "../order/OrderTopup";
import AutoTopupModal from "../auto-topup/AutoTopupModal";

const EsimCard = ({ order, refetchData, isEnablingAutoTopup = false }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [collapseElement, setCollapseElement] = useState(null);
  const [openConsumption, setOpenConsumption] = useState(false);
  const [openQRCode, setOpenQRCode] = useState(false);
  const [openTopUp, setOpenTopUp] = useState(false);
  const [openLabelChange, setOpenLabelChange] = useState(false);
  const [openAutoTopup, setOpenAutoTopup] = useState(false);

  const {
    data: consumptionData,
    isLoading: consumptionLoading,
    error: consumptionError,
  } = useQuery({
    queryKey: [
      `my-esim-consumption-${order?.bundle_details?.iccid}`,
      openConsumption,
    ],
    queryFn: () =>
      getMyEsimConsumption(order?.bundle_details?.iccid).then(
        (res) => res?.data?.data
      ),
    enabled:
      (!!collapseElement || !!openConsumption) &&
      !!order?.bundle_details?.iccid,
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

  return (
    <Card key={order.order_number || order?.iccid}>
      <CardContent className={"flex flex-col gap-[1rem]"}>
        <div className="flex flex-row justify-between items-start w-full">
          <div className="flex flex-row gap-6 items-center flex-1 min-w-0">
            <Avatar
              src={order?.bundle_details?.icon}
              alt={
                order?.bundle_details?.label_name ||
                order?.bundle_details?.iccid ||
                ""
              }
              sx={{ width: 45, height: 45, display: { xs: 'none', sm: 'flex' } }}
            >
              {/* fallback image */}
              <img
                src="/media/global.svg"
                className="bg-white"
                alt={
                  order?.bundle_details?.label_name ||
                  order?.bundle_details?.iccid ||
                  ""
                }
              />
            </Avatar>
            <div className="flex flex-col justify-between items-start min-w-0 flex-1">
              <div className="w-full overflow-hidden">
                <p className="text-base sm:text-xl font-bold text-primary truncate w-full flex items-center gap-[0.2rem]">
                  <span dir="ltr" className="truncate">
                    {order?.bundle_details?.label_name || order?.bundle_details?.iccid || ""}
                  </span>
                  {order?.bundle_details?.is_topup_allowed &&
                    order?.bundle_details?.auto_topup_enabled && (
                      <BoltIcon
                        fontSize="small"
                        sx={{ color: "#10b981", width: 18, height: 18 }}
                        titleAccess="Auto top-up enabled"
                      />
                    )}
                  {!order?.bundle_details?.bundle_expired && (
                    <Edit
                      fontSize="small"
                      sx={{ cursor: "pointer" }}
                      onClick={() => setOpenLabelChange(true)}
                    />
                  )}
                </p>
              </div>
              <p className="text-base text-gray-500 truncate w-full">
                <span dir="ltr">
                  {order?.bundle_details?.display_subtitle || ""}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center flex-shrink-0 gap-2">
            <div className="text-xl font-bold text-end hidden sm:block text-primary">
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
              endIcon={<KeyboardArrowDownIcon />}
              sx={{ textTransform: "none", color: "text.secondary" }}
            >
              {t("btn.details")}
            </Button>
          </div>
        </div>

        <div className="text-xl font-bold items-center cursor-pointer text-end sm:hidden block">
          {order?.order_display_price}
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

        <Collapse
          in={
            collapseElement ==
            (order?.bundle_details?.order_number || order?.order_number)
          }
        >
          <div className={"flex flex-col gap-[1rem]"}>
            <hr />
            <div
              className={
                "flex flex-row flex-wrap justify-between items-center gap-[1rem] sm:gap-[3rem]"
              }
            >
              {esimDetails?.map((el, index) => (
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
              ))}
              <div className={"flex flex-col gap-[0.5rem]"}>
                <label className={"font-semibold"}>
                  {t(`label.eSIM_validity`)}
                </label>
                <p>
                  {consumptionLoading ? (
                    <Skeleton />
                  ) : consumptionData?.expiry_date ? (
                    dayjs(consumptionData?.expiry_date)?.format(
                      "DD-MM-YYYY HH:mm"
                    )
                  ) : (
                    t("common.notAvailable")
                  )}
                </p>
              </div>
            </div>
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
                  <Table dir="ltr">
                    <TableHead>
                      <TableRow>
                        {transactionHeaders?.map((th, index) => (
                          <TableCell key={index}>
                            {t(`orders.${th}`)}
                          </TableCell>
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
                              {tb?.bundle?.price_display}
                            </TableCell>
                            <TableCell
                              sx={{ minWidth: "150px", maxWidth: "200px" }}
                            >
                              {t(`orders.${tb?.bundle_type}`)}
                            </TableCell>
                            <TableCell sx={{ minWidth: "100px" }}>
                              <span
                                dir={
                                  localStorage.getItem("i18nextLng") ===
                                  "ar"
                                    ? "rtl"
                                    : "ltr"
                                }
                              >
                                {formatValidity(
                                  tb?.bundle?.validity_display
                                )}
                              </span>
                            </TableCell>
                            <TableCell sx={{ minWidth: "100px" }}>
                              {tb?.bundle?.gprs_limit_display}
                            </TableCell>
                            <TableCell
                              sx={{ minWidth: "150px", maxWidth: "250px" }}
                            >
                              {tb?.user_order_id}
                            </TableCell>
                            <TableCell sx={{ minWidth: "150px" }}>
                              {dayjs
                                .unix(tb?.created_at)
                                .format("DD-MM-YYYY") || ""}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </div>
          </div>
        </Collapse>
        <hr />
        <div className="flex flex-wrap gap-[0.3rem] justify-center items-center">
          {!order?.bundle_details?.bundle_expired && (
            <Button
              onClick={() => setOpenConsumption(true)}
              startIcon={
                <LanguageOutlinedIcon
                  style={
                    localStorage.getItem("i18nextLng") === "ar"
                      ? { marginLeft: "8px" }
                      : {}
                  }
                  fontSize="small"
                />
              }
              variant="outlined"
              color="primary"
              sx={{ width: "fit-content" }}
            >
              {t("btn.consumption")}
            </Button>
          )}
          {!order?.bundle_details?.bundle_expired && (
            <Button
              onClick={() => setOpenQRCode(true)}
              startIcon={
                <QrCode2OutlinedIcon
                  style={
                    localStorage.getItem("i18nextLng") === "ar"
                      ? { marginLeft: "8px" }
                      : {}
                  }
                  fontSize="small"
                />
              }
              variant="outlined"
              color="primary"
              sx={{ width: "fit-content" }}
            >
              {t("btn.view_qr_code")}
            </Button>
          )}
          {order?.bundle_details?.is_topup_allowed && (
            isEnablingAutoTopup ? (
              // Show loading state while enabling auto-topup
              <Button
                disabled
                startIcon={
                  <BoltIcon
                    style={
                      localStorage.getItem("i18nextLng") === "ar"
                        ? { marginLeft: "8px" }
                        : {}
                    }
                    fontSize="small"
                  />
                }
                variant="contained"
                color="secondary"
                sx={{ width: "fit-content" }}
              >
                {t("common.enabling")}
              </Button>
            ) : order?.bundle_details?.auto_topup_enabled ? (
              <Button
                onClick={() => setOpenAutoTopup(true)}
                startIcon={
                  <BoltIcon
                    style={
                      localStorage.getItem("i18nextLng") === "ar"
                        ? { marginLeft: "8px" }
                        : {}
                    }
                    fontSize="small"
                  />
                }
                variant="contained"
                color="secondary"
                sx={{ width: "fit-content" }}
              >
                {t("autoTopup.manageButton")}
              </Button>
            ) : (
              <Button
                onClick={() => setOpenTopUp(true)}
                startIcon={
                  <AddToPhotosOutlinedIcon
                    style={
                      localStorage.getItem("i18nextLng") === "ar"
                        ? { marginLeft: "8px" }
                        : {}
                    }
                    fontSize="small"
                  />
                }
                variant="contained"
                color="primary"
                sx={{ width: "fit-content" }}
              >
                {t("btn.add_top_up")}
              </Button>
            )
          )}
        </div>

        {openConsumption && (
          <OrderConsumption
            data={consumptionData}
            isLoading={consumptionLoading}
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
        {openAutoTopup && (
          <AutoTopupModal
            open={openAutoTopup}
            onClose={() => setOpenAutoTopup(false)}
            iccid={order?.bundle_details?.iccid}
            bundleCode={order?.bundle_details?.bundle_code}
            bundleName={order?.bundle_details?.display_title}
            bundleData={order?.bundle_details}
            labelName={order?.bundle_details?.label_name || order?.bundle_details?.iccid}
            userProfileId={order?.bundle_details?.user_profile_id}
            isAutoTopupEnabled={order?.bundle_details?.auto_topup_enabled}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default EsimCard;
