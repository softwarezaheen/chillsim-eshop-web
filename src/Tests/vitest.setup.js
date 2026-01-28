import { vi } from "vitest";

// Set up DOM element for React's createRoot
if (typeof document !== 'undefined') {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
}

// Mock IntersectionObserver for tests
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    // Immediately trigger callback as if element is intersecting
    this.callback([{ isIntersecting: true, target: {} }], this);
  }
  unobserve() {}
  disconnect() {}
};

// Mock the queryClient import from main.jsx to prevent circular dependency
vi.mock("./../main", () => {
  return {
    queryClient: {
      clear: vi.fn(),
    },
  };
});

// Mock Firebase messaging
vi.mock("../../firebaseconfig", () => {
  return {
    messaging: null,
    onMessageListener: vi.fn(),
    auth: {},
    googleProvider: {},
    signInWithPopup: vi.fn(),
    requestPermission: vi.fn(),
  };
});

// Mock deleteToken from firebase/messaging
vi.mock("firebase/messaging", () => {
  return {
    getMessaging: vi.fn(),
    getToken: vi.fn(),
    isSupported: vi.fn().mockReturnValue(false),
    onMessage: vi.fn(),
    deleteToken: vi.fn(),
  };
});

// Mock authAPI.jsx
vi.mock("./../core/apis/authAPI", () => {
  return {
    userLimitedLogin: vi.fn(),
    userLogin: vi.fn(),
    resendOrderOTP: vi.fn(),
    verifyOTP: vi.fn(),
    userLogout: vi.fn(),
    getUserInfo: vi.fn(),
    isUserLoggedIn: vi.fn(),
    refreshToken: vi.fn(),
    updateUserInfo: vi.fn(),
    deleteAccount: vi.fn(),
    supabaseSignout: vi.fn(),
  };
});

vi.mock("./../core/supabase/SupabaseClient.jsx", () => {
  return {
    createClient: vi.fn().mockReturnValue({
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: { id: "mockUser" } },
          error: null,
        }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        getSession: vi.fn().mockResolvedValue({
          data: { user: { id: "mockUser" } },
          error: null,
        }),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
        insert: vi.fn().mockResolvedValue({ data: [], error: null }),
        update: vi.fn().mockResolvedValue({ data: [], error: null }),
        delete: vi.fn().mockResolvedValue({ data: [], error: null }),
        eq: vi.fn().mockReturnThis(),
      })),
    }),
  };
});

// Mock firebase/app
vi.mock("firebase/app", () => {
  return {
    initializeApp: vi.fn(),
    getApp: vi.fn().mockReturnValue({}),
    getApps: vi.fn().mockReturnValue([{}]),
  };
});

// Mock firebase/auth and GoogleAuthProvider
vi.mock("firebase/auth", () => {
  return {
    getAuth: vi.fn().mockReturnValue({}),
    signInWithPopup: vi.fn(),
    GoogleAuthProvider: vi.fn(() => ({ providerId: "google.com" })),
  };
});

// Optionally mock other Firebase services (e.g., messaging)
vi.mock("firebase/messaging", () => {
  return {
    getMessaging: vi.fn(),
    getToken: vi.fn().mockResolvedValue("mock-token"),
    onMessage: vi.fn(),
    isSupported: vi.fn().mockResolvedValue(true),
  };
});
