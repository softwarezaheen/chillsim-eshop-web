import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import {
  Button,
  Card,
  CardContent,
  Chip,
  Container as MuiContainer,
  Skeleton,
  Switch,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  CheckCircle,
  Language,
  Security,
  Speed,
  Public,
  Shield,
} from "@mui/icons-material";
import { getBundlesByRegion, getBundlesByCountry } from "../../core/apis/homeAPI";
import BundleTableCompact from "../../components/home/BundleTableCompact";
import BundleDetail from "../../components/bundle/detail/BundleDetail";
import NoDataFound from "../../components/shared/no-data-found/NoDataFound";
import { gtmViewItemListEvent } from "../../core/utils/gtm";
import { useHomeCountries } from "../../core/custom-hook/useHomeCountries";

// Region URL to region tag mapping
// These must match the actual region tags in the backend database
const REGION_URL_TO_TAG = {
  europe: "EUROPE",
  africa: "AFRICA",
  "middle-east": "MIDDLE_EAST",
  asia: "ASIA",
  "north-america": "NORTH_AMERICA",
  "south-america": "SOUTH_AMERICA",
  oceania: "OCEANIA",
};

// Country URL to ISO code mapping
const COUNTRY_URL_TO_CODE = {
  turkey: "TR",
  usa: "US",
  canada: "CA",
  thailand: "TH",
  uae: "AE",
  japan: "JP",
};

// Country URL to ISO3 code mapping (what's in the database)
const COUNTRY_URL_TO_ISO3 = {
  turkey: "TUR",
  usa: "USA",
  canada: "CAN",
  thailand: "THA",
  uae: "ARE",
  japan: "JPN",
};

// Helper to extract type from URL (handles /esim-destination/europe format)
const getTypeFromUrl = (pathname) => {
  // Try /esim-destination/type format
  const match = pathname.match(/\/esim-destination\/([^\/]+)/);
  return match ? match[1] : null;
};

// Helper to determine if the type is a region or country code
const isCountryCode = (type) => {
  // Check if it's in our country URL mapping first
  if (type && COUNTRY_URL_TO_CODE[type.toLowerCase()]) {
    return true;
  }
  // Fallback: Country codes are typically 2-3 uppercase letters (ISO codes)
  return type && /^[A-Z]{2,3}$/.test(type);
};

// Hero images for each region (placeholders - replace with CDN images for production)
const REGION_HERO_IMAGES = {
  EUROPE:
    "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_314760704_europe.webp",
  AFRICA:
    "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2597617703_africa.webp",
  MIDDLE_EAST:
    "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2586153585_dubai.webp",
  ASIA:
    "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2442381629_china.webp",
  NORTH_AMERICA:
    "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2513128999_chicago.webp",
  SOUTH_AMERICA:
    "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2608490949_south_america.webp",
};

// Hero images for country landing pages
const COUNTRY_HERO_IMAGES = {
  TR: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2267492301_turkey.webp",
  US: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2513128999_chicago.webp",
  CA: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2633532499_canada.webp",
  TH: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2617897393_thailand.webp",
  AE: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2586153585_dubai.webp",
  JP: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2360483575_japan.webp",
};

const RegionLanding = () => {
  const { type } = useParams(); // e.g., "europe", "africa", "US", "FR"
  const location = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isSmall = useMediaQuery("(max-width: 768px)");

  // Modal state for bundle details
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Duration filter state
  const [selectedDuration, setSelectedDuration] = useState("all");
  
  // Country vs Regional toggle (only for country landing pages)
  const [showRegional, setShowRegional] = useState(false);
  const [userManuallySwitched, setUserManuallySwitched] = useState(false);

  // Support URL parsing from pathname
  const typeSlug = type || getTypeFromUrl(location.pathname);
  
  // Determine if this is a country or region
  const isCountry = isCountryCode(typeSlug);

  // Get region tag from URL parameter (only if it's a region)
  const regionTag = !isCountry ? REGION_URL_TO_TAG[typeSlug] : null;
  
  // Get country code from URL parameter (only if it's a country)
  const countryCode = isCountry 
    ? (COUNTRY_URL_TO_CODE[typeSlug?.toLowerCase()] || typeSlug?.toUpperCase())
    : null;

  // Get ISO3 code for API lookup (only if it's a country)
  const iso3Code = isCountry ? COUNTRY_URL_TO_ISO3[typeSlug?.toLowerCase()] : null;

  // Fetch all regions from home data to get the correct icon
  const { data: homeData, isLoading: isLoadingHomeData } = useHomeCountries();

  // Find the matching region data from backend
  const regionData = useMemo(() => {
    if (!homeData?.regions || !regionTag) return null;
    return homeData.regions.find((r) => r.region_code === regionTag);
  }, [homeData, regionTag]);

  // Convert ISO3 code to UUID for API call (language-independent lookup)
  const countryUUID = useMemo(() => {
    if (!isCountry || !homeData?.countries || !iso3Code) return null;
    const country = homeData.countries.find((c) => c.iso3_code === iso3Code);
    return country?.id || null;
  }, [homeData, iso3Code, isCountry]);

  // Fetch bundles for this region or country
  const { data: bundles, isLoading } = useQuery({
    queryKey: [`landing-${typeSlug}`, regionTag, countryCode, countryUUID, isCountry],
    queryFn: () => {
      if (isCountry) {
        return getBundlesByCountry(countryUUID).then((res) => res?.data?.data);
      } else {
        return getBundlesByRegion(regionTag).then((res) => res?.data?.data);
      }
    },
    enabled: !!(isCountry ? countryUUID : regionTag),
    onSuccess: (data) => {
      if (data && data.length > 0 && regionData) {
        gtmViewItemListEvent(
          data,
          regionData.region_name,
          regionData.region_code,
          isCountry ? "country_landing" : "region_landing"
        );
      }
    },
  });

  // Sort bundles by data amount (descending), then by price (ascending)
  const sortedBundles = useMemo(() => {
    if (!bundles) return [];

    // Helper to convert data to MB for comparison
    const getDataInMB = (bundle) => {
      // Handle unlimited plans
      if (bundle.unlimited || bundle.gprs_limit < 0) {
        return Infinity; // Unlimited plans should sort to the end
      }
      
      // If gprs_limit is already in MB (value > 100), use it directly
      if (bundle.gprs_limit >= 100) {
        return bundle.gprs_limit;
      }
      
      // Otherwise it's in GB, convert to MB
      return bundle.gprs_limit * 1024;
    };

    // Helper to get numeric price for comparison
    const getPrice = (bundle) => {
      return parseFloat(bundle.price || bundle.original_price || 0);
    };

    // Group bundles by data amount AND bundle type (country vs regional for country pages)
    const grouped = bundles.reduce((acc, bundle) => {
      const dataInMB = getDataInMB(bundle);
      const bundleType = isCountry 
        ? ((bundle.count_countries || 1) === 1 ? 'country' : 'regional')
        : 'all';
      const key = `${dataInMB}-${bundleType}`;
      
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
        const validityDiff = (b.validity_days || b.validity || 0) - (a.validity_days || a.validity || 0);
        if (validityDiff !== 0) return validityDiff;
        
        // Then lowest price
        return getPrice(a) - getPrice(b);
      });
      return sorted[0]; // Return best bundle from this group
    });

    // Sort by data amount (ascending: 1GB → 50GB), then by price (ascending)
    const sorted = bestBundles
      .sort((a, b) => {
        const aData = getDataInMB(a);
        const bData = getDataInMB(b);
        
        // Unlimited plans go to the end
        if (aData === Infinity && bData === Infinity) {
          return getPrice(a) - getPrice(b); // Sort unlimited by price
        }
        if (aData === Infinity) return 1;
        if (bData === Infinity) return -1;
        
        // Sort by data (ascending: smaller data first)
        const dataDiff = aData - bData;
        if (dataDiff !== 0) return dataDiff;
        
        // If same data, sort by price (ascending - cheapest first)
        return getPrice(a) - getPrice(b);
      });
    
    return sorted;
  }, [bundles]);

  // Duration chip options
  const durationChips = [
    { key: "all", label: t("home.duration.all") },
    { key: "7d", label: t("home.duration.7d") },
    { key: "14d", label: t("home.duration.14d") },
    { key: "30d", label: t("home.duration.30d") },
    { key: "90d", label: t("home.duration.90d") },
    { key: "1yr", label: t("home.duration.1yr") },
  ];

  // Filter bundles by duration
  const filteredBundles = useMemo(() => {
    if (!sortedBundles) return [];
    
    let filtered = sortedBundles;
    
    // For country landing pages, filter by country count (single-country vs regional)
    if (isCountry) {
      if (!showRegional) {
        // Show only country-specific bundles (count_countries === 1)
        filtered = filtered.filter((b) => (b.count_countries || 1) === 1);
      } else {
        // Show only regional bundles (count_countries > 1)
        filtered = filtered.filter((b) => (b.count_countries || 1) > 1);
      }
    }
    
    // Filter by duration
    if (selectedDuration === "all") {
      return filtered;
    }

    const filterByDays = (bundle) => {
      const validity = bundle.validity_days || bundle.validity || 0;
      
      switch (selectedDuration) {
        case "7d":
          return validity <= 7;
        case "14d":
          return validity <= 14;
        case "30d":
          return validity <= 30;
        case "90d":
          return validity <= 90;
        case "1yr":
          return validity <= 365;
        default:
          return true;
      }
    };

    const durationFiltered = filtered.filter(filterByDays);
    
    // Sort by validity descending (longest validity first) when duration filter is active
    return durationFiltered.sort((a, b) => {
      const aValidity = a.validity_days || a.validity || 0;
      const bValidity = b.validity_days || b.validity || 0;
      return bValidity - aValidity;
    });
  }, [sortedBundles, selectedDuration, isCountry, showRegional]);

  // Count of country plans and regional plans (for country landing pages only)
  const countryPlansCount = useMemo(() => {
    if (!isCountry || !sortedBundles) return 0;
    let filtered = sortedBundles.filter((b) => (b.count_countries || 1) === 1);
    
    // Apply duration filter
    if (selectedDuration !== "all") {
      filtered = filtered.filter((b) => {
        const validity = b.validity_days || b.validity || 0;
        switch (selectedDuration) {
          case "7d": return validity <= 7;
          case "14d": return validity <= 14;
          case "30d": return validity <= 30;
          case "90d": return validity <= 90;
          case "1yr": return validity <= 365;
          default: return true;
        }
      });
    }
    
    return filtered.length;
  }, [sortedBundles, selectedDuration, isCountry]);

  const regionalPlansCount = useMemo(() => {
    if (!isCountry || !sortedBundles) return 0;
    let filtered = sortedBundles.filter((b) => (b.count_countries || 1) > 1);
    
    // Apply duration filter
    if (selectedDuration !== "all") {
      filtered = filtered.filter((b) => {
        const validity = b.validity_days || b.validity || 0;
        switch (selectedDuration) {
          case "7d": return validity <= 7;
          case "14d": return validity <= 14;
          case "30d": return validity <= 30;
          case "90d": return validity <= 90;
          case "1yr": return validity <= 365;
          default: return true;
        }
      });
    }
    
    return filtered.length;
  }, [sortedBundles, selectedDuration, isCountry]);

  // Check if regional bundles are available (for country pages)
  // Use sortedBundles to check after deduplication
  const hasRegionalBundles = useMemo(() => {
    if (!isCountry || !sortedBundles) return false;
    return sortedBundles.some((b) => (b.count_countries || 1) > 1);
  }, [sortedBundles, isCountry]);

  // Auto-switch to regional on initial load if no country plans but regional exists
  // Only for country pages and if user hasn't manually switched
  useEffect(() => {
    if (isCountry && !isLoading && countryPlansCount === 0 && regionalPlansCount > 0 && !showRegional && !userManuallySwitched) {
      setShowRegional(true);
    }
  }, [isCountry, isLoading, countryPlansCount, regionalPlansCount, showRegional, userManuallySwitched]);

  // Auto-switch to regional if no country plans available when duration filter changes
  useEffect(() => {
    if (isCountry && !userManuallySwitched) {
      // Only auto-switch if no country plans available
      if (countryPlansCount === 0 && regionalPlansCount > 0) {
        setShowRegional(true);
      }
      // If user is on regional view but no regional plans available, switch back to country
      else if (showRegional && regionalPlansCount === 0 && countryPlansCount > 0) {
        setShowRegional(false);
      }
      // Otherwise preserve user's choice
    }
  }, [selectedDuration, isCountry, countryPlansCount, regionalPlansCount, userManuallySwitched, showRegional]);

  // Modal handlers
  const handleViewDetails = useCallback((bundle) => {
    setSelectedBundle(bundle);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedBundle(null);
  }, []);

  useEffect(() => {
    // Don't validate while home data is still loading
    if (isLoadingHomeData) return;
    
    if (!isCountry && !regionTag) {
      navigate("/");
    }
    // Only redirect if homeData has loaded AND we can't find the UUID for a valid ISO3 code
    if (isCountry && iso3Code && homeData?.countries && !countryUUID) {
      navigate("/");
    }
  }, [isCountry, regionTag, iso3Code, countryUUID, homeData, isLoadingHomeData, navigate]);

  if ((!isCountry && !regionTag) || (isCountry && !countryCode)) {
    return null;
  }

  // Show nothing while loading - preloader in index.html handles this
  if (isLoadingHomeData || isLoading) {
    return null;
  }

  // Get hero image for region or country
  const heroImage = isCountry ? COUNTRY_HERO_IMAGES[countryCode] : REGION_HERO_IMAGES[regionTag];
  
  // Get display name (region from backend or country from translation)
  const displayName = isCountry 
    ? t(`landing.${typeSlug}.hero.title`, { defaultValue: typeSlug })
    : (regionData?.region_name || t(`landing.${typeSlug}.hero.title`, { defaultValue: typeSlug }));
  
  // Get region icon from backend data (regions only)
  const regionIcon = regionData?.icon;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] w-screen overflow-hidden -mx-[50vw] left-[50%] right-[50%]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        {/* Hero Content - Centered */}
        <div className="relative h-full flex items-center justify-center">
          <MuiContainer maxWidth="lg" className="text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
                {t(`landing.${typeSlug}.hero.title`, {
                  defaultValue: `eSIM for ${displayName}`,
                })}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8">
                {t(`landing.${typeSlug}.hero.subtitle`, {
                  defaultValue: `Stay connected across ${displayName} with affordable, reliable eSIM plans`,
                })}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => {
                    document
                      .getElementById("plans-section")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    textTransform: "none",
                  }}
                >
                  {t("landing.cta.viewPlans", { defaultValue: "View Plans" })}
                </Button>
              </div>
            </div>
          </MuiContainer>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans-section" className="py-16 bg-gray-50">
        <MuiContainer maxWidth="lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t(`landing.${typeSlug}.plans.title`, {
                defaultValue: `Choose an eSIM data plan for ${displayName}`,
              })}
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              {t(`landing.${typeSlug}.plans.subtitle`, {
                defaultValue: `Affordable plans with wide coverage across ${displayName}`,
              })}
            </p>

            {/* Duration Chips */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {durationChips.map((chip) => (
                <Chip
                  key={chip.key}
                  label={chip.label}
                  onClick={() => setSelectedDuration(chip.key)}
                  variant={selectedDuration === chip.key ? "filled" : "outlined"}
                  color={selectedDuration === chip.key ? "primary" : "default"}
                  className={`cursor-pointer transition-all ${
                    selectedDuration === chip.key
                      ? "!bg-primary !text-white font-semibold"
                      : "!border-gray-300 !text-gray-700 hover:!bg-gray-100"
                  }`}
                />
              ))}
            </div>

            {/* Country vs Regional Toggle (only for country landing pages) */}
            {isCountry && hasRegionalBundles && (
              <div className="flex justify-center mb-8">
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
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">{t("home.results.loading")}</p>
              </div>
            </div>
          ) : filteredBundles.length > 0 ? (
            <BundleTableCompact
              bundles={filteredBundles}
              onViewDetails={handleViewDetails}
              selectedDuration={selectedDuration}
              defaultSort={
                selectedDuration === "all" 
                  ? { orderBy: "price", order: "asc" }
                  : { orderBy: "validity", order: "desc" }
              }
            />
          ) : (
            <NoDataFound />
          )}

          <div className="text-center mt-8">
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                if (isCountry && countryUUID) {
                  // Country landing: filter by country UUID
                  navigate(`/plans/land?country_codes=${countryUUID}`);
                } else if (!isCountry && regionTag) {
                  // Region landing: show regions type
                  navigate(`/plans/land?type=regions`);
                } else {
                  // Fallback
                  navigate(`/plans/land`);
                }
              }}
              sx={{ textTransform: "none" }}
            >
              {t("landing.cta.viewAllPlans", {
                defaultValue: "View All Plans",
              })}
            </Button>
          </div>
        </MuiContainer>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <MuiContainer maxWidth="lg">
          <h2 className="text-4xl font-bold text-center mb-12">
            {t("landing.howItWorks.title", {
              defaultValue: `How to get an eSIM for ${displayName}`,
            })}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t("landing.howItWorks.step1.title", {
                  defaultValue: "Choose a data plan",
                })}
              </h3>
              <p className="text-gray-600">
                {t("landing.howItWorks.step1.description", {
                  defaultValue:
                    "Select how much data you need, buy the plan, and wait for the confirmation email with a QR code.",
                })}
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t("landing.howItWorks.step2.title", {
                  defaultValue: "Install your eSIM",
                })}
              </h3>
              <p className="text-gray-600">
                {t("landing.howItWorks.step2.description", {
                  defaultValue:
                    "Scan the QR code from our email and follow the simple instructions on your device.",
                })}
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t("landing.howItWorks.step3.title", {
                  defaultValue: "Enjoy your plan",
                })}
              </h3>
              <p className="text-gray-600">
                {t("landing.howItWorks.step3.description", {
                  defaultValue:
                    "Your data plan will activate automatically when you arrive at your destination!",
                })}
              </p>
            </div>
          </div>
        </MuiContainer>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <MuiContainer maxWidth="lg">
          <h2 className="text-4xl font-bold text-center mb-12">
            {t(`landing.${typeSlug}.features.title`, {
              defaultValue: `Why choose ChillSIM for ${displayName} travel?`,
            })}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Instant Connectivity */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Speed className="text-primary w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                {t("landing.features.instantConnectivity.title", {
                  defaultValue: "Instant Connectivity",
                })}
              </h3>
              <p className="text-gray-600">
                {t("landing.features.instantConnectivity.description", {
                  defaultValue:
                    "Get connected the moment you land. No waiting, no hassle, no SIM card swaps.",
                })}
              </p>
            </div>

            {/* Feature 2 - Wide Coverage */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Public className="text-primary w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                {t("landing.features.wideCoverage.title", {
                  defaultValue: "Wide Coverage",
                })}
              </h3>
              <p className="text-gray-600">
                {t("landing.features.wideCoverage.description", {
                  defaultValue:
                    "Stay connected across multiple countries with a single eSIM. Perfect for multi-country trips.",
                })}
              </p>
            </div>

            {/* Feature 3 - Affordable Plans */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <CheckCircle className="text-primary w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                {t("landing.features.affordablePlans.title", {
                  defaultValue: "Affordable Plans",
                })}
              </h3>
              <p className="text-gray-600">
                {t("landing.features.affordablePlans.description", {
                  defaultValue:
                    "Competitive pricing with transparent costs. No hidden fees or surprise charges.",
                })}
              </p>
            </div>

            {/* Feature 4 - Easy to Use */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Language className="text-primary w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                {t("landing.features.easyToUse.title", {
                  defaultValue: "Easy to Use",
                })}
              </h3>
              <p className="text-gray-600">
                {t("landing.features.easyToUse.description", {
                  defaultValue:
                    "Simple setup in minutes. Just scan a QR code and you're ready to go.",
                })}
              </p>
            </div>

            {/* Feature 5 - Secure Connection */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Security className="text-primary w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                {t("landing.features.secureConnection.title", {
                  defaultValue: "Secure Connection",
                })}
              </h3>
              <p className="text-gray-600">
                {t("landing.features.secureConnection.description", {
                  defaultValue:
                    "Your data is protected with enterprise-grade security on trusted networks.",
                })}
              </p>
            </div>

            {/* Feature 6 - 24/7 Support */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Shield className="text-primary w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                {t("landing.features.support.title", {
                  defaultValue: "24/7 Support",
                })}
              </h3>
              <p className="text-gray-600">
                {t("landing.features.support.description", {
                  defaultValue:
                    "Get help whenever you need it. Our support team is always ready to assist you.",
                })}
              </p>
            </div>
          </div>
        </MuiContainer>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-white">
        <MuiContainer maxWidth="md">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold mb-6">
              {t(`landing.${typeSlug}.seo.title`, {
                defaultValue: `Discover ${displayName} with ChillSIM eSIM`,
              })}
            </h2>
            <div
              className="[&_p]:text-justify"
              dangerouslySetInnerHTML={{
                __html: t(`landing.${typeSlug}.seo.content`, {
                  defaultValue: `
                    <p>Planning a trip to {regionName}? Stay connected effortlessly with ChillSIM's reliable eSIM service. Our digital SIM cards offer seamless connectivity across the entire region, allowing you to explore without worrying about expensive roaming charges or inconvenient physical local SIM cards. Yes you read it correctly, you can get your data from a secondary sim which is digital, while keeping your primary sim also in your phone exclusively for voice services. Scan the QR code, go through with the installation steps, and turn on data from the Esim as soon as you reach your destination!</p>
                    
                    <p>With ChillSIM, you get instant access to high-speed mobile data the moment you land in ${displayName}. Whether you're exploring bustling cities, ancient landmarks, or stunning natural landscapes, our eSIM keeps you connected to what matters most - sharing your adventures, navigating with ease, and staying in touch with loved ones back home.</p>
                    
                    <h3>Why Choose ChillSIM for Your ${displayName} Adventure?</h3>
                    <p>Our eSIM solution is designed specifically for modern travelers who demand reliability, affordability, and convenience. Unlike traditional SIM cards that require physical swapping, our eSIM is installed digitally in minutes. Simply scan a QR code before or during your trip, and you're ready to go. Don’t forget Esims need internet to be installed, therefore it is recommended that you install them before your trip. Don’t worry about the expiration date, the validity period only starts when the sim registers in the destination network!</p>
                    
                    <p>ChillSIM partners with top-tier mobile networks across ${displayName} to ensure you get the best possible coverage and speeds wherever your journey takes you. From major cities to remote destinations, we've got you covered.</p>
                    
                    <h3>Perfect for Every Type of Traveler</h3>
                    <p>Whether you're a business traveler needing reliable connectivity for video calls and emails, a backpacker exploring multiple countries, or a family on vacation wanting to share memories in real-time, ChillSIM has the perfect plan for you. Choose from flexible data options that match your usage needs and travel duration.</p>
                    
                    <p>Join thousands of satisfied travelers who trust ChillSIM to keep them connected across ${displayName}. Get your eSIM today and travel with confidence!</p>
                  `,
                }),
              }}
            />
          </div>
        </MuiContainer>
      </section>

      {/* Disclaimers Section */}
      <section className="py-12 bg-gray-50">
        <MuiContainer maxWidth="lg">
          <div className="bg-blue-50 border-l-4 border-primary p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">
              {t("landing.disclaimers.title", {
                defaultValue: "Important Information",
              })}
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="text-primary mt-1 flex-shrink-0" />
                <span>
                  {t("landing.disclaimers.deviceCompatibility", {
                    defaultValue:
                      "Make sure your device supports eSIM technology before purchasing.",
                  })}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-primary mt-1 flex-shrink-0" />
                <span>
                  {t("landing.disclaimers.activation", {
                    defaultValue:
                      "Your eSIM will activate automatically when you connect to a supported network in your destination.",
                  })}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-primary mt-1 flex-shrink-0" />
                <span>
                  {t("landing.disclaimers.installation", {
                    defaultValue:
                      "Install your eSIM before traveling. You'll need an internet connection to complete the installation.",
                  })}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-primary mt-1 flex-shrink-0" />
                <span>
                  {t("landing.disclaimers.validity", {
                    defaultValue:
                      "Data plans are valid for the specified duration starting from activation.",
                  })}
                </span>
              </li>
            </ul>
          </div>
        </MuiContainer>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <MuiContainer maxWidth="md">
          <h2 className="text-4xl font-bold text-center mb-12">
            {t("landing.faq.title", {
              defaultValue: "Frequently Asked Questions",
            })}
          </h2>

          <div className="space-y-6">
            {/* FAQ 1 */}
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">
                  {t(`landing.${typeSlug}.faq.q1.question`, {
                    defaultValue: `What's the best eSIM for ${displayName}?`,
                  })}
                </h3>
                <p className="text-gray-600">
                  {t(`landing.${typeSlug}.faq.q1.answer`, {
                    defaultValue: `ChillSIM offers reliable and affordable eSIM plans specifically designed for travelers in ${displayName}. With wide coverage across multiple countries, competitive pricing, and instant activation, it's the perfect choice for your trip.`,
                  })}
                </p>
              </CardContent>
            </Card>

            {/* FAQ 2 */}
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">
                  {t("landing.faq.q2.question", {
                    defaultValue: "How do I install an eSIM?",
                  })}
                </h3>
                <p className="text-gray-600">
                  {t("landing.faq.q2.answer", {
                    defaultValue:
                      "After purchasing, you'll receive a QR code via email. Simply scan this code with your device's camera in the eSIM settings, and follow the on-screen instructions. The entire process takes just a few minutes.",
                  })}
                </p>
              </CardContent>
            </Card>

            {/* FAQ 3 */}
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">
                  {t("landing.faq.q3.question", {
                    defaultValue: "When does my eSIM activate?",
                  })}
                </h3>
                <p className="text-gray-600">
                  {t("landing.faq.q3.answer", {
                    defaultValue:
                      "Your eSIM activates automatically when you connect to a supported network at your destination. The validity period starts from the moment of activation.",
                  })}
                </p>
              </CardContent>
            </Card>

            {/* FAQ 4 */}
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">
                  {t("landing.faq.q4.question", {
                    defaultValue: "Can I use my eSIM in multiple countries?",
                  })}
                </h3>
                <p className="text-gray-600">
                  {t(`landing.${typeSlug}.faq.q4.answer`, {
                    defaultValue: `Yes! Our ${displayName} eSIM plans work across multiple countries in the region. You can travel freely without needing to purchase separate SIM cards for each country.`,
                  })}
                </p>
              </CardContent>
            </Card>

            {/* FAQ 5 */}
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">
                  {t("landing.faq.q5.question", {
                    defaultValue: "What if I need more data?",
                  })}
                </h3>
                <p className="text-gray-600">
                  {t("landing.faq.q5.answer", {
                    defaultValue:
                      "You can easily top up your eSIM with additional data through our app or website. Top-ups are available anytime during your trip.",
                  })}
                </p>
              </CardContent>
            </Card>
          </div>
        </MuiContainer>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <MuiContainer maxWidth="md">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">
              {t("landing.cta.final.title", {
                defaultValue: "Ready to stay connected?",
              })}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {t("landing.cta.final.subtitle", {
                defaultValue:
                  "Get your eSIM today and travel with confidence",
              })}
            </p>
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                document
                  .getElementById("plans-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              sx={{
                bgcolor: "white",
                color: "primary.main",
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.9)",
                },
              }}
            >
              {t("landing.cta.final.button", {
                defaultValue: "Choose Your Plan",
              })}
            </Button>
          </div>
        </MuiContainer>
      </section>

      {/* Bundle Detail Modal */}
      {selectedBundle && (
        <BundleDetail
          open={isModalOpen}
          onClose={handleCloseModal}
          bundle={selectedBundle}
        />
      )}
    </div>
  );
};

export default RegionLanding;
