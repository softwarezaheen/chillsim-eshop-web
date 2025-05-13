import { Close } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  IconButton,
  LinearProgress,
  Skeleton,
} from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { getMyEsimConsumption } from "../../core/apis/userAPI";
import NoDataFound from "../shared/no-data-found/NoDataFound";

const OrderConsumption = ({ onClose, bundle }) => {
  console.log(bundle, bundle.iccid);
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["my-esim-consumption"],
    queryFn: () =>
      getMyEsimConsumption(bundle?.iccid).then((res) => res?.data?.data),
    enabled: !!bundle?.iccid,
  });

  const calculatedProgress = useMemo(() => {
    return (data?.data_used * 100) / data?.data_allocated;
  }, [data]);

  return (
    <Dialog open={true} maxWidth="sm" fullWidth>
      <DialogContent className="flex flex-col gap-[1rem] xs:!px-8 !py-10">
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
        <div className={"flex flex-col gap-[1rem]"}>
          <h1 className={"text-center"}>{t("orders.consumption_details")}</h1>
          <p className={"text-center text-primary font-semibold"}>
            {t("orders.consumption_details_text")}
          </p>
          {isLoading || (!isLoading && data) ? (
            <div className={"label-input-wrapper"}>
              <div className={"flex flex-col gap-[0.5rem]"}>
                {isLoading ? (
                  <Skeleton width={100} />
                ) : (
                  <p className={"text-primary basis-[70%]"}>
                    <span className={"font-bold"}>
                      {data?.data_used_display} / {data?.data_allocated_display}
                    </span>{" "}
                    Consumed
                  </p>
                )}

                <LinearProgress
                  value={calculatedProgress}
                  variant="determinate"
                />
                <p className={"flex justify-end flex-1 text-primary"}>
                  {isLoading ? <Skeleton width={50} /> : `${data?.plan_status}`}
                </p>
              </div>
            </div>
          ) : (
            <NoDataFound text="Failed to load eSIM cosumption" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderConsumption;
