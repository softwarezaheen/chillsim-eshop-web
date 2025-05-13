import { getConfigurations } from "../../core/apis/configurationsAPI";

export const fetchConfigurationInfoFromAPI = async () => {
  try {
    return await getConfigurations();
  } catch (error) {
    return { status: 400 };
  }
};
