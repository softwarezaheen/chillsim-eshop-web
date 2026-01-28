import {
  configureStore,
  combineReducers,
  applyMiddleware,
  compose,
} from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { thunk } from "redux-thunk";
import { createMigrate } from "redux-persist";
import hardSet from "redux-persist/es/stateReconciler/hardSet";

// Import reducers
import authReducer from "./reducers/authReducer";
import searchReducer from "./reducers/searchReducer";
import orderReducer from "./reducers/orderReducer";
import deviceReducer from "./reducers/deviceReducer";
import currencyReducer from "./reducers/currencyReducer";
import directionReducer from "./reducers/directionSlice.jsx";
import referralReducer from "./reducers/referralReducer.jsx";

// ========================================
// 🛡️ STORAGE WRAPPER FOR iOS IN-APP BROWSERS
// ========================================
// Fallback to in-memory storage if localStorage is blocked

const createNoopStorage = () => {
  const noopStorage = {
    getItem: () => Promise.resolve(null),
    setItem: () => Promise.resolve(),
    removeItem: () => Promise.resolve(),
  };
  return noopStorage;
};

const isStorageAvailable = () => {
  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const safeStorage = isStorageAvailable() ? storage : createNoopStorage();

console.log("📦 Redux Persist Storage:", isStorageAvailable() ? "localStorage" : "in-memory fallback");

// ========================================

const rootReducer = combineReducers({
  authentication: authReducer,
  search: searchReducer,
  order: orderReducer,
  device: deviceReducer,
  currency: currencyReducer,
  direction: directionReducer,
  referral: referralReducer,
});

// Migration to add referral state to existing persisted storage
const migrations = {
  0: (state) => {
    // Add referral state if it doesn't exist
    // Safely access localStorage with fallback
    let referredBy = null;
    try {
      referredBy = localStorage.getItem("referred_by");
    } catch {
      console.warn("⚠️ localStorage blocked - migration skipped");
    }
    
    return {
      ...state,
      referral: state.referral || {
        referralCode: referredBy || null,
        discountPercentage: null,
        discountType: null,
        referrerName: null,
        isEligible: false,
        isValidating: false,
        lastValidated: null,
        error: null,
      },
    };
  },
};

const persistConfig = {
  key: "root",
  storage: safeStorage, // Use safe storage wrapper
  version: 0,
  migrate: createMigrate(migrations, { debug: false }),
  stateReconciler: hardSet,
  whitelist: ["authentication", "search", "device", "currency", "direction", "referral"],
  debug: false, // Disable debug logs in production
};

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ trace: true, traceLimit: 25 })
  : compose;

// Create the Redux store
const store = configureStore(
  {
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  },
  composeEnhancers(applyMiddleware(thunk)),
);

// Create a persistor for the store
const persistor = persistStore(store);

export { store, persistor };
