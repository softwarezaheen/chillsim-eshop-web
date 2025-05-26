import React, { useState } from "react";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Container from "./Container";
import {
  FormInput,
  FormTextArea,
} from "./shared/form-components/FormComponents";
import { contactUs } from "../core/apis/homeAPI";
import { toast } from "react-toastify";
import { ConnectSVG } from "../assets/icons/Home";
import clsx from "clsx";
import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";

const schema = ({ t }) =>
  yup.object().shape({
    email: yup
      .string()
      .label("Email")
      .email(t("profile.errors.emailInvalid"))
      .required(`${t("checkout.emailRequired")}`)
      .nullable(),
    content: yup
      .string()
      .label("Message")
      .required(`${t("contactUs.messageRequired")}`)
      .nullable()
      .max(
        255,
        t("errors.maxCharacter", {
          field: t("contactUs.message"),
          character: 255,
        }),
      ),
  });

const ContactForm = ({ bg }) => {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      email: "",
      content: "",
    },
    resolver: yupResolver(schema({ t })),
    mode: "all",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitForm = async (payload) => {
    setIsSubmitting(true);

    contactUs({ ...payload, content: t("contactUs.melIsTesting") })
      .then((res) => {
        if (res?.data?.status === "success") {
          toast.success(t("contactUs.messageSentSuccessfully"));
        } else {
          toast.error(res?.message);
        }
      })
      .catch((e) => {
        toast?.error(e?.message || t("contactUs.failedToSendMessage"));
      })
      .finally(() => {
        reset({
          email: "",
          content: "",
        });
        setIsSubmitting(false);
      });
  };

  return (
    <section
      className={clsx({
        [bg]: Boolean(bg),
        "bg-primary-50 rounded-[100px] py-14": !bg,
      })}
    >
      <Container>
        <div className="max-w-2xl mx-auto flex flex-col gap-[2rem]">
          <div className="text-center flex flex-col gap-[1rem]">
            <div className="flex justify-center items-end">
              <ConnectSVG flip={localStorage.getItem("i18nextLng") === "ar"} />
              <p className={"font-semibold text-content-600 text-lg"}>
                {t("contactUs.contactUs")}
              </p>
            </div>
            <h2 className="text-4xl font-bold">
              {t("contactUs.needSomeHelp")}{" "}
              {localStorage.getItem("i18nextLng") === "ar" ? "؟" : "?"}
            </h2>
            <p className="text-gray-600 font-semibold">
              {t("contactUs.contactInfo")}
            </p>
          </div>

          <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("checkout.email")}
              </label>
              <Controller
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <FormInput
                    placeholder={t("checkout.enterEmail")}
                    value={value}
                    helperText={error?.message}
                    onChange={(value) => onChange(value)}
                  />
                )}
                name="email"
                control={control}
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("contactUs.message")}
              </label>
              <Controller
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <FormTextArea
                    rows={5}
                    value={value}
                    onChange={(value) => onChange(value)}
                    placeholder={t("contactUs.typeYourMessage")}
                    helperText={error?.message}
                  />
                )}
                name="content"
                control={control}
              />
            </div>
            {/* <label className="block text-gray-700 mb-2">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-blue-500 min-h-[200px] resize-none"
                placeholder="Type your message"
                required
              /> */}
            <div className="flex justify-center">
              <Button
                sx={{ width: "fit-content", padding: "10px" }}
                type="submit"
                variant={"contained"}
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("btn.sending") : t("btn.sendMessage")}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
};

export default ContactForm;
