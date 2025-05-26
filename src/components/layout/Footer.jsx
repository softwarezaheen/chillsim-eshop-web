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
        <div className="flex flex-col sm:flex-row items-center sm:items-baseline justify-around gap-[2rem]">
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
        </div>

        {/* Bottom Links */}
        <div className=" pt-2 border-t border-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-4 gap-2 md:mb-0">
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
                to={"/contact-us"}
                onClick={() => handleNavigation()}
                className="text-sm text-white"
              >
                {t("footer.contactUs")}
              </Link>
            </div>
            <div dir="ltr" className="text-sm text-white">
              © 2025 {footerProjectName}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Footer;
