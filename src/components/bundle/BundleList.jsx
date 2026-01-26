//UTILITIES
import clsx from "clsx";
import { useQuery } from "react-query";
import { useEffect, useState, useMemo } from "react";
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
import BundleTableCompact from "../home/BundleTableCompact";
import BundleDetail from "./detail/BundleDetail";
import { Chip, Switch, Typography, Skeleton, useMediaQuery } from "@mui/material";

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
  const isMobile = useMediaQuery("(max-width: 639px)");
  const { data, isLoading, error } = useBundlesQuery({
    expandedCountry,
    region,
    bundleOrder,
  });

  // State for duration filter, toggle, and modal
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [showRegional, setShowRegional] = useState(false);
  const [userManuallySwitched, setUserManuallySwitched] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);

  // Duration chip options
  const durationChips = [
    { value: "all", label: t("home.duration.all") },
    { value: 7, label: t("home.duration.7d") },
    { value: 15, label: t("home.duration.15d") },
    { value: 30, label: t("home.duration.30d") },
    { value: 90, label: t("home.duration.90d") },
    { value: 365, label: t("home.duration.1yr") },
  ];

  // Deduplicate bundles by data amount and type
  const sortedBundles = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Helper to convert data to MB for comparison
    const getDataInMB = (bundle) => {
      if (bundle.unlimited || bundle.gprs_limit < 0) {
        return Infinity;
      }
      if (bundle.gprs_limit >= 100) {
        return bundle.gprs_limit;
      }
      return bundle.gprs_limit * 1024;
    };

    const getPrice = (bundle) => {
      return parseFloat(bundle.price || bundle.original_price || 0);
    };

    // Group bundles by data amount AND bundle type (country vs regional for country pages)
    const grouped = data.reduce((acc, bundle) => {
      const dataInMB = getDataInMB(bundle);
      const bundleType = (!region && (countryData?.id || expandedCountry))
        ? ((bundle.count_countries || 1) === 1 ? 'country' : 'regional')
        : 'all';
      // For unlimited bundles, include validity in the key to keep different validities separate
      const validity = bundle.validity_in_days || bundle.validity || 0;
      const key = dataInMB === Infinity ? `${dataInMB}-${validity}-${bundleType}` : `${dataInMB}-${bundleType}`;
      
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(bundle);
      return acc;
    }, {});

    // For each data amount group, pick the bundle with best value
    const bestBundles = Object.values(grouped).map((group) => {
      const sorted = group.sort((a, b) => {
        // Prefer longer validity (better value)
        const validityDiff = (b.validity_in_days || b.validity || 0) - (a.validity_in_days || a.validity || 0);
        if (validityDiff !== 0) return validityDiff;
        
        // Then lowest price
        return getPrice(a) - getPrice(b);
      });
      return sorted[0];
    });

    // Sort by data amount (ascending: 1GB → 50GB), then by price (ascending)
    const sorted = bestBundles.sort((a, b) => {
      const aData = getDataInMB(a);
      const bData = getDataInMB(b);
      
      if (aData === Infinity && bData === Infinity) {
        return getPrice(a) - getPrice(b);
      }
      if (aData === Infinity) return 1;
      if (bData === Infinity) return -1;
      
      const dataDiff = aData - bData;
      if (dataDiff !== 0) return dataDiff;
      
      return getPrice(a) - getPrice(b);
    });
    
    return sorted;
  }, [data, region, countryData, expandedCountry]);

  // Filter bundles based on duration and country count
  const filteredBundles = useMemo(() => {
    if (!sortedBundles || sortedBundles.length === 0) return [];

    let filtered = [...sortedBundles];

    // Filter by country count (single-country vs regional) for country pages
    if (!region && (countryData?.id || expandedCountry)) {
      if (!showRegional) {
        // Show only country-specific bundles (count_countries === 1)
        filtered = filtered.filter((b) => (b.count_countries || 1) === 1);
      }
      // When showRegional is true, show all bundles (both country and regional)
      // No filtering needed
    }

    // Filter by duration
    if (selectedDuration !== "all") {
      filtered = filtered.filter((b) => {
        const validity = b.validity_in_days || b.validity || 0;
        return validity <= selectedDuration;
      });
    }

    // Sort: validity DESC (closest to selected duration first), then price ASC
    if (selectedDuration !== "all") {
      filtered.sort((a, b) => {
        const validityA = a.validity_in_days || a.validity || 0;
        const validityB = b.validity_in_days || b.validity || 0;
        // First sort by validity descending
        if (validityB !== validityA) {
          return validityB - validityA;
        }
        // Then by price ascending
        return (a.price || 0) - (b.price || 0);
      });
    } else {
      // For "all", sort by price ascending
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    return filtered;
  }, [sortedBundles, selectedDuration, showRegional, region, countryData]);

  // Count of country plans and regional plans
  const countryPlansCount = useMemo(() => {
    if (!sortedBundles || sortedBundles.length === 0) return 0;
    let filtered = sortedBundles.filter((b) => (b.count_countries || 1) === 1);
    if (selectedDuration !== "all") {
      filtered = filtered.filter((b) => {
        const validity = b.validity_in_days || b.validity || 0;
        return validity <= selectedDuration;
      });
    }
    return filtered.length;
  }, [sortedBundles, selectedDuration]);

  const regionalPlansCount = useMemo(() => {
    if (!sortedBundles || sortedBundles.length === 0) return 0;
    let filtered = sortedBundles.filter((b) => (b.count_countries || 1) > 1);
    if (selectedDuration !== "all") {
      filtered = filtered.filter((b) => {
        const validity = b.validity_in_days || b.validity || 0;
        return validity <= selectedDuration;
      });
    }
    return filtered.length;
  }, [sortedBundles, selectedDuration]);

  // Auto-switch to regional if no country plans but regional exists
  useEffect(() => {
    if (!region && (countryData?.id || expandedCountry) && countryPlansCount === 0 && regionalPlansCount > 0 && !showRegional && !userManuallySwitched) {
      setShowRegional(true);
    }
  }, [countryPlansCount, regionalPlansCount, showRegional, userManuallySwitched, region, countryData, expandedCountry]);

  // Reset manual switch flag when duration changes
  useEffect(() => {
    setUserManuallySwitched(false);
  }, [selectedDuration]);

  // Check if regional bundles are available
  const hasRegionalBundles = useMemo(() => {
    return sortedBundles?.some((b) => (b.count_countries || 1) > 1) || false;
  }, [sortedBundles]);

  // Modal handlers
  const handleViewDetails = (bundle) => {
    setSelectedBundle(bundle);
    setIsBundleModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsBundleModalOpen(false);
    setSelectedBundle(null);
  };

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
    // For topup view, use old card skeleton
    if (topup || bundleOrder) {
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

    // For country/region view, use table skeleton
    return (
      <div className="space-y-6 mb-6">
        {/* Duration chips skeleton */}
        <div className="flex flex-wrap justify-center gap-2">
          {Array(6)
            .fill()
            .map((_, i) => (
              <Skeleton key={i} variant="rectangular" width={80} height={32} sx={{ borderRadius: 2 }} />
            ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white shadow-md p-4 rounded-md">
          {isMobile ? (
            // Mobile: Card skeletons
            <div className="space-y-4">
              {Array(3)
                .fill()
                .map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} className="mt-2" />
                    <Skeleton variant="text" width="50%" height={20} className="mt-2" />
                    <Skeleton variant="rectangular" width="100%" height={36} className="mt-4" sx={{ borderRadius: 1 }} />
                  </div>
                ))}
            </div>
          ) : (
            // Desktop: Table skeleton
            <div>
              {/* Table header */}
              <div className="flex gap-4 pb-3 border-b">
                <Skeleton variant="text" width="25%" height={20} />
                <Skeleton variant="text" width="15%" height={20} />
                <Skeleton variant="text" width="15%" height={20} />
                <Skeleton variant="text" width="20%" height={20} />
                <Skeleton variant="text" width="15%" height={20} />
                <Skeleton variant="text" width="10%" height={20} />
              </div>
              {/* Table rows */}
              {Array(5)
                .fill()
                .map((_, i) => (
                  <div key={i} className="flex gap-4 py-3 border-b">
                    <Skeleton variant="text" width="25%" height={20} />
                    <Skeleton variant="text" width="15%" height={20} />
                    <Skeleton variant="text" width="15%" height={20} />
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="text" width="15%" height={20} />
                    <Skeleton variant="rectangular" width="10%" height={32} sx={{ borderRadius: 1 }} />
                  </div>
                ))}
            </div>
          )}
        </div>
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

  // Use old grid for topup view
  if (topup || bundleOrder) {
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
  }

  // Use new compact table for country/region view
  return (
    <div className="space-y-6 mb-6">
      {/* Duration Filter Chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {durationChips.map((chip) => (
          <Chip
            key={chip.value}
            label={chip.label}
            onClick={() => setSelectedDuration(chip.value)}
            color={selectedDuration === chip.value ? "primary" : "default"}
            variant={selectedDuration === chip.value ? "filled" : "outlined"}
            sx={{
              cursor: "pointer",
              "&:hover": {
                backgroundColor:
                  selectedDuration === chip.value ? "primary.dark" : "action.hover",
              },
            }}
          />
        ))}
      </div>

      {/* Country vs Regional Toggle (only for country pages) */}
      {!region && (countryData?.id || expandedCountry) && hasRegionalBundles && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
            <Typography
              variant="body2"
              className={!showRegional ? "!font-semibold !text-gray-700" : "!text-gray-500"}
            >
              {t("home.results.countryPlans")} ({countryPlansCount})
            </Typography>
            <Switch
              checked={showRegional}
              onChange={(e) => {
                const newValue = e.target.checked;
                setShowRegional(newValue);
                // If user switches back to country plans, mark as manually switched
                if (!newValue) {
                  setUserManuallySwitched(true);
                }
              }}
              color="primary"
              size="small"
            />
            <Typography
              variant="body2"
              className={showRegional ? "!font-semibold !text-gray-700" : "!text-gray-500"}
            >
              {t("home.results.regionalPlans")} ({regionalPlansCount})
            </Typography>
          </div>
        </div>
      )}

      {/* Bundle Table */}
      <div className="bg-white shadow-md p-4 rounded-md">
        {filteredBundles.length > 0 ? (
          <BundleTableCompact
            bundles={filteredBundles}
            onViewDetails={handleViewDetails}
            defaultSort={
              selectedDuration === "all"
                ? { orderBy: "price", order: "asc" }
                : { orderBy: "validity", order: "desc" }
            }
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">{t("home.results.noPlans")}</p>
            {/* If no country plans but regional exists, show hint */}
            {!region && (countryData?.id || expandedCountry) && !showRegional && regionalPlansCount > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {t("home.results.tryRegional", { count: regionalPlansCount })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bundle Detail Modal */}
      {selectedBundle && isBundleModalOpen && (
        <BundleDetail
          bundle={selectedBundle}
          open={isBundleModalOpen}
          onClose={handleCloseModal}
          iccid={topup ? bundleOrder?.iccid : null}
        />
      )}
    </div>
  );
};

export default BundleList;
