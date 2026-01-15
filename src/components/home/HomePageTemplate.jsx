//UTILITIES
import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
//COMPONENTS
import TravelSearchWidget from "./TravelSearchWidget";
import BundleTableCompact from "./BundleTableCompact";
import BundleDetail from "../bundle/detail/BundleDetail";
import HowItWorksSection from "./HowItWorksSection";
import BenefitsSection from "./BenefitsSection";
import FAQSection from "./FAQSection";
import PopularDestinations from "../popular-destinations/PopularDestinations";
//HOOKS
import { useHomeCountries } from "../../core/custom-hook/useHomeCountries";
import { getBundlesByCountry } from "../../core/apis/homeAPI";
//MUI
import { CircularProgress, Typography, Button, Switch } from "@mui/material";
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

  // Duration options in days
  const durationOptions = useMemo(() => ({
    all: null,
    "7d": 7,
    "14d": 14,
    "30d": 30,
    "90d": 90,
    "1yr": 365,
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

  // Filter bundles based on duration and country count
  const filteredBundles = useMemo(() => {
    if (!bundles || bundles.length === 0) return [];

    let filtered = [...bundles];

    // Filter by country count (single-country vs regional)
    if (!showRegional) {
      // Show only country-specific bundles (count_countries === 1)
      filtered = filtered.filter((b) => (b.count_countries || 1) === 1);
    } else {
      // Show only regional bundles (count_countries > 1)
      filtered = filtered.filter((b) => (b.count_countries || 1) > 1);
    }

    // Filter by duration
    const maxDays = durationOptions[selectedDuration];
    if (maxDays !== null) {
      filtered = filtered.filter((b) => {
        const validity = b.validity || 0;
        return validity <= maxDays;
      });
    }

    // Sort: validity DESC (closest to selected duration first), then price ASC
    filtered.sort((a, b) => {
      // First sort by validity descending
      if ((b.validity || 0) !== (a.validity || 0)) {
        return (b.validity || 0) - (a.validity || 0);
      }
      // Then by price ascending
      return (a.price || 0) - (b.price || 0);
    });

    return filtered;
  }, [bundles, selectedDuration, showRegional, durationOptions]);

  // Count of country plans and regional plans
  const countryPlansCount = useMemo(() => {
    if (!bundles || bundles.length === 0) return 0;
    let filtered = bundles.filter((b) => (b.count_countries || 1) === 1);
    const maxDays = durationOptions[selectedDuration];
    if (maxDays !== null) {
      filtered = filtered.filter((b) => (b.validity || 0) <= maxDays);
    }
    return filtered.length;
  }, [bundles, selectedDuration, durationOptions]);

  const regionalPlansCount = useMemo(() => {
    if (!bundles || bundles.length === 0) return 0;
    let filtered = bundles.filter((b) => (b.count_countries || 1) > 1);
    const maxDays = durationOptions[selectedDuration];
    if (maxDays !== null) {
      filtered = filtered.filter((b) => (b.validity || 0) <= maxDays);
    }
    return filtered.length;
  }, [bundles, selectedDuration, durationOptions]);

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
    return bundles.some((b) => (b.count_countries || 1) > 1);
  }, [bundles]);

  // Handle bundle click to open modal
  const handleViewDetails = useCallback((bundle) => {
    setSelectedBundle(bundle);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedBundle(null);
  }, []);

  // Random hero background image
  const heroBackgrounds = useMemo(() => [
    "/images/backgrounds/home_shutterstock_1939831561.jpg",
    "/images/backgrounds/home_shutterstock_2620973827.jpg",
    "/images/backgrounds/home_shutterstock_424964827.jpg",
  ], []);

  const [heroImage] = useState(() => 
    heroBackgrounds[Math.floor(Math.random() * heroBackgrounds.length)]
  );

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: `url(${heroImage})`,
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
