import React from "react";
import { Box, Button, Snackbar, IconButton } from "@mui/material";
import { Refresh as RefreshIcon, Close as CloseIcon } from "@mui/icons-material";
import { useVersionChecker } from "../../../core/custom-hook/useVersionChecker";
import { useBundlesVersionChecker } from "../../../core/custom-hook/useBundlesVersionChecker";
import { useTranslation } from "react-i18next";

const UpdateBanner = () => {
  const { t } = useTranslation();
  const appVersion = useVersionChecker();
  const bundlesVersion = useBundlesVersionChecker();
  
  // Show banner if either version has an update
  const updateAvailable = appVersion.updateAvailable || bundlesVersion.updateAvailable;
  
  // Reload function - call the appropriate one based on which update is available
  const reloadApp = () => {
    if (bundlesVersion.updateAvailable) {
      bundlesVersion.reloadApp();
    } else if (appVersion.updateAvailable) {
      appVersion.reloadApp();
    }
  };
  
  // Dismiss function - dismiss both
  const dismissUpdate = () => {
    appVersion.dismissUpdate();
    bundlesVersion.dismissUpdate();
  };

  return (
    <Snackbar
      open={updateAvailable}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{ top: { xs: 8, sm: 12 } }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          gap: { xs: 1, sm: 2 },
          backgroundColor: "rgba(33, 33, 33, 0.95)",
          color: "white",
          px: 2,
          py: { xs: 1.5, sm: 1 },
          borderRadius: 1,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          maxWidth: { xs: "calc(100vw - 32px)", sm: "400px" },
          minWidth: { xs: "280px", sm: "auto" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box
            sx={{
              fontSize: "0.875rem",
              flex: 1,
              lineHeight: 1.4,
            }}
          >
            {t("update.updateAvailable")}
          </Box>
          
        </Box>
        
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Button
            variant="contained"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={reloadApp}
            sx={{
              backgroundColor: "white",
              color: "rgba(33, 33, 33, 0.95)",
              fontWeight: 600,
              textTransform: "none",
              px: 2,
              py: 0.5,
              flex: { xs: 1, sm: "0 0 auto" },
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            {t("update.refresh")}
          </Button>
          
        </Box>
      </Box>
    </Snackbar>
  );
};

export default UpdateBanner;
