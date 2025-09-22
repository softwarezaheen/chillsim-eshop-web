
export const DownloadButton = () => {

    const handleDownload = () => {
    const ua = navigator.userAgent || "";
    if (/android/i.test(ua)) {
        window.location.href = "https://play.google.com/store/apps/details?id=zaheen.esim.chillsim";
    } else if (/iphone|ipad|ipod/i.test(ua)) {
        window.location.href = "https://apps.apple.com/us/app/zaheen-esim/id1234567890";
    } else {
        window.location.href = "https://chillsim.net/";
    }
    };    

  return (
    <div className="text-center w-full md:w-auto py-10">
        <a
            href="#"
            onClick={e => {
                e.preventDefault();
                handleDownload();
            }}
            style={{
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "underline",
                color: "#1976d2",
                cursor: "pointer",
                fontWeight: 500,
            }}
            className="download-link"
            >
            <img
                src="https://d30a1bfupaeobl.cloudfront.net/images/W48-557-WZ7Z/editor_images/5b883c6a-e33c-443e-b6f2-68679d1f2842.png"
                alt="Download"
                style={{ height: 48, marginRight: 8 }}
            />
        </a>
    </div>
  );
};
