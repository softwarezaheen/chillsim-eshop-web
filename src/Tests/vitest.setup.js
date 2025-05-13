import { vi } from "vitest";

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
