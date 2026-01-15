//UTILITIES
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
//MUI
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const FAQSection = () => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqs = [
    {
      question: t("home.faq.items.whatIsEsim.question"),
      answer: t("home.faq.items.whatIsEsim.answer"),
    },
    {
      question: t("home.faq.items.howToInstall.question"),
      answer: t("home.faq.items.howToInstall.answer"),
    },
    {
      question: t("home.faq.items.compatible.question"),
      answer: t("home.faq.items.compatible.answer"),
    },
    {
      question: t("home.faq.items.multipleCountries.question"),
      answer: t("home.faq.items.multipleCountries.answer"),
    },
    {
      question: t("home.faq.items.validity.question"),
      answer: t("home.faq.items.validity.answer"),
    },
  ];

  return (
    <section className="py-12 md:py-16 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            {t("home.faq.title")}
          </h2>
          <p className="text-gray-600">
            {t("home.faq.subtitle")}
          </p>
        </div>

        {/* FAQ Accordions */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              className="!rounded-lg !shadow-sm before:hidden"
              sx={{
                "&.MuiAccordion-root": {
                  borderRadius: "8px",
                  marginBottom: "8px",
                  "&:before": {
                    display: "none",
                  },
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  padding: "16px 20px",
                  "& .MuiAccordionSummary-content": {
                    margin: 0,
                  },
                }}
              >
                <Typography className="!font-medium !text-gray-800">
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: "0 20px 20px 20px" }}>
                <Typography className="!text-gray-600 !text-sm !leading-relaxed" sx={{ paddingTop: "8px", borderTop: "1px solid #e5e7eb" }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
