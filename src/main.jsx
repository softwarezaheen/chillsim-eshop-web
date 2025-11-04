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

// 🔍 Visual debug helper
const updateDebug = (msg, color) => {
  const el = document.getElementById('debug-indicator');
  if (el) {
    el.textContent = msg;
    if (color) el.style.background = color;
  }
};

updateDebug('✅ main.jsx loaded successfully', '#4CAF50');

dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

updateDebug('⏳ Setting up error handlers...', '#2196F3');

// ========================================
// 🛡️ GLOBAL ERROR HANDLERS FOR iOS
// ========================================
// Prevents app crashes from unhandled errors in iOS in-app browsers

// Catch synchronous errors
window.addEventListener("error", (event) => {
  console.error("🚨 Global error caught:", event.error);
  updateDebug('❌ ERROR: ' + (event.message || 'Unknown'), '#f44336');
  
  // Check if it's a FingerprintJS or storage-related error
  const errorMessage = event.message || event.error?.message || "";
  if (
    errorMessage.includes("FingerprintJS") ||
    errorMessage.includes("localStorage") ||
    errorMessage.includes("sessionStorage") ||
    errorMessage.includes("indexedDB")
  ) {
    console.warn("⚠️ Storage/fingerprint error detected - likely iOS in-app browser restriction");
    event.preventDefault(); // Prevent default error handling
  }
});

// Catch unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("🚨 Unhandled promise rejection:", event.reason);
  updateDebug('❌ PROMISE REJECTED: ' + (event.reason?.message || event.reason?.toString() || 'Unknown'), '#f44336');
  
  // Check if it's a FingerprintJS error
  const reason = event.reason?.message || event.reason?.toString() || "";
  if (
    reason.includes("FingerprintJS") ||
    reason.includes("load") ||
    reason.includes("fingerprint")
  ) {
    console.warn("⚠️ FingerprintJS promise rejection - iOS in-app browser likely");
    event.preventDefault(); // Prevent unhandled rejection
  }
});

updateDebug('⏳ Checking environment...', '#2196F3');

// Log environment info for debugging
console.log("🌐 Environment:", {
  userAgent: navigator.userAgent,
  isIOS: /iPhone|iPad|iPod/.test(navigator.userAgent),
  isInAppBrowser: /FBAN|FBAV|Instagram|Twitter/i.test(navigator.userAgent),
  storageAvailable: (() => {
    try {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
      return true;
    } catch {
      return false;
    }
  })(),
});

updateDebug('✅ Environment checked', '#4CAF50');

// ========================================

updateDebug('⏳ Creating QueryClient...', '#2196F3');

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

updateDebug('✅ QueryClient created', '#4CAF50');
updateDebug('⏳ Getting root element...', '#2196F3');

const rootElement = document.getElementById("root");
if (!rootElement) {
  updateDebug('❌ FATAL: #root element not found!', '#f44336');
  throw new Error("Root element not found");
}

updateDebug('✅ Root element found, creating React root...', '#4CAF50');

const root = createRoot(rootElement);

updateDebug('⏳ Rendering React app...', '#2196F3');

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

// Mark that React has successfully rendered
updateDebug('✅ React app rendered! Removing debug in 3s...', '#4CAF50');
window.__REACT_RENDERED__ = true;

// Hide debug indicator after 3 seconds if app loaded successfully
setTimeout(() => {
  const el = document.getElementById('debug-indicator');
  if (el && window.__REACT_RENDERED__) {
    el.style.display = 'none';
  }
}, 3000);
