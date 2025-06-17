import axios from "axios";
import { SignIn, SignOut } from "../../redux/reducers/authReducer";
import { store } from "../../redux/store";
import { queryClient } from "../../main";
import { DetachDevice } from "../../redux/reducers/deviceReducer";
import { deleteToken } from "firebase/messaging";
import { messaging } from "../../../firebaseconfig";
import { supabaseSignout } from "./authAPI";

export const api = axios.create({
  headers: {
    "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
    "X-Language": "en",
    "x-device-id": sessionStorage.getItem("x-device-id") || "1234",
  },
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    console.log(sessionStorage.getItem("x-device-id"), "x device id");
    const xDeviceId = sessionStorage.getItem("x-device-id") || "1234";
    // Set the accept-language header dynamically
    config.headers["accept-language"] = 'en';
    const authenticationStore = store?.getState()?.authentication;
    console.log(
      authenticationStore?.tmp?.isAuthenticated,
      "checkk interceptor",
      authenticationStore,
    );
    const defaultCunrency =
      sessionStorage?.getItem("user_currency") ||
      store?.getState()?.currency?.system_currency;

    const token = authenticationStore?.tmp?.isAuthenticated
      ? authenticationStore?.tmp?.access_token
      : authenticationStore?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["x-device-id"] = xDeviceId;
      config.headers["x-currency"] = defaultCunrency || "EUR";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
// Set the AUTH token for any request
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    console.log(error, "errrorrrr11");
    if (error?.response?.status === 401) {
      const authenticationStore = store?.getState()?.authentication;
      console.log(error, "errrorrrr22222", authenticationStore);
      const refreshToken = authenticationStore?.tmp?.isAuthenticated
        ? authenticationStore?.tmp?.refresh_token
        : authenticationStore?.refresh_token;

      console.log(error, "errrorrrr33333");
      await axios
        .post(
          `${import.meta.env.VITE_API_URL}api/v1/auth/refresh-token`,
          null,
          {
            headers: {
              "x-refresh-token": refreshToken,
              "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
              "X-Language": "en",
              "x-device-id": sessionStorage.getItem("x-device-id") || "1234",
            },
          },
        )
        .then((res) => {
          console.log("refetch token succeeeded ", res);
          const newToken = res?.data?.data?.access_token;
          config.headers.Authorization = `Bearer ${newToken}`;
          store.dispatch(
            SignIn({
              ...res?.data?.data,
            }),
          );
        })
        .catch((e) => {
          console.log("refetch token failed", e);
          store.dispatch(SignOut());
          store.dispatch(DetachDevice());
          queryClient.clear();
          deleteToken(messaging);
          supabaseSignout();
        });
      return axios(config);
    } else if (error?.response?.status === 403) {
      store.dispatch(SignOut());
      store.dispatch(DetachDevice());
      queryClient.clear();
      deleteToken(messaging);
      supabaseSignout();
    } else {
      console.log(error, "interceptor error other than 401 and 403");
      error.message = error?.response?.data?.message || error?.message;
      return Promise.reject(error);
    }
  },
);
