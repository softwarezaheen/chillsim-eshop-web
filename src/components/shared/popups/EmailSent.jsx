//UTILITIES
import React, { useEffect } from "react";

//COMPONENT
import { Close, QuestionMark } from "@mui/icons-material";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import { useTranslation, Trans } from "react-i18next";
import { useSelector } from "react-redux";

const EmailSent = ({ email, onClose, verifyBy, phone }) => {
  const login_type = useSelector((state) => state.currency?.login_type);
  console.log(verifyBy, "verifyy by", login_type, "loginn type");
  const { t } = useTranslation();
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog
      open={true}
      onClose={onClose}
      slotProps={{ paper: { sx: { maxWidth: 400 } } }}
    >
      <DialogContent className={"flex flex-col gap-6 "}>
        <div className={"flex flex-row justify-end"}>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={() =>
              localStorage.getItem("i18nextLng") === "ar"
                ? {
                    position: "absolute",
                    left: 8,
                    top: 8,
                    color: "black",
                  }
                : {
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: "black",
                  }
            }
          >
            <Close />
          </IconButton>
        </div>
        <div className={"flex flex-col gap-[1rem] justify-center items-center"}>
          <div
            className={
              "w-11 h-11 bg-[#d7e9f7] rounded-full flex items-center justify-center"
            }
          >
            <QuestionMark
              className="text-gray-700"
              fontSize="small"
              color={"info"}
              sx={
                localStorage.getItem("i18nextLng") === "ar"
                  ? { transform: "scale(-1,1)" }
                  : {}
              }
            />
          </div>
          <h4 className={"font-bold"}>
            {t("auth.signInSent", { method: t(`auth.${verifyBy}`) })}
          </h4>
          <p className="text-center font-semibold">
            <Trans
              i18nKey="auth.signInInstructionsSent"
              values={{
                verifyBy: t(`auth.${verifyBy}`),
                contact:
                  login_type === "phone"
                    ? phone?.toLowerCase() || ""
                    : email?.toLowerCase() || "",
              }}
              components={{ ltr: <span dir="ltr" /> }}
            />
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailSent;
