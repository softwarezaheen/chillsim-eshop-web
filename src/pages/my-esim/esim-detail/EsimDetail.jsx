//UTILITIES
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "react-query";
//COMPONENT
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import OrderCard from "../../../components/order/OrderCard";
import { getMyEsimByIccid } from "../../../core/apis/userAPI";
import { NoDataFoundSVG } from "../../../assets/icons/Common";
import NoDataFound from "../../../components/shared/no-data-found/NoDataFound";
import { Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";

const EsimDetail = (props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { iccid } = useParams();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [`esim-detail-${iccid}`],
    queryFn: () => getMyEsimByIccid(iccid).then((res) => res?.data?.data),
    enabled: !!iccid,
  });

  return (
    <div className={"flex flex-col gap-[1rem]"}>
      <div
        className={
          "flex flex-row gap-2 items-center font-semibold cursor-pointer"
        }
        onClick={() => {
          navigate("/esim");
        }}
      >
        <ArrowBackIosNewIcon color="primary" fontSize="medium" />{" "}
        <h1>{t("esim.esim_detail")}</h1>
      </div>
      {!iccid ? (
        <NoDataFound
          image={<NoDataFoundSVG />}
          text={t("noDataFound.no_valid_iccid")}
        />
      ) : isLoading ? (
        <Skeleton variant="rectangle" height={100} className={"rounded-md"} />
      ) : !data || error ? (
        <NoDataFound
          image={<NoDataFoundSVG />}
          text={t("noDataFound.no_data_matching_iccid")}
        />
      ) : (
        <OrderCard
          order={{ bundle_details: data }}
          myesim
          refetchData={refetch}
        />
      )}
    </div>
  );
};

export default EsimDetail;
