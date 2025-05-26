import { useSelector } from "react-redux";
import { queryClient } from "../../main";
import {
  clearCacheIfVersionChanged,
  getStoredVersion,
} from "../version-storage/versionStorage";
import { useEffect } from "react";
import { getHomePageContent } from "../apis/homeAPI";
import { useQuery } from "react-query";

export const VERSION_STORAGE_KEY = "app_bundles_version";
export const API_CACHE_KEY = "home_countries_cache";

export const useHomeCountries = () => {
  const { bundles_version } = useSelector((state) => state.currency);

  //EXPLANATION: I am checking the version of bundles if changed then I invalidate the query
  useEffect(() => {
    if (bundles_version) {
      const versionChanged = clearCacheIfVersionChanged(bundles_version);

      if (versionChanged) {
        queryClient.invalidateQueries({
          queryKey: ["home-countries"],
        });
      }
    }
  }, [bundles_version, queryClient]);

  return useQuery({
    queryKey: ["home-countries", bundles_version],
    queryFn: async () => {
      try {
        const cachedData = localStorage.getItem(API_CACHE_KEY);
        const storedVersion = getStoredVersion();

        if (cachedData && storedVersion === bundles_version) {
          return JSON.parse(cachedData);
        }
      } catch (error) {
        console.error("Error reading from localStorage:", error);
      }

      //EXPLANATION:  If no cached data or version mismatch, fetch from API
      const response = await getHomePageContent();
      const data = response?.data?.data;

      try {
        localStorage.setItem(API_CACHE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }

      return data;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!bundles_version,
  });
};
