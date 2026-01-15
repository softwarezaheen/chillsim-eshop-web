//UTILITIES
import React from "react";
import { useTranslation } from "react-i18next";
//MUI
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Divider,
  Avatar,
  AvatarGroup,
  Tooltip,
} from "@mui/material";
import { Close, ShoppingCart, Check } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const BundleDetailsModal = ({ bundle, open, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!bundle) return null;

  const handleBuyNow = () => {
    onClose();
    navigate("/plans", {
      state: {
        selectedBundle: bundle,
        autoCheckout: true,
      },
    });
  };

  // Features list
  const features = [
    { label: t("home.modal.data"), value: bundle.gprs_limit_display },
    { label: t("home.modal.validity"), value: bundle.validity_display },
    { label: t("home.modal.speed"), value: bundle.speed || "4G/LTE" },
    {
      label: t("home.modal.countries"),
      value: `${bundle.count_countries || 1} ${t("home.table.countriesCovered")}`,
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: "rounded-xl",
      }}
    >
      <DialogTitle className="flex items-center justify-between pr-2">
        <div className="flex items-center gap-3">
          <Avatar
            src={bundle.icon}
            alt={bundle.display_title}
            sx={{ width: 48, height: 48 }}
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {bundle.display_title}
            </h3>
            <p className="text-sm text-gray-500">{bundle.operator_name}</p>
          </div>
        </div>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent className="py-4">
        {/* Price */}
        <div className="text-center mb-6">
          <p className="text-3xl font-bold text-primary">
            {bundle.price_display}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
            >
              <span className="text-sm text-gray-600">{feature.label}</span>
              <span className="text-sm font-medium text-gray-800">
                {feature.value}
              </span>
            </div>
          ))}
        </div>

        {/* Countries covered */}
        {bundle.countries && bundle.countries.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {t("home.modal.coverageTitle")}
            </p>
            <AvatarGroup max={8} className="justify-start">
              {bundle.countries.map((country, index) => (
                <Tooltip key={index} title={country.country} arrow>
                  <Avatar
                    src={country.icon}
                    alt={country.country}
                    sx={{ width: 28, height: 28 }}
                  />
                </Tooltip>
              ))}
            </AvatarGroup>
          </div>
        )}

        {/* Included features */}
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-sm font-medium text-green-800 mb-2">
            {t("home.modal.included")}
          </p>
          <div className="space-y-1">
            {[
              t("home.modal.feature1"),
              t("home.modal.feature2"),
              t("home.modal.feature3"),
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="text-green-600" fontSize="small" />
                <span className="text-sm text-green-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>

      <Divider />

      <DialogActions className="p-4">
        <Button variant="outlined" onClick={onClose} className="flex-1">
          {t("home.modal.cancel")}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleBuyNow}
          startIcon={<ShoppingCart />}
          className="flex-1"
        >
          {t("home.modal.buyNow")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BundleDetailsModal;
