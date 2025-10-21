import {
  configureStore,
  combineReducers,
  applyMiddleware,
  compose,
} from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import AuthSlice from "./reducers/authReducer";
import SearchSlice from "./reducers/searchReducer";
import OrderSlice from "./reducers/orderReducer";
import DeviceSlice from "./reducers/deviceReducer";
import CurrencySlice from "./reducers/currencyReducer";
import directionReducer from "./reducers/directionSlice.jsx";
import ReferralSlice from "./reducers/referralReducer.jsx";
import hardSet from "redux-persist/es/stateReconciler/hardSet";
import { thunk } from "redux-thunk";
import { createMigrate } from "redux-persist";

const rootReducer = combineReducers({
  authentication: AuthSlice,
  search: SearchSlice,
  order: OrderSlice,
  device: DeviceSlice,
  currency: CurrencySlice,
  direction: directionReducer,
  referral: ReferralSlice,
});

// Migration to add referral state to existing persisted storage
const migrations = {
  0: (state) => {
    // Add referral state if it doesn't exist
    return {
      ...state,
      referral: state.referral || {
        referralCode: localStorage.getItem("referred_by") || null,
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
  storage,
  version: 0,
  migrate: createMigrate(migrations, { debug: false }),
  stateReconciler: hardSet,
  whitelist: ["authentication", "search", "device", "currency", "direction", "referral"],
  debug: true,
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
