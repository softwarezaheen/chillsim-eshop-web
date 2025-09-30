//UTILITIES
import clsx from "clsx";
import { useQuery } from "react-query";
import { useEffect } from "react";
import { useSelector } from "react-redux";

//COMPONENT
import { useTranslation } from "react-i18next";
import { gtmViewItemListEvent } from "../../core/utils/gtm.jsx";
import {
  getBundlesByCountry,
  getBundlesByRegion,
} from "../../core/apis/homeAPI";
import { getEsimRelatedTopup } from "../../core/apis/userAPI";
import NoDataFound from "../shared/no-data-found/NoDataFound";
import BundleCard from "./bundle-card/BundleCard";

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
  const { t } = useTranslation();
  const searchState = useSelector((state) => state.search);
  const { data, isLoading, error } = useBundlesQuery({
    expandedCountry,
    region,
    bundleOrder,
  });

  // Send GA4 view_item_list event when bundles are loaded
  useEffect(() => {
    if (data && data.length > 0) {
      let listName, listId, listType;
      
      if (bundleOrder && topup) {
        // Topup case - viewing available topup options for an eSIM
        listName = `${bundleOrder?.display_title || bundleOrder?.title || 'eSIM'} - Top-up Options`;
        listId = bundleOrder?.iccid || bundleOrder?.bundle_code || 'topup';
        listType = 'topup';
        
        console.log('Topup view_item_list:', { listName, listId, listType });
      } else if (expandedCountry) {
        // Regular bundle list case
        if (region) {
          // Region case
          listName = countryData?.region_name || expandedCountry;
          listId = expandedCountry;
          listType = 'region';
        } else {
          // Check for search countries in Redux state
          const searchCountries = searchState?.related_search?.countries;
          
          if (searchCountries && searchCountries.length > 0) {
            // Multiple countries search case - get names from Redux search state
            console.log('Found search countries:', searchCountries);
            listName = searchCountries.map(country => country.country_name).filter(name => name).join(', ');
            listId = searchCountries.map(country => country.iso3_code).filter(id => id).join(',');
            listType = 'country';
            
            console.log('Extracted from search:', { listName, listId });
          } else {
            // Single country case - fallback to country data or expandedCountry
            listName = countryData?.country || 'Unknown Country';
            listId = expandedCountry;
            listType = 'country';
            
            console.log('Using fallback:', { listName, listId });
          }
        }
      } else {
        // Skip GTM event if neither topup nor expandedCountry case
        return;
      }
      
      gtmViewItemListEvent(data, listName, listId, listType);
    }
  }, [data, expandedCountry, region, countryData, bundleOrder, topup, supportedCountries, searchState]);

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
        <NoDataFound text={t("bundles.failedToLoadBundles")} />
      </div>
    );
  }

  if (!isLoading && (!data || data.length === 0)) {
    return (
      <div className="grid grid-cols-1 gap-6 mb-6">
        <NoDataFound
          text={
            topup
              ? t("bundles.noTopupsAvailable")
              : t("bundles.noBundlesAvailable")
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
        {data?.map((bundleElement) => (
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
