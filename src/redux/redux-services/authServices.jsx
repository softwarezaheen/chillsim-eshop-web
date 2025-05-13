import { getUserInfo } from "../../core/apis/authAPI";

export const fetchUserInfoFromAPI = async () => {
  try {
    return await getUserInfo();
  } catch (error) {
    return { status: 400 };
  }
};
