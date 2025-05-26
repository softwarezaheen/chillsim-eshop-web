//UTILTIIES
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Container from "../../components/Container";
import ContactForm from "../../components/ContactForm";
import Plans from "../plans/Plans";
import { ConnectSVG } from "../../assets/icons/Home";
import { benefits } from "../../core/variables/StaticVariables";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Home = () => {
  const { t } = useTranslation();
  const sea_option = useSelector((state) => state.currency?.sea_option);
  const featuresRef = useRef(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center scale-110"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=80)",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A0B1D]/90 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center">
          <div className="max-w-2xl text-white ml-[5%]">
            <h1 className="text-6xl font-bold mb-6 text-white">
              Stay Connected
              <br />
              while Traveling!
            </h1>
            <Button
              component={Link}
              to={"/plans"}
              variant="contained"
              color="primary"
              sx={{ width: "fit-content", padding: "10px 20px" }}
            >
              {t("btn.view_all_plans")}
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToFeatures}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer z-10 p-2 rounded bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          aria-label="Scroll to features"
        >
          <KeyboardArrowDownIcon className="w-6 h-6 text-white animate-bounce" />
        </button>
      </div>
      {/* Bestsellers Section */}
      <section className="py-24 bg-gray-50" ref={featuresRef}>
        <Container>
          <Plans cruises={sea_option} />
        </Container>
      </section>
      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800"
                alt="iPhone with Monty eSIM"
                className="w-full rounded-3xl shadow-2xl"
              />
            </div>

            <div>
              <div className="flex flex-row items-end  gap-[0.5rem]">
                <p className={"font-semibold text-content-600 text-lg"}>
                  Easy and Fast
                </p>
                <ConnectSVG flip={true} />
              </div>
              <h2 className="text-4xl font-bold mb-12">
                Unlock endless
                <br />
                benefits
              </h2>

              <div className="space-y-8">
                {benefits?.map((benefit, index) => (
                  <div key={index} className="flex flex-row gap-[1rem]">
                    <div
                      className={clsx(
                        benefit.bg,
                        `w-12 h-12 sm-basis-[10%] rounded-xl flex items-center justify-center text-2xl`
                      )}
                    >
                      {benefit.icon}
                    </div>
                    <div
                      className={
                        "flex flex-1 flex-col gap-[0.3rem] text-content-600"
                      }
                    >
                      <h3 className="text-xl font-bold ">{benefit.title}</h3>
                      <p>{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>
      {/* Setup Instructions Section */}
      <section className="py-24 bg-gray-50">
        <Container>
          <div className="text-center mb-16 flex flex-col gap-[1rem] items-center justify-center">
            <h2 className="text-4xl font-bold">How to set up your eSIM?</h2>
            <p className="text-gray-600">
              Whether you're an iPhone or an Android user, here's how it works
            </p>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              onClick={() => window.scrollTo(0, 0)}
              to={"/how-it-works"}
              sx={{ width: "fit-content", padding: "10px 20px" }}
            >
              {t("btn.learn_more")}
            </Button>
          </div>

          <div className="relative max-w-3xl mx-auto">
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200"
              alt="eSIM setup instructions"
              className="w-full rounded-3xl shadow-lg"
            />
          </div>
        </Container>
      </section>
      {/* Contact Form Section */}
      <ContactForm bg={"bg-content-300 rounded-md p-10"} />
      {/* WhatsApp Button */}
    </div>
  );
};

export default Home;
