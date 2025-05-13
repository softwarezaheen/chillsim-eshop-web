//utilities
import React, { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "./App";
import "swiper/css";
import "./index.css";
import "./i18n";
import { appTheme } from "./assets/theme";
import { ThemeProvider } from "@mui/material";
import { persistor, store } from "./redux/store";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
import dayjs from "dayjs";
import SuspenseLoading from "./pages/SuspenseLoading";
import { AuthProvider } from "./core/context/AuthContext";
import { NotificationProvider } from "./core/context/NotificationContext";

dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 180000, // 3 minutes
      cacheTime: 180000, // 3 minutes
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const root = createRoot(document.getElementById("root"));

root.render(
  // <React.StrictMode>
  <BrowserRouter>
    <ThemeProvider theme={appTheme}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Suspense fallback={<SuspenseLoading />}>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <NotificationProvider>
                  <App />
                  <ToastContainer
                    position="top-center"
                    autoClose={4000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    progressClassName="Toast__progress_bar"
                    closeButton={false}
                  />{" "}
                </NotificationProvider>
              </AuthProvider>
            </QueryClientProvider>
          </Suspense>
        </PersistGate>
      </Provider>
    </ThemeProvider>
  </BrowserRouter>
  // </React.StrictMode>
);
