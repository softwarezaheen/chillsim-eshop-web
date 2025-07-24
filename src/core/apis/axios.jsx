import axios from "axios";
import {
  LimitedSignIn,
  SignIn,
  SignOut,
} from "../../redux/reducers/authReducer";
import { store } from "../../redux/store";
import { queryClient } from "../../main";
import { DetachDevice } from "../../redux/reducers/deviceReducer";
import { deleteToken } from "firebase/messaging";
import { messaging } from "../../../firebaseconfig";
import { supabaseSignout } from "./authAPI";
import { backendMessagesTranslations } from "../variables/BackendMessages";
import i18n from "../../i18n";

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
    const xDeviceId = sessionStorage.getItem("x-device-id") || "1234";
    // Set the accept-language header dynamically
    config.headers["accept-language"] = localStorage.getItem("i18nextLng");
    const authenticationStore = store?.getState()?.authentication;
    console.log(
      authenticationStore?.tmp?.isAuthenticated,
      "checkk interceptor",
      authenticationStore
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
  }
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
          }
        )
        .then((res) => {
          console.log("refetch token succeeeded ", res);
          const newToken = res?.data?.data?.access_token;
          config.headers.Authorization = `Bearer ${newToken}`;
          if (authenticationStore?.tmp?.isAuthenticated) {
            store.dispatch(
              LimitedSignIn({
                ...res?.data?.data,
              })
            );
          } else if (authenticationStore?.isAuthenticated) {
            store.dispatch(
              SignIn({
                ...res?.data?.data,
              })
            );
          } else {
            store.dispatch(SignOut());
            store.dispatch(DetachDevice());
            queryClient.clear();
            deleteToken(messaging);
            supabaseSignout();
          }
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
      const backendMessage = error?.response?.data?.message || error?.message;
      const i18nKey = backendMessagesTranslations[backendMessage];
      error.message = i18nKey ? i18n.t(`errors.${i18nKey}`) : backendMessage;
      return Promise.reject(error);
    }
  }
);