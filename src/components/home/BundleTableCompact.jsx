//UTILITIES
import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
//MUI
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Button,
  Avatar,
  AvatarGroup,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { Visibility, ShoppingCart } from "@mui/icons-material";

const BundleTableCompact = ({ bundles = [], onViewDetails, selectedDuration, defaultSort }) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 639px)");

  // Sorting state - use defaultSort prop if provided, otherwise default to validity desc
  const [orderBy, setOrderBy] = useState(defaultSort?.orderBy || "validity");
  const [order, setOrder] = useState(defaultSort?.order || "desc");

  // Update sort state when defaultSort prop changes
  useEffect(() => {
    if (defaultSort) {
      setOrderBy(defaultSort.orderBy);
      setOrder(defaultSort.order);
    }
  }, [defaultSort]);

  // Handle sort
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Format validity for display
  const formatValidity = (validityDisplay) => {
    if (!validityDisplay) return "";

    const [num, rawUnit] = validityDisplay.split(" ");
    const count = Number(num);
    if (isNaN(count) || !rawUnit) return validityDisplay;

    const unitKeyRaw = rawUnit.toLowerCase().replace(/s$/, "");
    const unitKey = count === 1 ? unitKeyRaw : `${unitKeyRaw}_plural`;

    const translatedUnit = i18next.t(`bundles.unit.${unitKey}`);
    return `${count} ${translatedUnit}`;
  };

  // Sort bundles
  const sortedBundles = useMemo(() => {
    const comparator = (a, b) => {
      let aValue, bValue;

      switch (orderBy) {
        case "name":
          aValue = a.display_title || "";
          bValue = b.display_title || "";
          return order === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        case "data":
          aValue = a.gprs_limit || 0;
          bValue = b.gprs_limit || 0;
          break;
        case "validity":
          aValue = a.validity || 0;
          bValue = b.validity || 0;
          break;
        case "price":
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        default:
          return 0;
      }

      return order === "asc" ? aValue - bValue : bValue - aValue;
    };

    return [...bundles].sort(comparator);
  }, [bundles, orderBy, order]);

  // Column definitions
  const columns = [
    { id: "name", label: t("home.table.planName"), sortable: true },
    { id: "data", label: t("home.table.data"), sortable: true },
    { id: "validity", label: t("home.table.validity"), sortable: true },
    { id: "countries", label: t("home.table.countries"), sortable: false },
    { id: "price", label: t("home.table.price"), sortable: true },
    { id: "actions", label: "", sortable: false },
  ];

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-3">
        {sortedBundles.map((bundle, index) => (
          <Paper
            key={bundle.bundle_code || index}
            className="p-4 rounded-lg"
            elevation={3}
            sx={{ boxShadow: '0 6px 12px rgba(0, 0, 0, 0.30)' }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <Avatar
                  src={bundle.icon}
                  alt={bundle.display_title}
                  sx={{ width: 32, height: 32 }}
                />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {bundle.display_title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {bundle.count_countries || 1}{" "}
                    {t("home.table.countriesCovered")}
                  </p>
                </div>
              </div>
              <p className="text-lg font-bold text-primary">
                {bundle.price_display}
              </p>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
              <span>
                <strong>{bundle.gprs_limit_display}</strong>
              </span>
              <span>{formatValidity(bundle.validity_display)}</span>
            </div>

            <div className="flex justify-center">
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => onViewDetails(bundle)}
                startIcon={<Visibility />}
              >
                {t("home.table.viewDetails")}
              </Button>
            </div>
          </Paper>
        ))}
      </div>
    );
  }

  // Desktop table view
  return (
    <TableContainer component={Paper} className="rounded-lg shadow-sm">
      <Table size="small">
        <TableHead>
          <TableRow className="bg-gray-50">
            {columns.map((column) => (
              <TableCell
                key={column.id}
                className="!font-semibold !text-gray-700"
                sortDirection={orderBy === column.id ? order : false}
              >
                {column.sortable ? (
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : "asc"}
                    onClick={() => handleRequestSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedBundles.map((bundle, index) => (
            <TableRow
              key={bundle.bundle_code || index}
              hover
              className="cursor-pointer"
            >
              {/* Plan Name */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar
                    src={bundle.icon}
                    alt={bundle.display_title}
                    sx={{ width: 28, height: 28 }}
                  />
                  <span className="font-medium text-gray-800">
                    {bundle.display_title}
                  </span>
                </div>
              </TableCell>

              {/* Data */}
              <TableCell>
                <span className="font-semibold text-gray-700">
                  {bundle.gprs_limit_display}
                </span>
              </TableCell>

              {/* Validity */}
              <TableCell>{formatValidity(bundle.validity_display)}</TableCell>

              {/* Countries */}
              <TableCell>
                {bundle.countries && bundle.countries.length > 0 ? (
                  <Tooltip 
                    title={bundle.countries.map(c => c.country).join(", ")} 
                    arrow
                    placement="top"
                  >
                    <AvatarGroup 
                      max={4}
                      total={bundle.count_countries || bundle.countries.length}
                      sx={{ 
                        justifyContent: "flex-start",
                        "& .MuiAvatar-root": {
                          width: 22,
                          height: 22,
                          fontSize: "0.65rem",
                          border: "1px solid white",
                        },
                        "& .MuiAvatarGroup-avatar": {
                          width: 22,
                          height: 22,
                          fontSize: "0.65rem",
                        },
                      }}
                    >
                      {bundle.countries.map((country, idx) => (
                        <Avatar
                          key={idx}
                          src={country.icon}
                          alt={country.country}
                        />
                      ))}
                    </AvatarGroup>
                  </Tooltip>
                ) : (
                  <span className="text-sm text-gray-500">
                    {bundle.count_countries || 1}{" "}
                    {t("home.table.countriesCovered")}
                  </span>
                )}
              </TableCell>

              {/* Price */}
              <TableCell>
                <span className="font-bold text-primary text-lg">
                  {bundle.price_display}
                </span>
              </TableCell>

              {/* Actions */}
              <TableCell>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => onViewDetails(bundle)}
                  startIcon={<Visibility />}
                >
                  {t("home.table.viewDetails")}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BundleTableCompact;
