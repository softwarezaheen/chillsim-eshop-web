//UTILITIES
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
//MUI
import {
  Autocomplete,
  Chip,
  Button,
  CircularProgress,
  Paper,
  TextField,
} from "@mui/material";
import { Search, Wifi } from "@mui/icons-material";

const TravelSearchWidget = ({
  countries = [],
  isLoading = false,
  selectedCountries,
  setSelectedCountries,
  selectedDuration,
  setSelectedDuration,
  onSearch,
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");

  // Duration chip options
  const durationChips = [
    { key: "all", label: t("home.duration.all") },
    { key: "7d", label: t("home.duration.7d") },
    { key: "15d", label: t("home.duration.15d") },
    { key: "30d", label: t("home.duration.30d") },
    { key: "90d", label: t("home.duration.90d") },
    { key: "1yr", label: t("home.duration.1yr") },
  ];

  const handleCountryChange = (_, newValue) => {
    if (newValue.length > 3) {
      toast.error(t("plans.restrictedCountriesSelection"));
      return;
    }
    setSelectedCountries(newValue);
  };

  const handleDurationChange = (duration) => {
    setSelectedDuration(duration);
  };

  const handleSearchClick = () => {
    if (selectedCountries.length === 0) {
      toast.warning(t("home.search.selectCountry"));
      return;
    }
    onSearch(selectedCountries);
  };

  return (
    <Paper
      elevation={0}
      className="p-4 md:p-6 rounded-xl border border-white/30 shadow-xl"
      sx={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
      }}
    >
      {/* Search Header */}
      <div className="flex items-center gap-2 mb-4">
        <Wifi className="text-white" />
        <h3 className="text-lg font-semibold text-white">
          {t("home.search.title")}
        </h3>
      </div>

      {/* Country Autocomplete */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-2">
          {t("home.search.destination")}
        </label>
        <Autocomplete
          multiple
          value={selectedCountries}
          onChange={handleCountryChange}
          inputValue={inputValue}
          onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
          options={countries}
          getOptionLabel={(option) => option?.country || ""}
          loading={isLoading}
          filterOptions={(options, { inputValue }) => {
            if (!inputValue) return options.slice(0, 20);
            return options.filter((option) =>
              [option?.country, option?.iso3_code, option?.country_code].some(
                (field) =>
                  field?.toLowerCase().includes(inputValue.toLowerCase())
              )
            ).slice(0, 30);
          }}
          renderOption={(props, option) => {
            const { key, ...restProps } = props;
            return (
              <li key={key} {...restProps} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50">
                <img
                  src={option?.icon}
                  alt=""
                  loading="lazy"
                  width={24}
                  height={24}
                  className="rounded-sm object-cover"
                  style={{ minWidth: 24 }}
                />
                <span className="text-sm">{option?.country}</span>
                <span className="text-xs text-gray-400 ml-auto">
                  {option?.iso3_code}
                </span>
              </li>
            );
          }}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => {
              const { key, ...restProps } = getTagProps({ index });
              return (
                <Chip
                  key={key}
                  {...restProps}
                  avatar={
                    <img 
                      src={option?.icon} 
                      alt="" 
                      className="rounded-full"
                      style={{ width: 24, height: 24 }}
                    />
                  }
                  label={option?.country}
                  size="small"
                  className="m-0.5"
                />
              );
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={
                selectedCountries.length === 0
                  ? t("home.search.placeholder")
                  : ""
              }
              variant="outlined"
              size="small"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <Search sx={{ color: 'rgba(100, 100, 100, 0.7)', ml: 1, mr: 0.5 }} fontSize="small" />
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
          sx={{
            '& .MuiAutocomplete-tag': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
          }}
          noOptionsText={t("home.search.noCountries")}
        />
        <p className="text-xs text-white/70 mt-1">
          {t("home.search.maxCountries")}
        </p>
      </div>

      {/* Duration Chips */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-white mb-2">
          {t("home.search.duration")}
        </label>
        <div className="flex flex-wrap gap-2">
          {durationChips.map((chip) => (
            <Chip
              key={chip.key}
              label={chip.label}
              onClick={() => handleDurationChange(chip.key)}
              variant={selectedDuration === chip.key ? "filled" : "outlined"}
              color={selectedDuration === chip.key ? "primary" : "default"}
              className={`cursor-pointer transition-all ${
                selectedDuration === chip.key
                  ? "!bg-white !text-primary font-semibold"
                  : "!border-white/50 !text-white hover:!bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Search Button */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        onClick={handleSearchClick}
        disabled={isLoading || selectedCountries.length === 0}
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Search />}
        className="!py-3 !rounded-lg"
      >
        {isLoading ? t("home.search.searching") : t("home.search.findPlans")}
      </Button>
    </Paper>
  );
};

export default TravelSearchWidget;
