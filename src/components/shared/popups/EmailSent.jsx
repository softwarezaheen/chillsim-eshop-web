//UTILITIES
import React, { useEffect } from "react";

//COMPONENT
import { Close, QuestionMark } from "@mui/icons-material";
import { Dialog, DialogContent, IconButton } from "@mui/material";

const EmailSent = ({ email, onClose }) => {
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
            sx={(theme) => ({
              position: "absolute",
              right: 8,
              top: 8,
              color: "black",
            })}
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
            />
          </div>
          <h4 className={"font-bold"}>Sign-in Email Sent</h4>
          <p className={"text-center font-semibold"}>
            A sign-in email with additional instructions was sent{" "}
            {email ? `to ${email?.toLowerCase() || ""}` : ""}. Check your email
            to complete sign-in.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailSent;
