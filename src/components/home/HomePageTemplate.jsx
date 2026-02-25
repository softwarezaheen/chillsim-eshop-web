//UTILITIES
import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
//COMPONENTS
import TravelSearchWidget from "./TravelSearchWidget";
import BundleTableCompact from "./BundleTableCompact";
import BundleDetail from "../bundle/detail/BundleDetail";
import HowItWorksSection from "./HowItWorksSection";
import DownloadAppSection from "./DownloadAppSection";
import BenefitsSection from "./BenefitsSection";
import FAQSection from "./FAQSection";
import PopularDestinations from "../popular-destinations/PopularDestinations";
//HOOKS
import { useHomeCountries } from "../../core/custom-hook/useHomeCountries";
import { getBundlesByCountry } from "../../core/apis/homeAPI";
//MUI
import { CircularProgress, Typography, Button, Switch, useMediaQuery } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

/**
 * HomePageTemplate - A reusable homepage template for partner landing pages
 * 
 * @param {Object} props
 * @param {string} props.partnerName - Optional partner name for tracking
 * @param {string} props.partnerLogo - Optional partner logo URL
 * @param {string} props.recommendedByText - Optional text above the logo (default: "Recommended by")
 * @param {string} props.partnerBadgeStyle - Optional custom styling for the partner badge
 */
const HomePageTemplate = ({
  partnerName,
  partnerLogo,
  recommendedByText,
  partnerBadgeStyle = "bg-white/20 backdrop-blur-sm",
}) => {
  const { t } = useTranslation();
  const { data: homeData, isLoading: isLoadingCountries } = useHomeCountries();

  // Search state
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [showRegional, setShowRegional] = useState(false);
  const [userManuallySwitched, setUserManuallySwitched] = useState(false);

  // Results state
  const [bundles, setBundles] = useState([]);
  const [isLoadingBundles, setIsLoadingBundles] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Modal state
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ref for scrolling to results
  const resultsRef = useRef(null);
  
  // Ref for scrolling down from hero
  const contentRef = useRef(null);

  // Scroll to content section
  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Duration options in days (minimum validity required)
  const durationOptions = useMemo(() => ({
    all: null,
    1: 1,
    3: 3,
    7: 7,
    more: 7,
  }), []);

  // Get countries list from homeData
  const countries = useMemo(() => {
    return homeData?.countries || [];
  }, [homeData]);

  // Handle search
  const handleSearch = useCallback(async (selectedCountries) => {
    if (!selectedCountries || selectedCountries.length === 0) return;

    setIsLoadingBundles(true);
    setHasSearched(true);

    try {
      // Backend expects comma-separated country IDs (UUIDs), not country_code
      const countryIds = selectedCountries.map((c) => c.id).join(",");
      const response = await getBundlesByCountry(countryIds);

      // Response structure: { data: { data: [...bundles] } }
      if (response?.data?.data) {
        setBundles(response.data.data);
      } else {
        setBundles([]);
      }

      // Scroll to results section after search completes (with navbar offset)
      setTimeout(() => {
        if (resultsRef.current) {
          const navbarHeight = 80; // Approximate navbar height
          const elementPosition = resultsRef.current.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }, 100);
    } catch (error) {
      console.error("Error fetching bundles:", error);
      setBundles([]);
    } finally {
      setIsLoadingBundles(false);
    }
  }, []);

  // Deduplicate bundles by data amount and type
  const sortedBundles = useMemo(() => {
    if (!bundles || bundles.length === 0) return [];

    console.log('🔍 [Homepage Dedup] Raw bundles received:', bundles.length);

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

    // Group bundles by data + validity + type (country vs regional)
    const grouped = bundles.reduce((acc, bundle) => {
      const dataInMB = getDataInMB(bundle);
      const bundleType = ((bundle.count_countries || 1) === 1) ? 'country' : 'regional';
      // CRITICAL: Include validity in key for ALL bundles (not just unlimited)
      const validity = bundle.validity || 0;
      const key = `${dataInMB}-${validity}-${bundleType}`;
      
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(bundle);
      return acc;
    }, {});

    console.log('🔍 [Homepage Dedup] Grouped into', Object.keys(grouped).length, 'unique combinations');

    // For each data amount group, pick the bundle with best value
    const bestBundles = Object.values(grouped).map((group) => {
      const sorted = group.sort((a, b) => {
        // Prefer longer validity (better value)
        const validityDiff = (b.validity || 0) - (a.validity || 0);
        if (validityDiff !== 0) return validityDiff;
        
        // Then lowest price
        return getPrice(a) - getPrice(b);
      });
      return sorted[0];
    });

    console.log('🔍 [Homepage Dedup] Best bundles after dedup:', bestBundles.length);

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
    
    console.log('🔍 [Homepage Dedup] Final sorted bundles:', sorted.length);
    
    return sorted;
  }, [bundles]);

  // Filter bundles based on duration and country count
  const filteredBundles = useMemo(() => {
    if (!sortedBundles || sortedBundles.length === 0) return [];

    console.log('🔍 [Homepage Filter] Starting with sortedBundles:', sortedBundles.length);
    console.log('🔍 [Homepage Filter] showRegional:', showRegional, 'selectedDuration:', selectedDuration);

    let filtered = [...sortedBundles];

    // Filter by country count (single-country vs regional)
    if (!showRegional) {
      // Show only country-specific bundles (count_countries === 1)
      filtered = filtered.filter((b) => (b.count_countries || 1) === 1);
      console.log('🔍 [Homepage Filter] After country filter:', filtered.length);
    }
    // When showRegional is true, show all bundles (both country and regional)
    // No filtering needed - keep all bundles
    console.log('🔍 [Homepage Filter] After regional toggle (showing all):', filtered.length);

    // Filter by duration
    const minDays = durationOptions[selectedDuration];
    if (minDays !== null) {
      filtered = filtered.filter((b) => {
        const validity = b.validity || 0;
        return validity >= minDays;
      });
      console.log('🔍 [Homepage Filter] After duration filter (>=', minDays, 'days):', filtered.length);
    }

    // Sort based on selected duration
    if (minDays === null) {
      // For "all" duration, sort by price ascending
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
      console.log('🔍 [Homepage Filter] Sorted by price (all duration)');
    } else {
      // For filtered durations, sort by validity DESC (closest to selected first), then price ASC
      filtered.sort((a, b) => {
        // First sort by validity descending
        if ((b.validity || 0) !== (a.validity || 0)) {
          return (b.validity || 0) - (a.validity || 0);
        }
        // Then by price ascending
        return (a.price || 0) - (b.price || 0);
      });
      console.log('🔍 [Homepage Filter] Sorted by validity DESC, then price ASC');
    }

    console.log('🔍 [Homepage Filter] Final filtered bundles:', filtered.length);

    return filtered;
  }, [sortedBundles, selectedDuration, showRegional, durationOptions]);

  // Count of country plans and regional plans
  const countryPlansCount = useMemo(() => {
    if (!sortedBundles || sortedBundles.length === 0) return 0;
    let filtered = sortedBundles.filter((b) => (b.count_countries || 1) === 1);
    const minDays = durationOptions[selectedDuration];
    if (minDays !== null) {
      filtered = filtered.filter((b) => (b.validity || 0) >= minDays);
    }
    return filtered.length;
  }, [sortedBundles, selectedDuration, durationOptions]);

  const regionalPlansCount = useMemo(() => {
    if (!sortedBundles || sortedBundles.length === 0) return 0;
    let filtered = sortedBundles.filter((b) => (b.count_countries || 1) > 1);
    const minDays = durationOptions[selectedDuration];
    if (minDays !== null) {
      filtered = filtered.filter((b) => (b.validity || 0) >= minDays);
    }
    return filtered.length;
  }, [sortedBundles, selectedDuration, durationOptions]);

  // Reset results when search is cleared
  useEffect(() => {
    if (selectedCountries.length === 0 && hasSearched) {
      setBundles([]);
      setHasSearched(false);
      setShowRegional(false);
      setUserManuallySwitched(false);
      setSelectedDuration("all");
    }
  }, [selectedCountries, hasSearched]);

  // Auto-switch to regional on initial search if no country plans but regional exists
  // Only if user hasn't manually switched back to country
  useEffect(() => {
    if (hasSearched && !isLoadingBundles && countryPlansCount === 0 && regionalPlansCount > 0 && !showRegional && !userManuallySwitched) {
      setShowRegional(true);
    }
  }, [hasSearched, isLoadingBundles, countryPlansCount, regionalPlansCount, showRegional, userManuallySwitched]);

  // Reset manual switch flag when new search is performed
  useEffect(() => {
    if (isLoadingBundles) {
      setUserManuallySwitched(false);
      setShowRegional(false);
    }
  }, [isLoadingBundles]);

  // Check if regional bundles are available
  const hasRegionalBundles = useMemo(() => {
    return sortedBundles.some((b) => (b.count_countries || 1) > 1);
  }, [sortedBundles]);

  // Handle bundle click to open modal
  const handleViewDetails = useCallback((bundle) => {
    setSelectedBundle(bundle);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedBundle(null);
  }, []);

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Random hero background image
  const heroBackgrounds = useMemo(() => [
    // desktopPosition defaults to "center", mobilePosition shifts focal point on small screens
    { src: "/images/backgrounds/home_shutterstock_1939831561.jpg", mobilePosition: "center" },
    { src: "/images/backgrounds/home_shutterstock_2620973827.jpg", mobilePosition: "center" },
    { src: "/images/backgrounds/home_shutterstock_424964827.jpg",  mobilePosition: "70% center" },
  ], []);

  const [heroImageObj] = useState(() =>
    heroBackgrounds[Math.floor(Math.random() * heroBackgrounds.length)]
  );

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover scale-105"
          style={{
            backgroundImage: `url(${heroImageObj.src})`,
            backgroundPosition: isMobile ? heroImageObj.mobilePosition : "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-4 py-16 md:py-24">
          {/* Partner Badge - Only show if partner logo is provided */}
          {partnerLogo && (
            <div className={`mb-6 px-6 py-3 rounded-2xl md:rounded-full ${partnerBadgeStyle}`}>
              <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3">
                <span className="text-white/90 text-xs md:text-sm font-medium">
                  {recommendedByText || t("home.partner.recommendedBy")}
                </span>
                <img 
                  src={partnerLogo} 
                  alt={partnerName || "Partner"} 
                  className="h-6 md:h-8 object-contain"
                />
              </div>
            </div>
          )}

          {/* Hero Text */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {t("home.hero.title")}
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
              {t("home.hero.subtitle")}
            </p>
          </div>

          {/* Search Widget */}
          <div className="w-full max-w-xl">
            <TravelSearchWidget
              countries={countries}
              isLoading={isLoadingCountries || isLoadingBundles}
              selectedCountries={selectedCountries}
              setSelectedCountries={setSelectedCountries}
              selectedDuration={selectedDuration}
              setSelectedDuration={setSelectedDuration}
              onSearch={handleSearch}
            />
            {/* Download App Button */}
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => {
                  const ua = navigator.userAgent || "";
                  if (/android/i.test(ua)) {
                    window.location.href = "https://play.google.com/store/apps/details?id=zaheen.esim.chillsim";
                  } else if (/iphone|ipad|ipod/i.test(ua)) {
                    window.location.href = "https://apps.apple.com/us/app/chillsim-travel-esim/id6747967151";
                  } else {
                    window.open("https://chillsim.net/download", "_blank");
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white whitespace-nowrap transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                <img src="/media/apple.svg" alt="" style={{ width: 18, height: 18 }} />
                <img src="/media/googlePlay.svg" alt="" style={{ width: 18, height: 18 }} />
                {t("home.downloadApp.button")}
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer z-10 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          aria-label="Scroll down"
        >
          <KeyboardArrowDownIcon className="w-6 h-6 text-white animate-bounce" sx={{ fontSize: 28 }} />
        </button>
      </section>

      {/* Content anchor for scroll */}
      <div ref={contentRef} />

      {/* Results Section - Only show after search */}
      {hasSearched && (
        <section ref={resultsRef} className="py-8 md:py-12 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            {/* Results Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                    {t("home.results.title")}
                  </h2>
                  {/* Show selected country names */}
                  <p className="text-sm text-gray-600">
                    {selectedCountries.map((c) => c.country).join(", ")}
                    {" • "}
                    {filteredBundles.length} {t("home.results.plansFound")}
                  </p>
                </div>

                {/* Regional Toggle with switch */}
                {hasRegionalBundles && (
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
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoadingBundles && (
              <div className="flex justify-center items-center py-12">
                <CircularProgress />
              </div>
            )}

            {/* Results Table */}
            {!isLoadingBundles && filteredBundles.length > 0 && (
              <BundleTableCompact
                bundles={filteredBundles}
                onViewDetails={handleViewDetails}
                selectedDuration={selectedDuration}
                defaultSort={
                  selectedDuration !== "all"
                    ? { orderBy: "price", order: "asc" }
                    : { orderBy: "price", order: "asc" }
                }
              />
            )}

            {/* No Results - show message when no plans for current view */}
            {!isLoadingBundles && filteredBundles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">{t("home.results.noPlans")}</p>
                {/* If no country plans but regional exists, show hint */}
                {!showRegional && regionalPlansCount > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    {t("home.results.tryRegional", { count: regionalPlansCount })}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Popular Destinations */}
      <section className="py-8 md:py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {t("home.popular.title")}
          </h2>
          <p className="text-gray-600">
            {t("home.popular.subtitle")}
          </p>
        </div>
        <PopularDestinations />
      </section>

      {/* How It Works */}
      <HowItWorksSection />

      {/* Download App */}
      <DownloadAppSection />

      {/* Benefits */}
      <BenefitsSection />

      {/* FAQ */}
      <FAQSection />

      {/* Bundle Details Modal - Use the same BundleDetail from /plans */}
      {isModalOpen && selectedBundle && (
        <BundleDetail
          bundle={selectedBundle}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default HomePageTemplate;
