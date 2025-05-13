//UTILITIES
import React from "react";
import { useQuery } from "react-query";
import clsx from "clsx";

//COMPONENT
import {
  getBundlesByCountry,
  getBundlesByRegion,
} from "../../core/apis/homeAPI";
import BundleCard from "./bundle-card/BundleCard";
import NoDataFound from "../shared/no-data-found/NoDataFound";
import { getEsimRelatedTopup } from "../../core/apis/userAPI";

const useBundlesQuery = ({ expandedCountry, region, bundleOrder }) => {
  return useQuery({
    queryKey: expandedCountry
      ? [`${expandedCountry}-bundles`, expandedCountry]
      : [`top-up-bundle-${bundleOrder?.bundle_code}-${bundleOrder?.iccid}`],

    queryFn: () => {
      if (expandedCountry) {
        return region
          ? getBundlesByRegion(expandedCountry).then((res) => res?.data?.data)
          : getBundlesByCountry(expandedCountry).then((res) => res?.data?.data);
      }

      if (bundleOrder) {
        return getEsimRelatedTopup({
          bundle_code: bundleOrder?.bundle_code,
          iccid: bundleOrder?.iccid,
        }).then((res) => res?.data?.data);
      }

      return Promise.resolve(null); // Return null if neither condition is met
    },

    enabled: !!expandedCountry || !!bundleOrder, // Enable only if one condition is met
  });
};

const BundleList = ({
  bundleOrder,
  expandedCountry,
  countryData,
  region,
  supportedCountries,
  topup,
  regionIcon,
}) => {
  const { data, isLoading, error } = useBundlesQuery({
    expandedCountry,
    region,
    bundleOrder,
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow-sm p-4 rounded-md grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {Array(3)
          .fill()
          .map((_, index) => (
            <BundleCard
              regionIcon={null}
              key={index}
              bundle={null}
              countryData={null}
              isLoading={true}
            />
          ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 gap-6 mb-6">
        <NoDataFound text={"Failed to load bundles"} />
      </div>
    );
  }

  if (!isLoading && (!data || data.length === 0)) {
    return (
      <div className="grid grid-cols-1 gap-6 mb-6">
        <NoDataFound
          text={
            topup
              ? "Currently, There are no top-ups available"
              : "Currently, There no bundles available"
          }
        />
      </div>
    );
  }

  return (
    <div
      className={clsx(`grid grid-cols-1 gap-6`, {
        "mb-6": !isLoading && data && data?.length !== 0,
      })}
    >
      <div
        className={clsx(
          "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6",
          {
            "bg-white shadow-md p-4 rounded-md": countryData || region,
          }
        )}
      >
        {data?.map((bundleElement, index) => (
          <BundleCard
            iccid={bundleOrder?.iccid}
            supportedCountries={supportedCountries}
            key={`${countryData?.id}-${bundleElement?.bundle_code}`}
            bundle={bundleElement}
            countryData={!region ? countryData : null}
            isLoading={false}
            regionIcon={regionIcon}
          />
        ))}
      </div>
    </div>
  );
};

export default BundleList;
