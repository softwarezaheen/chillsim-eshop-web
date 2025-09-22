import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DownloadRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const ua = navigator.userAgent || "";
    if (/android/i.test(ua)) {
      window.location.replace("https://play.google.com/store/apps/details?id=zaheen.esim.chillsim");
    } else if (/iphone|ipad|ipod/i.test(ua)) {
      window.location.replace("https://apps.apple.com/us/app/chillsim-travel-esim/id6747967151");
    } else {
      window.location.replace("https://chillsim.net/");
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <span>Redirecting to the appropriate app store...</span>
    </div>
  );
};

export default DownloadRedirect;