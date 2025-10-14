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

// Token refresh management
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

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

    // Skip token update if this is a retry with a specific token already set
    if (!config._skipAuthRefresh) {
      const token = authenticationStore?.tmp?.isAuthenticated
        ? authenticationStore?.tmp?.access_token
        : authenticationStore?.access_token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Always set these headers
    config.headers["x-device-id"] = xDeviceId;
    config.headers["x-currency"] = defaultCunrency || "EUR";
    
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
    const originalRequest = error.config;
    
    console.log("Interceptor error:", error?.response?.status);

    if (error?.response?.status === 401 && !originalRequest._retry) {
      const authenticationStore = store?.getState()?.authentication;
      
      // If already refreshing, queue this request
      if (isRefreshing) {
        console.log("🔄 Token refresh in progress, queuing request...");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            // Set the new token and flag to skip auth refresh in request interceptor
            originalRequest.headers.Authorization = `Bearer ${token}`;
            originalRequest._skipAuthRefresh = true;
            // Use raw axios to bypass interceptors (like 6b5af46)
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = authenticationStore?.tmp?.isAuthenticated
        ? authenticationStore?.tmp?.refresh_token
        : authenticationStore?.refresh_token;

      console.log("Refresh token debug:", { 
        refreshToken, 
        authenticationStore,
        tmpAuthenticated: authenticationStore?.tmp?.isAuthenticated,
        tmpRefreshToken: authenticationStore?.tmp?.refresh_token,
        mainRefreshToken: authenticationStore?.refresh_token
      });

      // Check if refresh token exists before making the call
      if (!refreshToken) {
        console.error("No refresh token available, clearing auth state");
        isRefreshing = false;
        processQueue(error, null);
        store.dispatch(SignOut());
        store.dispatch(DetachDevice());
        queryClient.clear();
        deleteToken(messaging);
        supabaseSignout();
        return Promise.reject(error);
      }

      try {
        console.log("🔄 Attempting token refresh...");
        
        const response = await axios.post(
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
        );

        console.log("✅ Token refresh successful");

        const newToken = response?.data?.data?.access_token;
        
        // Update the original request with new token and skip auth refresh flag
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        originalRequest._skipAuthRefresh = true;

        // Update Redux store based on auth type with full response data
        if (authenticationStore?.tmp?.isAuthenticated) {
          store.dispatch(
            LimitedSignIn({
              ...response?.data?.data,
            })
          );
        } else if (authenticationStore?.isAuthenticated) {
          store.dispatch(
            SignIn({
              ...response?.data?.data,
            })
          );
        }

        // Process all queued requests with new token
        processQueue(null, newToken);
        isRefreshing = false;

        // Retry the original request with the new token
        // Use raw axios to bypass interceptors (like 6b5af46)
        return axios(originalRequest);

      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        
        // Clear queue and fail all pending requests
        processQueue(refreshError, null);
        isRefreshing = false;

        // Sign out user
        store.dispatch(SignOut());
        store.dispatch(DetachDevice());
        queryClient.clear();
        deleteToken(messaging);
        supabaseSignout();

        return Promise.reject(refreshError);
      }
    } else if (error?.response?.status === 403) {
      store.dispatch(SignOut());
      store.dispatch(DetachDevice());
      queryClient.clear();
      deleteToken(messaging);
      supabaseSignout();
    } else {
      console.log(error, "error");
      const backendMessage =
        error?.response?.data?.developerMessage || error?.message;
      const i18nKey = backendMessagesTranslations[backendMessage];
      error.message = backendMessagesTranslations?.hasOwnProperty(
        backendMessage
      )
        ? i18n.t(`errors.${i18nKey}`)
        : backendMessage;
      return Promise.reject(error);
    }
  }
);