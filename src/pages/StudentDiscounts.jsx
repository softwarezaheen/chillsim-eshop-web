//UTILITIES
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
//COMPONENTS
import Container from "../components/Container";
import BenefitsSection from "../components/home/BenefitsSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
//MUI
import { Button } from "@mui/material";
import ArrowForward from "@mui/icons-material/ArrowForward";

// StudentBeans logo - stored locally
const STUDENTBEANS_LOGO = "/images/partners/studentbeans-logo.svg";

/**
 * StudentDiscounts - Static page for 30% student discount via StudentBeans
 * Clean layout with emphasis on discount percentage
 */
const StudentDiscounts = () => {
  const { t } = useTranslation();
  
  // StudentBeans links by country
  const studentBeansLinks = [
    {
      countryCode: "UK",
      countryName: t("studentDiscounts.countries.uk"),
      url: "https://www.studentbeans.com/en-gb/uk/beansid-connect/hosted/chill-sim",
    },
    {
      countryCode: "US",
      countryName: t("studentDiscounts.countries.us"),
      url: "https://www.studentbeans.com/en-us/us/beansid-connect/hosted/chill-sim",
    },
    {
      countryCode: "FR",
      countryName: t("studentDiscounts.countries.fr"),
      url: "https://www.studentbeans.com/fr-fr/fr/beansid-connect/hosted/chill-sim",
    },
    {
      countryCode: "DE",
      countryName: t("studentDiscounts.countries.de"),
      url: "https://www.studentbeans.com/de-de/de/beansid-connect/hosted/chill-sim",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 overflow-hidden">
        <Container className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Column - Content */}
              <div className="relative z-10">
                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  {t("studentDiscounts.title")}
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-gray-700 mb-10 leading-relaxed">
                  <Trans
                    i18nKey="studentDiscounts.subtitle"
                    components={{
                      highlight: <span className="text-primary-600 font-bold" />
                    }}
                  />
                </p>

                {/* Question */}
                <h2 className="text-2xl md:text-3xl font-bold text-teal-700 mb-6">
                  {t("studentDiscounts.question")}
                </h2>

                {/* Country Cards */}
                <div className="space-y-3 mb-8">
                  {studentBeansLinks.map((link) => (
                    <a
                      key={link.countryCode}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-primary-400">
                        <div className="flex items-center gap-4">
                          {/* Country Code Circle */}
                          <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white font-bold text-xl">
                              {link.countryCode}
                            </span>
                          </div>

                          {/* Country Info */}
                          <div className="flex-grow">
                            <h3 className="font-bold text-gray-900 text-lg mb-1">
                              {link.countryName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {t("studentDiscounts.claimDiscount")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Terms */}
                <p className="text-sm text-gray-500 mb-6 italic text-center">
                  {t("studentDiscounts.terms")}
                </p>

                {/* Powered by StudentBeans */}
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-3">
                    <span className="text-sm text-gray-600 font-medium">
                      {t("studentDiscounts.poweredBy")}
                    </span>
                    <img
                      src={STUDENTBEANS_LOGO}
                      alt="StudentBeans"
                      className="h-6 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling?.remove();
                        e.target.insertAdjacentHTML('afterend', '<span class="text-purple-600 font-bold text-base">StudentBeans</span>');
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Embedded Image with Masking */}
              <div className="relative lg:block hidden">
                {/* Decorative circles in background */}
                <div className="absolute top-10 right-10 w-72 h-72 bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute bottom-10 left-10 w-64 h-64 bg-secondary-200 rounded-full opacity-20 blur-3xl"></div>
                
                {/* Main image with organic shape masking */}
                <div className="relative">
                  <div 
                    className="relative overflow-hidden shadow-2xl"
                    style={{
                      borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                      transform: 'rotate(5deg)',
                    }}
                  >
                    <img
                      src="https://pub-c6956f461b54496d92df707e9f1b2fef.r2.dev/benefits/benefits_shutterstock_2621627227.jpg"
                      alt="Student traveling"
                      className="w-full h-auto object-cover"
                      style={{ 
                        aspectRatio: '4/5',
                        minHeight: '500px',
                        maxHeight: '600px',
                      }}
                      loading="lazy"
                    />
                    {/* Gradient overlay for better integration */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-secondary-600/10 mix-blend-multiply"></div>
                  </div>
                  
                  {/* 30% Discount Badge - Overlapping the image */}
                  <div className="absolute -top-8 -left-12 z-20">
                    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-2xl shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                      <div className="text-5xl md:text-6xl font-black mb-1">{t("studentDiscounts.badge.percent")}</div>
                      <div className="text-lg md:text-xl font-bold uppercase tracking-wide">{t("studentDiscounts.badge.text")}</div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </Container>

        {/* Wave transition to next section */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16 md:py-20">
        <Container>
          <BenefitsSection />
          
          {/* CTA after Benefits */}
          <div className="text-center mt-12">
            <Button
              component={Link}
              to="/plans"
              variant="contained"
              color="primary"
              size="large"
              endIcon={<ArrowForward />}
              className="px-8 py-3 text-lg"
            >
              {t("studentDiscounts.cta.browsePlans")}
            </Button>
            <p className="text-sm text-gray-500 mt-3">
              {t("studentDiscounts.cta.reminder")}
            </p>
          </div>
        </Container>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-20">
        <Container>
          <HowItWorksSection />
          
          {/* CTA after How It Works */}
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 md:p-12 border border-primary-100">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {t("studentDiscounts.finalCta.title")}
              </h3>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                {t("studentDiscounts.finalCta.description")}
              </p>
              <Button
                component={Link}
                to="/plans"
                variant="contained"
                color="secondary"
                size="large"
                endIcon={<ArrowForward />}
                className="px-10 py-4 text-lg"
              >
                {t("studentDiscounts.finalCta.button")}
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default StudentDiscounts;
