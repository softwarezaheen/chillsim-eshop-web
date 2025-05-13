import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
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

const schema = yup.object().shape({
  email: yup.string().label("Email").email().required().nullable(),
  content: yup.string().label("Message").required().nullable().max(255),
});

const ContactForm = ({ bg }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      content: "",
    },
    resolver: yupResolver(schema),
    mode: "all",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitForm = async (payload) => {
    setIsSubmitting(true);

    contactUs({ ...payload, content: "mel is testing" })
      .then((res) => {
        if (res?.data?.status === "success") {
          toast.success("Your message has been sent successfully!");
        } else {
          toast.error(res?.message);
        }
      })
      .catch((e) => {
        toast?.error(e?.message || "Failed to send message");
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
              <ConnectSVG />{" "}
              <p className={"font-semibold text-content-600 text-lg"}>
                Contact us
              </p>
            </div>
            <h2 className="text-4xl font-bold">Need some help?</h2>
            <p className="text-gray-600 font-semibold">
              For all inquiries, please email us using the form below. Our team
              is there for you 24/7!
            </p>
          </div>

          <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <Controller
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <FormInput
                    placeholder={"Enter email"}
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
                Message
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
                    placeholder="Type your message"
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
                {" "}
                {isSubmitting ? "Sending..." : "Send message"}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
};

export default ContactForm;
