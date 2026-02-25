import React from "react";
import { Link } from "react-router-dom";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import Container from "../Container";
import {
  footerProjectName,
  supportAddress,
  supportEmail,
  supportMap,
  supportPhone,
} from "../../core/variables/ProjectVariables";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import i18n from "../../i18n";
const Footer = () => {
  const { t } = useTranslation();

  const whatsapp_number = useSelector(
    (state) => state.currency?.whatsapp_number || ""
  );
  const handleNavigation = () => {
    window.scrollTo(0, 0);
  };

  const googleMapsUrl = supportMap;

  return (
    <div className="bg-primary text-white">
      <Container className="py-8 flex flex-col gap-[1rem]">
        <div className="flex flex-col md:flex-row justify-around gap-[1rem]">
          {/* Contact Info */}
          {whatsapp_number?.trim() !== "" && (
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-10 h-10 rounded bg-white flex items-center justify-center">
                  <PhoneOutlinedIcon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                {" "}
                {t("footer.phone")}
              </h3>
              <p dir="ltr">
                {whatsapp_number?.trim() === "" ? "N/A" : whatsapp_number}
              </p>
            </div>
          )}

          {/* Email */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded bg-white flex items-center justify-center">
                <MailOutlinedIcon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">
              {" "}
              {t("footer.email")}
            </h3>
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
          </div>

          {/* Office */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded bg-white flex items-center justify-center">
                <RoomOutlinedIcon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">
              {" "}
              {t("footer.office")}
            </h3>
            <a
              dir="ltr"
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {supportAddress}
            </a>
          </div>

          {i18n.language === "ro" && ( <div className="text-center flex flex-col items-center gap-2">
              <a 
                href="https://anpc.ro/ce-este-sal/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/anpc-sal.png"
                  alt="Logo ANPC"
                  className="w-40 object-contain"
                />
              </a>
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/anpc-sol.png"
                  alt="Logo ANPC"
                  className="w-40 object-contain"
                />
              </a>
              <a 
                href="https://www.anat.ro/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/anat.png"
                  alt="Logo ANAT"
                  className="w-40 object-contain"
                />
              </a>
          </div>)}


        </div>

        {/* Bottom Links */}
        <div className=" pt-2 border-t border-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-col items-center md:flex-row md:items-center md:space-x-4 gap-2 mb-4 md:mb-0">
              <Link
                to={"/privacy"}
                onClick={() => handleNavigation()}
                className="text-sm text-white"
              >
                {t("footer.privacyPolicy")}
              </Link>
              <Link
                to={"/terms"}
                onClick={() => handleNavigation()}
                className="text-sm text-white"
              >
                {t("footer.termsAndConditions")}
              </Link>
              <Link
                to={"/cookies-policy"}
                onClick={() => handleNavigation()}
                className="text-sm text-white"
              >
                {t("footer.cookiePolicy")}
              </Link>
              <Link
                to={"/student-discounts"}
                onClick={() => handleNavigation()}
                className="text-sm text-white"
              >
                {t("footer.studentDiscounts")}
              </Link>
              <Link
                to={"/contact-us"}
                onClick={() => handleNavigation()}
                className="text-sm text-white"
              >
                {t("footer.contactUs")}
              </Link>
            </div>
            <div dir="ltr" className="text-sm text-white">
              © 2025 {footerProjectName} | Powered by{" "}
              <a
                href="https://zenminutes.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-200"
              >
                ZenMinutes SRL
              </a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Footer;
