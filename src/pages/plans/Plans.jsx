//UTILITIES
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import clsx from "clsx";
//REDUCER
import { LimitedSignOut } from "../../redux/reducers/authReducer";
import { AttachSearch, DetachSearch } from "../../redux/reducers/searchReducer";
import { validateReferralEligibility, loadReferralFromStorage } from "../../redux/reducers/referralReducer";
//API
import { useHomeCountries } from "../../core/custom-hook/useHomeCountries";
//COMPONENT

import CountriesList from "../../components/country-section/CountriesList";
import { CountriesSkeletons } from "../../components/shared/skeletons/HomePageSkeletons";
import BundleTableCompact from "../../components/home/BundleTableCompact";
import BundleDetail from "../../components/bundle/detail/BundleDetail";
import {
  Autocomplete,
  Alert,
  Badge,
  Chip,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Switch,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { StyledTextField } from "../../assets/CustomComponents";
import BundleList from "../../components/bundle/BundleList";
import NoDataFound from "../../components/shared/no-data-found/NoDataFound";
import useQueryParams from "../../core/custom-hook/useQueryParams";
import PaymentCompletion from "../../components/payment/PaymentCompletion";
import OrderPopup from "../../components/order/OrderPopup";
import DirectionsBoatFilledOutlinedIcon from "@mui/icons-material/DirectionsBoatFilledOutlined";
import TerrainOutlinedIcon from "@mui/icons-material/TerrainOutlined";
import { useTranslation } from "react-i18next";
import { gtmEvent } from "../../core/utils/gtm.jsx";
import PromotionsModal from "../../components/promotions/PromotionsModal";
import { usePromotionsPopup } from "../../core/custom-hook/usePromotionsPopup";
import { shouldShowPromotionsPopup } from "../../core/utils/authHelpers";

const Plans = (props) => {
  const { t } = useTranslation();

  const seaOption =
    import.meta.env.VITE_APP_SEA_OPTION === undefined
      ? true
      : import.meta.env.VITE_APP_SEA_OPTION === "true";
  const defaultOption = seaOption ? "cruises" : "land";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isSmall = useMediaQuery("(max-width: 639px)");
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const mainPath = pathSegments[1] || ""; // "cruises" or "" (land) //now : "land" or

  // Get referral state from Redux
  const { 
    referralCode, 
    isEligible, 
    discountPercentage,
    referrerName,
    isValidating 
  } = useSelector((state) => state.referral);
  
  const authState = useSelector((state) => state.authentication);

  // Promotions popup hook - NO SCROLL TRIGGER for Plans page
  const {
    shouldShow: shouldShowPromotionsModal,
    dismissPopup: dismissPromotionsModal,
    remindLater: remindPromotionsLater,
    dontShowAgain: dontShowPromotionsAgain,
  } = usePromotionsPopup({
    enabled: shouldShowPromotionsPopup(authState),
    delaySeconds: 30,
    useScrollTrigger: false, // Plans page: time-only trigger
    minTimeSeconds: 15,
  });

  const [activeRadio, setActiveRadio] = useState(mainPath || defaultOption);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("type") || "countries"
  );

  const [isSearching, setIsSearching] = useState(isSmall);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [openOrderDetail, setOpenOrderDetail] = useState(false);
  
  // Duration filter state
  const [selectedDuration, setSelectedDuration] = useState("all");
  
  // Country vs Regional toggle (only for countries)
  const [showRegional, setShowRegional] = useState(false);
  const [userManuallySwitched, setUserManuallySwitched] = useState(false);
  
  // Bundle detail modal state
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);

  const [search, setSearch] = useState(
    searchParams.getAll("country_codes") || []
  );
  const [filters, setFilters] = useState({
    type: searchParams.get("type") || "",
    country_codes: searchParams.getAll("country_codes").join(",") || "", // Extract array
    order_id: searchParams.get("order_id") || null, // Extract single value
  });

  const handleRadioChange = (event) => {
    const newValue = event.target.value;
    setActiveRadio(newValue);
    dispatch(DetachSearch());

    setActiveTab("countries");
    setFilters({ ...filters, type: "", country_codes: "" });
    setIsSearching(false);
    navigate(newValue === "land" ? `/plans/${newValue}` : "/plans");
  };

  const [hoorayOpen, setHorrayOpen] = useState(
    searchParams.get("order_id") || false
  );

  //if testing
  // const data = [];
  // const isLoading = false;
  // const error = false;
  const { data, isLoading, error } = useHomeCountries();

  const homeData = useMemo(() => {
    let dataType = filters?.type || "";

    if (data) {
      if (dataType === "regions") {
        return data?.regions?.filter((el) => el?.region_code !== "GLOBAL");
      } else if (dataType === "global") {
        dispatch(DetachSearch());
        return data?.global_bundles || [];
      } else if (activeRadio === "cruises") {
        return data?.cruise_bundles || [];
      } else {
        if (showAllCountries) {
          return data?.countries;
        } else {
          return data?.countries?.slice(0, 9);
        }
      }
    } else {
      return [];
    }
  }, [data, activeTab, showAllCountries, filters?.type, activeRadio]);

  // Deduplicate and sort bundles (for global/regions display)
  const sortedBundles = useMemo(() => {
    if (!homeData || filters?.type === "" || !Array.isArray(homeData)) return homeData;
    
    const bundles = homeData;
    
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

    // Group by data + validity + type (country vs regional)
    const grouped = bundles.reduce((acc, bundle) => {
      const dataInMB = getDataInMB(bundle);
      const bundleType = (filters?.type === "" && activeTab === "countries")
        ? ((bundle.count_countries || 1) === 1 ? 'country' : 'regional')
        : 'all';
      // CRITICAL: Include validity in key for ALL bundles (not just unlimited)
      const validity = bundle.validity_days || bundle.validity || 0;
      const key = `${dataInMB}-${validity}-${bundleType}`;
      
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(bundle);
      return acc;
    }, {});

    const bestBundles = Object.values(grouped).map((group) => {
      const sorted = group.sort((a, b) => {
        const validityDiff = (b.validity_days || b.validity || 0) - (a.validity_days || a.validity || 0);
        if (validityDiff !== 0) return validityDiff;
        return getPrice(a) - getPrice(b);
      });
      return sorted[0];
    });

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
  }, [homeData, filters?.type, activeTab]);

  // Duration chip options
  const durationChips = [
    { value: "all", label: t("home.duration.all") },
    { value: 1, label: t("home.duration.1d") },
    { value: 3, label: t("home.duration.3d") },
    { value: 7, label: t("home.duration.7d") },
    { value: "more", label: t("home.duration.more") },
  ];

  // Filter bundles by duration and country/regional type
  const filteredBundles = useMemo(() => {
    if (!sortedBundles || !Array.isArray(sortedBundles)) return sortedBundles;
    
    let filtered = sortedBundles;
    
    // For countries view, filter by country count
    if (filters?.type === "" && activeTab === "countries") {
      if (!showRegional) {
        filtered = filtered.filter((b) => (b.count_countries || 1) === 1);
      }
      // When showRegional is true, show all bundles (both country and regional)
      // No filtering needed
    }
    
    // Filter by duration
    if (selectedDuration === "all") {
      return filtered;
    }

    const filterByDays = (bundle) => {
      const validity = bundle.validity_days || bundle.validity || 0;
      if (selectedDuration === "more") return validity >= 7;
      return validity >= selectedDuration;
    };

    const durationFiltered = filtered.filter(filterByDays);
    
    return durationFiltered.sort((a, b) => {
      const aValidity = a.validity_days || a.validity || 0;
      const bValidity = b.validity_days || b.validity || 0;
      return bValidity - aValidity;
    });
  }, [sortedBundles, selectedDuration, filters?.type, activeTab, showRegional]);

  // Counts for country vs regional toggle
  const countryPlansCount = useMemo(() => {
    if (filters?.type !== "" || activeTab !== "countries" || !sortedBundles) return 0;
    let filtered = sortedBundles.filter((b) => (b.count_countries || 1) === 1);
    
    if (selectedDuration !== "all") {
      filtered = filtered.filter((b) => {
        const validity = b.validity_days || b.validity || 0;
        if (selectedDuration === "more") return validity >= 7;
        return validity >= selectedDuration;
      });
    }
    
    return filtered.length;
  }, [sortedBundles, selectedDuration, filters?.type, activeTab]);

  const regionalPlansCount = useMemo(() => {
    if (filters?.type !== "" || activeTab !== "countries" || !sortedBundles) return 0;
    let filtered = sortedBundles.filter((b) => (b.count_countries || 1) > 1);
    
    if (selectedDuration !== "all") {
      filtered = filtered.filter((b) => {
        const validity = b.validity_days || b.validity || 0;
        if (selectedDuration === "more") return validity >= 7;
        return validity >= selectedDuration;
      });
    }
    
    return filtered.length;
  }, [sortedBundles, selectedDuration, filters?.type, activeTab]);

  const hasRegionalBundles = useMemo(() => {
    if (filters?.type !== "" || activeTab !== "countries" || !sortedBundles) return false;
    return sortedBundles.some((b) => (b.count_countries || 1) > 1);
  }, [sortedBundles, filters?.type, activeTab]);

  // Modal handlers
  const handleViewDetails = (bundle) => {
    setSelectedBundle(bundle);
    setIsBundleModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsBundleModalOpen(false);
    setSelectedBundle(null);
  };

  const resetFilter = () => {
    setIsSearching(false);
  };

  const handleQueryParams = useQueryParams(filters);

  useEffect(() => {
    dispatch(DetachSearch());
  }, []);

  // Validate referral on mount if needed
  useEffect(() => {
    // Load cached referral first
    dispatch(loadReferralFromStorage());
    
    // If has code + not validated yet, validate now (works for both authenticated and unauthenticated)
    if (referralCode && !isEligible && !isValidating) {
      dispatch(validateReferralEligibility(referralCode));
    }
  }, [referralCode, isEligible, isValidating, dispatch]);

  useEffect(() => {
    if (isSmall) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
    handleQueryParams();
  }, [filters, isSmall]);

  return (
    <>
      {/* Referral Discount Banner */}
      {isEligible && discountPercentage && (
        <div className="max-w-2xl mx-auto mb-4 sm:mb-6 px-4">
          <Alert 
            severity="success" 
            icon={<CardGiftcardIcon />}
            className="shadow-md"
            sx={{ 
              '& .MuiAlert-message': { width: '100%' },
              backgroundColor: '#f0fdf4',
              borderLeft: '4px solid #22c55e',
            }}
          >
            {/* Main Content Container */}
            <div className="flex flex-col gap-3">
              {/* Top Section: Discount Message + Badge */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1">
                  <strong className="block text-sm sm:text-base font-bold text-green-800">
                    {t("referral.discountActive")}
                  </strong>
                  <p className="text-xs sm:text-sm mt-1 text-green-700">
                    {t("referral.discountMessage", {
                      percentage: discountPercentage,
                      referrerName: referrerName,
                    })}
                  </p>
                </div>
                <Chip
                  label={`${discountPercentage}% OFF`}
                  color="success"
                  size="small"
                  className="font-bold self-start sm:self-center"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 'bold',
                  }}
                />
              </div>
              
              {/* Divider */}
              <div className="border-t border-green-200" />
              
              {/* Mobile App Tip - Integrated Design */}
              <p className="text-xs sm:text-sm text-green-700 leading-relaxed">
                {t("referral.mobileAppNotice")}{" "}
                <span className="inline-flex items-center bg-white px-2 py-0.5 rounded border border-green-300 font-mono font-bold text-green-900 text-xs sm:text-sm mx-1">
                  {referralCode}
                </span>{" "}
                {t("referral.toGetDiscount")}
              </p>
            </div>
          </Alert>
        </div>
      )}

      <div className="flex flex-col gap-[2rem] max-w-2xl mx-auto mb-12">
        {activeRadio !== "cruises" && (
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-center sm:items-center gap-4 relative w-full">
            {/* Search Bar Container */}
            <div
              className={clsx(
                `bg-white  shadow-md rounded transition-all duration-500 overflow-hidden flex items-center ${
                  isSearching ? "w-full" : "w-fit sm:w-10 h-10"
                }`,
                {
                  "w-auto": isSmall,
                }
              )}
            >
              {isSearching ? (
                <div className={"flex flex-row gap-2 items-center px-2 w-full"}>
                  <Search
                    className="text-primary cursor-pointer"
                    onClick={!isSmall ? () => resetFilter() : null}
                  />

                  <Autocomplete
                    size="small"
                    multiple
                    value={
                      filters?.country_codes?.length !== 0
                        ? (data?.countries || [])?.filter((el) =>
                            filters?.country_codes.split(",")?.includes(el?.id)
                          )
                        : []
                    }
                    filterOptions={(options, { inputValue }) => {
                      return options?.filter((option) =>
                        [
                          option?.country,
                          option?.iso3_code,
                          option?.country_code,
                        ].some((field) =>
                          field
                            ?.toLowerCase()
                            .includes(inputValue.toLowerCase())
                        )
                      );
                    }}
                    options={data?.countries || []}
                    getOptionLabel={(option) => option?.country}
                    onChange={(_, value) => {
                      if (value?.length > 3) {
                        toast.error(t("plans.restrictedCountriesSelection"));
                      }

                      if (value?.length <= 3 || value?.length === 0) {
                        if (value?.length === 0) {
                          setIsSearching(false);
                        }

                        setSearch(
                          value?.map((el) => {
                            return { id: el?.id };
                          })
                        );
                        setActiveTab("countries");
                        setFilters({
                          ...filters,
                          type: "",
                          country_codes:
                            value?.map((el) => el?.id).join(",") || "",
                        });
                        dispatch(
                          AttachSearch({
                            countries:
                              value?.map((el) => {
                                return {
                                  iso3_code: el?.iso3_code,
                                  country_name: el?.country,
                                };
                              }) || [],
                          })
                        );
                        if (value?.length) {
                          value.forEach((el) => {
                            gtmEvent('product_search', { country: el.country });
                          });
                        }
                      }
                    }}
                    className="w-full flex"
                    renderInput={(params) => (
                      <StyledTextField
                        {...params}
                        placeholder={t("plans.searchByCountry")}
                        variant="outlined"
                        className="w-full"
                        size="small"
                        autoFocus
                      />
                    )}
                  />
                </div>
              ) : (
                <IconButton
                  onClick={() => setIsSearching(true)}
                  className="w-10 h-10 bg-white shadow-md rounded transition-all duration-500"
                >
                  <Badge
                    color="secondary"
                    variant="dot"
                    invisible={filters?.country_codes === ""}
                    overlap={"circular"}
                  >
                    <Search className="text-primary" />
                  </Badge>
                </IconButton>
              )}
            </div>

            {/* Tabs (Hide when searching) */}
            {(!isSearching || (isSearching && isSmall)) && (
              <div className="flex flex-1 sm:flex-none items-center gap-2 bg-white rounded shadow-md p-1 transition-all duration-500 w-full sm:w-auto  overflow-x-auto">
                <div className=" w-full flex flex-row justify-between gap-[0.5rem]">
                  <button
                    onClick={() => {
                      setFilters({ ...filters, type: "" });
                      setActiveTab("countries");
                    }}
                    className={`px-2 py-1 rounded text-base font-bold transition-colors ${
                      activeTab === "countries"
                        ? "bg-primary text-white"
                        : "text-primary"
                    }`}
                  >
                    {t("btn.countries")}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("regions");
                      setFilters({
                        ...filters,
                        type: "regions",
                        country_codes: "",
                      });
                    }}
                    className={`px-2 py-1 rounded text-base font-bold transition-colors ${
                      activeTab === "regions"
                        ? "bg-primary text-white"
                        : "text-primary"
                    }`}
                  >
                    {t("btn.regions")}
                  </button>
                  <button
                    onClick={() => {
                      setFilters({
                        ...filters,
                        type: "global",
                        country_codes: "",
                      });
                      setActiveTab("global");
                    }}
                    className={`px-2 py-1 rounded text-base font-bold transition-colors ${
                      activeTab === "global"
                        ? "bg-primary text-white"
                        : "text-primary"
                    }`}
                  >
                    {t("btn.global")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {isLoading ? (
        <CountriesSkeletons />
      ) : !homeData || homeData?.length === 0 || error ? (
        <NoDataFound text={t("plans.noPlansAvailable")} />
      ) : filters?.country_codes?.length !== 0 ? (
        <BundleList
          expandedCountry={filters?.country_codes}
          supportedCountries={search}
        />
      ) : filters?.type === "global" || activeRadio === "cruises" ? (
        <>
          {/* TEMPORARILY HIDDEN - Duration Filter Chips
          <div className="flex flex-wrap justify-center gap-2 mb-8">
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
          */}

          {/* Country vs Regional Toggle (only for countries view) */}
          {activeTab === "countries" && hasRegionalBundles && (
            <div className="flex items-center justify-center gap-4 mb-6">
              <Typography
                variant="body1"
                sx={{
                  fontWeight: showRegional ? 400 : 600,
                  color: showRegional ? "text.secondary" : "primary.main",
                }}
              >
                {t("regionLanding.countrySpecific")} ({countryPlansCount})
              </Typography>
              <Switch
                checked={showRegional}
                onChange={(e) => {
                  setShowRegional(e.target.checked);
                  setUserManuallySwitched(true);
                }}
                color="primary"
              />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: showRegional ? 600 : 400,
                  color: showRegional ? "primary.main" : "text.secondary",
                }}
              >
                {t("regionLanding.regionalPlans")} ({regionalPlansCount})
              </Typography>
            </div>
          )}

          {/* Bundle Table */}
          <BundleTableCompact
            bundles={filteredBundles}
            onViewDetails={handleViewDetails}
            defaultSort={
              selectedDuration !== "all"
                ? { orderBy: "price", order: "asc" }
                : { orderBy: "price", order: "asc" }
            }
          />

          {/* Bundle Detail Modal */}
          {selectedBundle && isBundleModalOpen && (
            <BundleDetail
              bundle={selectedBundle}
              open={isBundleModalOpen}
              onClose={handleCloseModal}
            />
          )}
        </>
      ) : (
        <CountriesList
          data={homeData}
          region={filters?.type === "regions"}
          countryDisplay={filters?.type === ""}
          showAllCountries={showAllCountries}
          isLoading={isLoading}
          setShowAllCountries={setShowAllCountries}
        />
      )}

      {searchParams.get("order_id") && hoorayOpen && (
        <PaymentCompletion
          setOpenOrderDetail={() => {
            setHorrayOpen(false);
            setOpenOrderDetail(true);
          }}
        />
      )}
      {openOrderDetail && (
        <OrderPopup
          id={searchParams.get("order_id")}
          isFromPaymentCompletion={true}
          onClose={() => {
            setOpenOrderDetail(false);
            setFilters({ ...filters, order_id: null });
            dispatch(LimitedSignOut());
          }}
        />
      )}

      {/* Promotions Modal */}
      {shouldShowPromotionsModal && (
        <PromotionsModal
          open={shouldShowPromotionsModal}
          onClose={dismissPromotionsModal}
          onDismiss={dismissPromotionsModal}
          onRemindLater={remindPromotionsLater}
          onDontShowAgain={dontShowPromotionsAgain}
        />
      )}
    </>
  );
};

export default Plans;