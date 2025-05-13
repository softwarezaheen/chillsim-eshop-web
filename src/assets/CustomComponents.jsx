import {
  Drawer,
  Popover,
  styled,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import tailwindConfigModule from "../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";
const tailwindConfig = resolveConfig(tailwindConfigModule);

export const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    border: "none",
    boxShadow: "none",
    "& fieldset": {
      border: "none",
      boxShadow: "unset",
    },
    "&:hover fieldset": {
      border: "none",
    },
    "&.Mui-focused fieldset": {
      border: "none",
    },
  },
});

export const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    minWidth: 240,
    maxWidth: 300,
    display: "flex",
    flexFlow: "column nowrap",
    gap: "2rem",
    padding: "16px",
    transition: "transform 0.3s ease-in-out",
  },
}));

export const stripeAppearance = {
  theme: "flat",
  variables: { colorPrimaryText: tailwindConfig.theme.colors.primary.DEFAULT },
};

export const CustomPopover = styled(Popover)({
  "& .MuiPaper-root": {
    minWidth: "250px",
    minHeight: "100px",
    maxHeight: "400px",
    padding: "16px",
    borderRadius: "6px",
    backgroundColor: "#fff",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
  },
});

export const CustomToggleGroup = styled(ToggleButtonGroup)({
  border: "unset",
  padding: "8px 20px",
  borderRadius: `${tailwindConfig.theme.borderRadius.DEFAULT} !important`,
  backgroundColor: "white",
  boxShadow: "0px 0px 4.08px 0px #0000001f",
  color: tailwindConfig.theme.colors.primary.DEFAULT,
  gap: "0.5rem",
  display: "flex",
  width: "fit-content",
  overflowX: "auto",
  whiteSpace: "nowrap",
  maxWidth: "100%",
  "&.Mui-selected": {
    backgroundColor: tailwindConfig.theme.colors.primary.DEFAULT,
    color: "white",
  },
  "&::-webkit-scrollbar": {
    height: "1px",
  },
});

export const CustomToggleButton = styled(ToggleButton)({
  border: "unset",
  backgroundColor: "white",
  color: tailwindConfig.theme.colors.primary.DEFAULT,
  fontSize: "1.15rem",
  borderRadius: `${tailwindConfig.theme.borderRadius.DEFAULT} !important`,
  fontWeight: "700",
  width: "110px",
  gap: "0.3rem",
  display: "flex",
  alignItems: "center",

  "&.Mui-selected": {
    backgroundColor: tailwindConfig.theme.colors.primary.DEFAULT,
    color: "white",
  },
  "&:hover": {
    backgroundColor: "white",
    color: tailwindConfig.theme.colors.primary.DEFAULT,
  },
});
