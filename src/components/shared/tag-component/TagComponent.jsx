import { Chip } from "@mui/material";
import React from "react";

const colorsMap = {
  success: "success",
  pending: "warning",
  failed: "error",
  failure: "error",
};
const TagComponent = ({ value = "pending" }) => {
  return (
    <Chip
      label={value}
      color={colorsMap?.[value] || "warning"}
      variant="filled"
    />
  );
};

export default TagComponent;
