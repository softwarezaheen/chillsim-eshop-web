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

const Footer = () => {
  const handleNavigation = () => {
    window.scrollTo(0, 0);
  };

  const googleMapsUrl = supportMap;

  return (
    <div className="bg-primary text-white">
      <Container className="py-8 flex flex-col gap-[1rem]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded bg-white flex items-center justify-center">
                <PhoneOutlinedIcon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Phone</h3>
            <p>{supportPhone}</p>
          </div>

          {/* Email */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded bg-white flex items-center justify-center">
                <MailOutlinedIcon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Email</h3>
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
          </div>

          {/* Office */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded bg-white flex items-center justify-center">
                <RoomOutlinedIcon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Office</h3>
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
              {supportAddress}
            </a>
          </div>
        </div>

        {/* Bottom Links */}
        <div className=" pt-2 border-t border-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <Link
                to={"/privacy"}
                onClick={() => handleNavigation()}
                className="text-sm text-white"
              >
                Privacy Policy
              </Link>
              <Link
                to={"/terms"}
                onClick={() => handleNavigation()}
                className="text-sm text-white"
              >
                Terms & Conditions
              </Link>
              <Link
                to={"/contact-us"}
                onClick={() => handleNavigation()}
                className="text-sm text-white"
              >
                Contact Us
              </Link>
            </div>
            <div className="text-sm text-white">© 2025 {footerProjectName}</div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Footer;
