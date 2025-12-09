import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, useMediaQuery, IconButton } from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// Popular countries with their URL slugs and hero images
const POPULAR_COUNTRIES = [
  {
    name: "Turkey",
    slug: "turkey",
    image: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2267492301_turkey.webp",
    flag: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/country/tur.png",
  },
  {
    name: "USA",
    slug: "usa",
    image: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2513128999_chicago.webp",
    flag: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/country/usa.png",
  },
  {
    name: "Thailand",
    slug: "thailand",
    image: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2617897393_thailand.webp",
    flag: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/country/tha.png",
  },
  {
    name: "UAE",
    slug: "uae",
    image: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2586153585_dubai.webp",
    flag: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/country/are.png",
  },
  {
    name: "Japan",
    slug: "japan",
    image: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2360483575_japan.webp",
    flag: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/country/jpn.png",
  },
  {
    name: "Canada",
    slug: "canada",
    image: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2633532499_canada.webp",
    flag: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/country/can.png",
  },
];

// Popular regions with their URL slugs and hero images
const POPULAR_REGIONS = [
  {
    name: "Europe",
    slug: "europe",
    image: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_314760704_europe.webp",
    flag: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/region/EUROPE.png",
  },
  {
    name: "Asia",
    slug: "asia",
    image: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2442381629_china.webp",
    flag: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/region/ASIA.png",
  },
  {
    name: "North America",
    slug: "north-america",
    image: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2513128999_chicago.webp",
    flag: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/region/NORTH_AMERICA.png",
  },
  {
    name: "Middle East",
    slug: "middle-east",
    image: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2586153585_dubai.webp",
    flag: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/region/MIDDLE_EAST.png",
  },
  {
    name: "Africa",
    slug: "africa",
    image: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2597617703_africa.webp",
    flag: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/region/AFRICA.png",
  },
  {
    name: "South America",
    slug: "south-america",
    image: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/landing/shutterstock_2608490949_south_america.webp",
    flag: "https://igtykprtntalfypbsdtp.supabase.co/storage/v1/object/public/media/region/SOUTH_AMERICA.png",
  },
];

const DestinationCard = ({ destination, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 aspect-[4/3]"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
        style={{
          backgroundImage: `url(${destination.image})`,
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 p-4 flex flex-col justify-end">
        <div className="flex items-center gap-3 mb-2">
          {destination.flag && (
            <img 
              src={destination.flag} 
              alt={`${destination.name} flag`}
              className="w-10 h-10 rounded-full object-cover shadow-lg border-2 border-white bg-white"
            />
          )}
        </div>
        <h3 className="text-white text-xl md:text-2xl font-bold group-hover:translate-y-[-4px] transition-transform duration-300">
          {destination.name}
        </h3>
      </div>

      {/* Hover Indicator */}
      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );
};

const Carousel = ({ items, onItemClick, title, icon }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef(null);
  const isSmall = useMediaQuery("(max-width: 640px)");
  const isMedium = useMediaQuery("(max-width: 1024px)");

  // Calculate items per view based on screen size
  const itemsPerView = isSmall ? 1 : isMedium ? 2 : 4;
  const maxIndex = Math.max(0, items.length - itemsPerView);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < maxIndex) {
      handleNext();
    }
    if (isRightSwipe && currentIndex > 0) {
      handlePrevious();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div className="mb-12">
      {/* Header with Navigation Buttons */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl md:text-2xl font-semibold text-gray-800 flex items-center gap-2">
          {icon}
          {title}
        </h3>
        
        {/* Navigation Buttons - Top Right (Desktop only) */}
        {items.length > itemsPerView && (
          <div className="hidden md:flex gap-2">
            <IconButton
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              sx={{
                bgcolor: "white",
                color: "primary.main",
                boxShadow: 2,
                width: 40,
                height: 40,
                "&:hover": { 
                  bgcolor: "primary.main",
                  color: "white",
                  boxShadow: 4,
                },
                "&:disabled": { 
                  bgcolor: "gray.100", 
                  color: "gray.400",
                  opacity: 0.5,
                },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              sx={{
                bgcolor: "white",
                color: "primary.main",
                boxShadow: 2,
                width: 40,
                height: 40,
                "&:hover": { 
                  bgcolor: "primary.main",
                  color: "white",
                  boxShadow: 4,
                },
                "&:disabled": { 
                  bgcolor: "gray.100", 
                  color: "gray.400",
                  opacity: 0.5,
                },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </div>
        )}
      </div>

      {/* Carousel Container */}
      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={carouselRef}
          className="flex transition-transform duration-300 ease-out gap-4 md:gap-6"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
          }}
        >
          {items.map((item) => (
            <div
              key={item.slug}
              className="flex-shrink-0"
              style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * (isSmall ? 16 : 24) / itemsPerView}px)` }}
            >
              <DestinationCard
                destination={item}
                onClick={() => onItemClick(item.slug)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator - Mobile */}
      {items.length > itemsPerView && (
        <div className="flex justify-center gap-2 mt-6 md:hidden">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const PopularDestinations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleDestinationClick = (slug) => {
    navigate(`/esim-destination/${slug}`);
  };

  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <Container maxWidth="lg">
        {/* Countries Carousel */}
        <Carousel
          items={POPULAR_COUNTRIES}
          onItemClick={handleDestinationClick}
          title={t("plans.popularDestinations.countries", {
            defaultValue: "Popular Countries",
          })}
          icon={<span className="text-2xl">🌍</span>}
        />

        {/* Regions Carousel */}
        <Carousel
          items={POPULAR_REGIONS}
          onItemClick={handleDestinationClick}
          title={t("plans.popularDestinations.regions", {
            defaultValue: "Popular Regions",
          })}
          icon={<PublicIcon className="text-primary" />}
        />
      </Container>
    </section>
  );
};

export default PopularDestinations;
