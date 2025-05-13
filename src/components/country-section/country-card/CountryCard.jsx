//UTILITIES
import React, { useMemo } from "react";
//COMPONENT
import { Avatar, Card, CardContent, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import clsx from "clsx";

const CountryCard = ({ handleExpandClick, expandedCountry, data, region }) => {
  const isSelected = useMemo(() => {
    if (expandedCountry) {
      if (region) return expandedCountry == data?.region_code;
      else return expandedCountry == data?.id;
    } else {
      return false;
    }
  }, [data, expandedCountry]);
  return (
    <Card
      className={clsx("!rounded-lg", {
        "!bg-bgGrey": isSelected,
      })}
    >
      <CardContent
        onClick={() => handleExpandClick(data)}
        className={
          "cursor-pointer flex flex-row justify-between items-center gap-4 w-[100%]"
        }
      >
        <div className={"flex flex-row items-center gap-4 min-w-0 flex-1"}>
          <Avatar
            src={data?.icon}
            alt={region ? data?.region_name : data?.country}
            sx={{ width: 45, height: 45 }}
          >
            {/* fallback image */}
            <img
              src={"/media/global.svg"}
              className={"bg-white"}
              alt={region ? data?.region_name : data?.country}
            />
          </Avatar>
          <p className={"text-content-600 font-bold truncate w-full"}>
            {region ? data?.region_name : data?.country}
          </p>
        </div>

        <IconButton
          className="expand-icon"
          onClick={() => handleExpandClick(data)}
        >
          <ExpandMoreIcon
            sx={{
              transition: "transform 0.3s",
              transform: isSelected ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </IconButton>
      </CardContent>
    </Card>
  );
};

export default CountryCard;
