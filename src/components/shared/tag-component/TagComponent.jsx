import { Chip } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

const colorsMap = {
  success: "success",
  pending: "warning",
  failed: "error",
  failure: "error",
};
const TagComponent = ({ value = "pending" }) => {
  const { t } = useTranslation();

  return (
    <Chip
      label={t(`status.${value}`)}
      color={colorsMap?.[value] || "warning"}
      variant="filled"
    />
  );
};

export default TagComponent;
