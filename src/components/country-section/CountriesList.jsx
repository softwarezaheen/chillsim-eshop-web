//UTILITIES
import { useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
//REDUCER
import { AttachSearch, DetachSearch } from "../../redux/reducers/searchReducer";
//COMPONENT
import { Collapse, Grid2, useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import BundleList from "../bundle/BundleList";
import CountryCard from "./country-card/CountryCard";
import { gtmEvent, gtmViewItemListEvent } from "../../core/utils/gtm.jsx";

export const CountriesList = (props) => {
  const {
    data,
    region,
    isLoading,
    showAllCountries,
    countryDisplay,
    setShowAllCountries,
  } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const sectionRef = useRef(null);

  //working on tailwind queries
  const isSmall = useMediaQuery("(max-width: 639px)");
  const isMedium = useMediaQuery("(min-width: 640px) and (max-width: 767px)");
  const isLarge = useMediaQuery("(min-width: 768px)");

  const [expandedRow, setExpandedRow] = useState(null);
  const [expandedCountry, setExpandedCountry] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Calculate itemsPerRow based on screen size
  const itemsPerRow = useMemo(() => {
    if (isSmall) return 1;
    if (isMedium) return 2;
    if (isLarge) return 3;
    return 1;
  }, [isSmall, isMedium, isLarge]);

  // Calculate rows based on screen size
  const rows = useMemo(() => {
    if (!data?.length) return [];

    const totalRows = Math.ceil(data.length / itemsPerRow);
    const rows = [];

    for (let i = 0; i < totalRows; i++) {
      const startIndex = i * itemsPerRow;
      const row = data.slice(startIndex, startIndex + itemsPerRow);
      rows.push(row);
    }

    return rows;
  }, [data, itemsPerRow]);

  // Calculate the row index for a given country
  const getRowIndex = (countryId) => {
    const countryIndex = data.findIndex(
      (country) => (region ? country.region_code : country.id) === countryId
    );
    return Math.floor(countryIndex / itemsPerRow);
  };

  const handleExpandCountry = (element, rowIndex) => {
    if (
      expandedCountry === (region ? element?.region_code : element?.id) &&
      expandedRow === rowIndex
    ) {
      setExpandedCountry(null);
      setSelectedCountry(null);
      setExpandedRow(null);
      dispatch(DetachSearch());
    } else {
      setExpandedCountry(region ? element?.region_code : element?.id);
      setSelectedCountry(element);
      setExpandedRow(rowIndex);
      dispatch(
        AttachSearch({
          ...(region
            ? {
                countries: [],
                region: {
                  iso_code: element?.region_code,
                  region_name: element?.region_name,
                },
              }
            : {
                region: null,
                countries: [
                  {
                    iso3_code: element?.iso3_code,
                    country_name: element?.country,
                  },
                ],
              }),
        })
      );
      // GTM event logic
      if (region && element?.region_code) {
        // Send GA4 view_item_list event for region with available bundle data
        if (element?.bundles && element.bundles.length > 0) {
          gtmViewItemListEvent(
            element.bundles,
            element?.region_name || element?.region_code,
            element?.region_code,
            'region'
          );
        }

        // Legacy event
        // gtmEvent("view_region_products", {
        //   region: element?.region_name || element?.region_code,
        // });
      } else if (!region && element?.id) {
        // Send GA4 view_item_list event for country with available bundle data
        if (element?.bundles && element.bundles.length > 0) {
          gtmViewItemListEvent(
            element.bundles,
            element?.country || element?.id,
            element?.id,
            'country'
          );
        }

        // Legacy event
        // gtmEvent("view_country_products", {
        //   country: element?.country || element?.id,
        // });
      }
    }
  };

  const gridColsClass = useMemo(() => {
    if (itemsPerRow == 1) return "grid-cols-1";
    else if (itemsPerRow == 2) return "grid-cols-2";
    else return "grid-cols-3";
  }, [itemsPerRow]);

  return (
    <div ref={sectionRef} className="space-y-4">
      {rows?.map((row, rowIndex) => (
        <div key={rowIndex} className="space-y-4">
          <div className={`grid gap-6 ${gridColsClass}`}>
            {row?.map(
              (country) =>
                country && (
                  <CountryCard
                    {...props}
                    key={country.id}
                    data={country}
                    handleExpandClick={(element) =>
                      handleExpandCountry(element, rowIndex)
                    }
                    expandedCountry={expandedCountry}
                  />
                )
            )}
          </div>

          <Grid2 item xs={12}>
            <Collapse
              in={getRowIndex(expandedCountry) === rowIndex && expandedCountry}
            >
              {getRowIndex(expandedCountry) === rowIndex && expandedCountry && (
                <BundleList
                  {...props}
                  expandedCountry={expandedCountry}
                  countryData={selectedCountry}
                  regionIcon={region ? selectedCountry?.icon : null}
                />
              )}
            </Collapse>
          </Grid2>
        </div>
      ))}
      {!isLoading && data?.length > 8 && countryDisplay && (
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setShowAllCountries(!showAllCountries);

              if (showAllCountries && sectionRef) {
                sectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                });
              }
            }}
            className="px-8 py-3 bg-primary text-white rounded font-medium hover:bg-secondary/90 transition-colors"
          >
            {showAllCountries ? t("btn.viewLess") : t("btn.viewAllCountries")}
          </button>
        </div>
      )}
    </div>
  );
};

export default CountriesList;
