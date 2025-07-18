import { createTheme } from "@mui/material/styles";
import tailwindConfigModule from "../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";
const tailwindConfig = resolveConfig(tailwindConfigModule);

export const appTheme = createTheme({
  palette: {
    secondary: {
      main: tailwindConfig.theme.colors.secondary.DEFAULT,
    },
    primary: {
      main: tailwindConfig.theme.colors.primary.DEFAULT,
    },
  },

  components: {
    MuiSwitch: {
      styleOverrides: {
        root: {},
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          textAlign: "justify",
          color: "#333333",
          whiteSpace: "initial",
          alignItems: "flex-center",
          //for sm in tailwind
          "@media (max-width: 640px)": {
            alignItems: "flex-start",
          },
        },
        label: {},
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          paddingTop: "0",
          color: tailwindConfig.theme.colors.primary.DEFAULT,
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tailwindConfig.theme.colors.primary.DEFAULT,
          fontSize: "0.8rem",
          marginTop: "0px !important",
        },
        arrow: {
          "&:before": {
            border: `1px solid ${tailwindConfig.theme.colors.primary.DEFAULT}`,
          },
          color: tailwindConfig.theme.colors.primary.DEFAULT,
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          color: "#ffffff",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: tailwindConfig.theme.borderRadius.DEFAULT,
          padding:
            localStorage.getItem("i18nextLng") === "ar"
              ? "6px 12px"
              : "4px 8px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#ffffff",
            borderRadius: tailwindConfig.theme.borderRadius.DEFAULT,
            "&:hover fieldset": {
              border: `2px solid ${tailwindConfig.theme.colors.primary.DEFAULT}`,
            },
          },

          fieldset: {
            boxShadow: "0px 0px 6.08px 1px #0000001f",
            border: `none`,
          },
          textarea: {
            height: "unset", // or 'auto' for default height
          },
          input: {
            "&::placeholder": {
              color: "#c2c2c2",
              opacity: "1",
            },
            "&::-webkit-inner-spin-button, &::-webkit-outer-spin-button": {
              "-webkit-appearance": "none",
              margin: 0,
            },
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#333333",
          fontWeight: "400",
          textAlign: "left",
          marginBottom: "10px",
          lineHeight: "16px",
          letterSpacing: "0em",
          fontSize: "14px",
          "@media (max-width:1501px)": { fontSize: "14px" },
          "@media (max-width:500px)": { fontSize: "14px" },
          "@media (max-width:860px)": { fontSize: "12px" },
          "@media (max-width:791px)": { fontSize: "12px" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "20px",
          boxShadow: "0px 0px 5px 2px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "16px",
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: "40px",
        },
      },
    },
    MuiSelect: {
      border: `1px solid  ${"#c2c2c2"}`,

      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          border: "none",
          textOverflow: "ellipsis",
          overflowX: "hidden",
          minWidth: "58px",
        },
        select: {
          border: `1px solid  ${"#c2c2c2"}`,
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          borderRadius: "5px",
          border: `0px solid ${"#ffffff"}`,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: "black",
          padding: "3px 10px",
          textTransform: "none",
          fontWeight: 400,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          "&:focus": {
            outline: "none",
          },
          minHeight: "30px",
          borderRadius: tailwindConfig.theme.borderRadius.DEFAULT,
          width: "100%",
          whiteSpace: "nowrap",
          textTransform: "none",
          boxShadow: "unset",
          textOverflow: "ellipsis",
          overflow: "hidden",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: tailwindConfig.theme.borderRadius.DEFAULT,
          "&:focus": {
            outline: "none",
          },
          "&:hover": { background: "none" },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "20px",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          "&::-webkit-scrollbar": {
            width: "0px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#c1c1c1",
            borderRadius: "4px",
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${"#50c878"}`,
          color: "#50c878",
          marginBottom: "10px",
          fontWeight: 400,
          fontSize: "20px",
          "@media (max-width:1501px)": { fontSize: "20px" },
          "@media (max-width:500px)": { fontSize: "18px" },
          "@media (max-width:860px)": { fontSize: "16px" },
          "@media (max-width:791px)": { fontSize: "14px" },
        },
      },
    },
    MuiTableSortLabel: {
      styleOverrides: {
        icon: {
          color: "#50c878",
        },
        root: {
          color: "#50c878",
          fontWeight: 400,
          fontSize: "18px",
          "@media (max-width:1501px)": { fontSize: "18px" },
          "@media (max-width:500px)": { fontSize: "16px" },
          "@media (max-width:860px)": { fontSize: "13px" },
          "@media (max-width:791px)": { fontSize: "12px" },
          "@media (max-width:400px)": { padding: "0 20px 0 20px" },

          "&.Mui-active": {
            color: "#50c878",
          },
          "&:hover": {
            color: "#50c878",
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: {
          borderBottom: `1px solid ${tailwindConfig.theme.colors.primary.DEFAULT}`,
          color: tailwindConfig.theme.colors.primary.DEFAULT,
          fontWeight: 400,
          fontSize: "16px",
          padding: "10px",
          "@media (max-width:1501px)": { fontSize: "18px" },
          "@media (max-width:500px)": { fontSize: "16px" },
          "@media (max-width:860px)": { fontSize: "13px" },
          "@media (max-width:791px)": { fontSize: "12px" },
          "@media (max-width:400px)": { padding: "0 20px 0 20px" },
        },
        body: {
          lineHeight: "16px",
          fontWeight: "700",
          fontSize: "14px",
          padding: "10px",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          "@media (max-width:1501px)": { fontSize: "14px" },
          "@media (max-width:500px)": { fontSize: "14px" },
          "@media (max-width:860px)": { fontSize: "12px" },
          "@media (max-width:791px)": { fontSize: "12px" },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          borderRadius: "5px",
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          float: "right",
          backgroundColor: tailwindConfig.theme.colors.primary.DEFAULT,
          borderRadius: "5px",
          marginTop: "10px",
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: "red",
          margin: "0",
          wordBreak: "break-word",
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: 700,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          "&:focus": {
            outline: "none",
          },
          fontSize: "18px",
          margin: "0 5px",
          fontWeight: 400,
          textTransform: "none",
        },
      },
    },
    MuiTabPanel: {
      styleOverrides: {
        root: {
          padding: "15px",
        },
      },
    },

    MuiTabList: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
        },
      },
    },

    MuiAccordion: {
      styleOverrides: {
        root: {
          border: "none",
          backgroundColor: "#ffffff",
          boxShadow: "0px 0px 5px 2px rgba(0, 0, 0, 0.05)",
          borderRadius: "5px",
          marginTop: "10px",
          ".Mui-disabled": {
            backgroundColor: "#ffffff",
            color: "#000080",
          },
          "&::before": {
            display: "none",
          },

          "@media (max-width:400px)": {
            marginTop: "20px",
            width: "100%",
            margin: "auto",
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: "1px 15px 1px",
          "@media (max-width:900px)": {
            padding: "1px 10px 1px",
          },
          "&.Mui-expanded": {
            padding: "10px",
            "@media (max-width:900px)": {
              padding: "10px",
            },
            transition: "0.5s all ease-in-out",
            height: "1px",
          },
        },
      },
    },

    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: "1px 15px 16px",
          "@media (max-width:900px)": {
            padding: "1px 10px 16px",
          },
        },
      },
    },

    MuiListItemText: {
      styleOverrides: {
        root: {
          textOverflow: "ellipsis",
        },
      },
    },

    MuiAutocomplete: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          borderRadius: "5px",

          input: {
            "&::placeholder": {
              color: "#c2c2c2",
              opacity: "1",
            },
          },
          "& .MuiCircularProgress-root": {
            color: tailwindConfig.theme.colors.primary.DEFAULT,
          },
        },
      },
    },
  },
});
