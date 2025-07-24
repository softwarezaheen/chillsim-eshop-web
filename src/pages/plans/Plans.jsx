//UTILITIES
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import clsx from "clsx";
//REDUCER
import { LimitedSignOut } from "../../redux/reducers/authReducer";
import { AttachSearch, DetachSearch } from "../../redux/reducers/searchReducer";
//API
import { useHomeCountries } from "../../core/custom-hook/useHomeCountries";
//COMPONENT
import CountriesList from "../../components/country-section/CountriesList";
import { CountriesSkeletons } from "../../components/shared/skeletons/HomePageSkeletons";
import BundleCard from "../../components/bundle/bundle-card/BundleCard";
import {
  Autocomplete,
  Badge,
  Chip,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { StyledTextField } from "../../assets/CustomComponents";
import BundleList from "../../components/bundle/BundleList";
import NoDataFound from "../../components/shared/no-data-found/NoDataFound";
import useQueryParams from "../../core/custom-hook/useQueryParams";
import PaymentCompletion from "../../components/payment/PaymentCompletion";
import OrderPopup from "../../components/order/OrderPopup";
import DirectionsBoatFilledOutlinedIcon from "@mui/icons-material/DirectionsBoatFilledOutlined";
import TerrainOutlinedIcon from "@mui/icons-material/TerrainOutlined";
import { useTranslation } from "react-i18next";

const Plans = (props) => {
  const { t } = useTranslation();

  const seaOption =
    import.meta.env.VITE_APP_SEA_OPTION === undefined
      ? true
      : import.meta.env.VITE_APP_SEA_OPTION === "true";
  const defaultOption = seaOption ? "cruises" : "land";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isSmall = useMediaQuery("(max-width: 639px)");
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const mainPath = pathSegments[1] || ""; // "cruises" or "" (land) //now : "land" or

  const [activeRadio, setActiveRadio] = useState(mainPath || defaultOption);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("type") || "countries"
  );

  const [isSearching, setIsSearching] = useState(isSmall);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [openOrderDetail, setOpenOrderDetail] = useState(false);

  const [search, setSearch] = useState(
    searchParams.getAll("country_codes") || []
  );
  const [filters, setFilters] = useState({
    type: searchParams.get("type") || "",
    country_codes: searchParams.getAll("country_codes").join(",") || "", // Extract array
    order_id: searchParams.get("order_id") || null, // Extract single value
  });

  const handleRadioChange = (event) => {
    const newValue = event.target.value;
    setActiveRadio(newValue);
    dispatch(DetachSearch());

    setActiveTab("countries");
    setFilters({ ...filters, type: "", country_codes: "" });
    setIsSearching(false);
    navigate(newValue === "land" ? `/plans/${newValue}` : "/plans");
  };

  const [hoorayOpen, setHorrayOpen] = useState(
    searchParams.get("order_id") || false
  );

  //if testing
  // const data = [];
  // const isLoading = false;
  // const error = false;
  const { data, isLoading, error } = useHomeCountries();

  const homeData = useMemo(() => {
    let dataType = filters?.type || "";

    if (data) {
      if (dataType === "regions") {
        return data?.regions?.filter((el) => el?.region_code !== "GLOBAL");
      } else if (dataType === "global") {
        dispatch(DetachSearch());
        return data?.global_bundles || [];
      } else if (activeRadio === "cruises") {
        return data?.cruise_bundles || [];
      } else {
        if (showAllCountries) {
          return data?.countries;
        } else {
          return data?.countries?.slice(0, 9);
        }
      }
    } else {
      return [];
    }
  }, [data, activeTab, showAllCountries, filters?.type, activeRadio]);

  const resetFilter = () => {
    setIsSearching(false);
  };

  const handleQueryParams = useQueryParams(filters);

  useEffect(() => {
    dispatch(DetachSearch());
  }, []);

  useEffect(() => {
    if (isSmall) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
    handleQueryParams();
  }, [filters, isSmall]);

  return (
    <>
      <div className="flex flex-col gap-[2rem] max-w-2xl mx-auto mb-12">
        {seaOption && (
          <div className="flex flex-row justify-center items-center">
            <RadioGroup
              name="use-radio-group"
              value={activeRadio}
              onChange={handleRadioChange}
              row
              sx={{ columnGap: 2, flexWrap: "nowrap" }}
            >
              <FormControlLabel
                sx={{ alignItems: "center !important", whiteSpace: "nowrap" }}
                value="cruises"
                label={
                  <div className="flex flex-row gap-[0.5rem] items-center">
                    <DirectionsBoatFilledOutlinedIcon color="primary" />
                    <Typography
                      fontWeight={"bold"}
                      color="primary"
                      fontSize={"1rem"}
                    >
                      {t("plans.atSea")}
                    </Typography>
                  </div>
                }
                control={<Radio checked={activeRadio === "cruises"} />}
              />
              <FormControlLabel
                sx={{ alignItems: "center !important", whiteSpace: "nowrap" }}
                value="land"
                label={
                  <div className="flex flex-row gap-[0.5rem] items-center">
                    <TerrainOutlinedIcon color="primary" />
                    <Typography
                      fontWeight={"bold"}
                      color="primary"
                      fontSize={"1rem"}
                    >
                      {t("plans.onLand")}
                    </Typography>
                  </div>
                }
                control={<Radio checked={activeRadio === "land"} />}
              />
            </RadioGroup>
          </div>
        )}
        {activeRadio !== "cruises" && (
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-center sm:items-center gap-4 relative w-full">
            {/* Search Bar Container */}
            <div
              className={clsx(
                `bg-white  shadow-md rounded transition-all duration-500 overflow-hidden flex items-center ${
                  isSearching ? "w-full" : "w-fit sm:w-10 h-10"
                }`,
                {
                  "w-auto": isSmall,
                }
              )}
            >
              {isSearching ? (
                <div className={"flex flex-row gap-2 items-center px-2 w-full"}>
                  <Search
                    className="text-primary cursor-pointer"
                    onClick={!isSmall ? () => resetFilter() : null}
                  />

                  <Autocomplete
                    size="small"
                    multiple
                    value={
                      filters?.country_codes?.length !== 0
                        ? (data?.countries || [])?.filter((el) =>
                            filters?.country_codes.split(",")?.includes(el?.id)
                          )
                        : []
                    }
                    filterOptions={(options, { inputValue }) => {
                      return options?.filter((option) =>
                        [
                          option?.country,
                          option?.iso3_code,
                          option?.country_code,
                        ].some((field) =>
                          field
                            ?.toLowerCase()
                            .includes(inputValue.toLowerCase())
                        )
                      );
                    }}
                    options={data?.countries || []}
                    getOptionLabel={(option) => option?.country}
                    onChange={(_, value) => {
                      if (value?.length > 3) {
                        toast.error(t("plans.restrictedCountriesSelection"));
                      }

                      if (value?.length <= 3 || value?.length === 0) {
                        if (value?.length === 0) {
                          setIsSearching(false);
                        }

                        setSearch(
                          value?.map((el) => {
                            return { id: el?.id };
                          })
                        );
                        setActiveTab("countries");
                        setFilters({
                          ...filters,
                          type: "",
                          country_codes:
                            value?.map((el) => el?.id).join(",") || "",
                        });
                        dispatch(
                          AttachSearch({
                            countries:
                              value?.map((el) => {
                                return {
                                  iso3_code: el?.iso3_code,
                                  country_name: el?.country,
                                };
                              }) || [],
                          })
                        );
                      }
                    }}
                    className="w-full flex"
                    renderInput={(params) => (
                      <StyledTextField
                        {...params}
                        placeholder={t("plans.searchByCountry")}
                        variant="outlined"
                        className="w-full"
                        size="small"
                        autoFocus
                      />
                    )}
                  />
                </div>
              ) : (
                <IconButton
                  onClick={() => setIsSearching(true)}
                  className="w-10 h-10 bg-white shadow-md rounded transition-all duration-500"
                >
                  <Badge
                    color="secondary"
                    variant="dot"
                    invisible={filters?.country_codes === ""}
                    overlap={"circular"}
                  >
                    <Search className="text-primary" />
                  </Badge>
                </IconButton>
              )}
            </div>

            {/* Tabs (Hide when searching) */}
            {(!isSearching || (isSearching && isSmall)) && (
              <div className="flex flex-1 sm:flex-none items-center gap-2 bg-white rounded shadow-md p-1 transition-all duration-500 w-full sm:w-auto  overflow-x-auto">
                <div className=" w-full flex flex-row justify-between gap-[0.5rem]">
                  <button
                    onClick={() => {
                      setFilters({ ...filters, type: "" });
                      setActiveTab("countries");
                    }}
                    className={`px-2 py-1 rounded text-base font-bold transition-colors ${
                      activeTab === "countries"
                        ? "bg-primary text-white"
                        : "text-primary"
                    }`}
                  >
                    {t("btn.countries")}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("regions");
                      setFilters({
                        ...filters,
                        type: "regions",
                        country_codes: "",
                      });
                    }}
                    className={`px-2 py-1 rounded text-base font-bold transition-colors ${
                      activeTab === "regions"
                        ? "bg-primary text-white"
                        : "text-primary"
                    }`}
                  >
                    {t("btn.regions")}
                  </button>
                  <button
                    onClick={() => {
                      setFilters({
                        ...filters,
                        type: "global",
                        country_codes: "",
                      });
                      setActiveTab("global");
                    }}
                    className={`px-2 py-1 rounded text-base font-bold transition-colors ${
                      activeTab === "global"
                        ? "bg-primary text-white"
                        : "text-primary"
                    }`}
                  >
                    {t("btn.global")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {isLoading ? (
        <CountriesSkeletons />
      ) : !homeData || homeData?.length === 0 || error ? (
        <NoDataFound text={t("plans.noPlansAvailable")} />
      ) : filters?.country_codes?.length !== 0 ? (
        <BundleList
          expandedCountry={filters?.country_codes}
          supportedCountries={search}
        />
      ) : filters?.type === "global" || activeRadio === "cruises" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {homeData?.map((bundleElement) => (
            <BundleCard
              key={`${bundleElement?.bundle_code}`}
              bundle={bundleElement}
              countryData={null}
              isLoading={false}
              globalDisplay={true}
              cruises={activeRadio === "cruises"}
            />
          ))}{" "}
        </div>
      ) : (
        <CountriesList
          data={homeData}
          region={filters?.type === "regions"}
          countryDisplay={filters?.type === ""}
          showAllCountries={showAllCountries}
          isLoading={isLoading}
          setShowAllCountries={setShowAllCountries}
        />
      )}

      {searchParams.get("order_id") && hoorayOpen && (
        <PaymentCompletion
          setOpenOrderDetail={() => {
            setHorrayOpen(false);
            setOpenOrderDetail(true);
          }}
        />
      )}
      {openOrderDetail && (
        <OrderPopup
          id={searchParams.get("order_id")}
          onClose={() => {
            setOpenOrderDetail(false);
            setFilters({ ...filters, order_id: null });
            dispatch(LimitedSignOut());
          }}
        />
      )}
    </>
  );
};

export default Plans;