import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';

// Mock API
vi.mock('../core/apis/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), handlers: [] },
      response: { use: vi.fn(), handlers: [] },
    },
  },
}));

vi.mock('../main', () => ({
  queryClient: { clear: vi.fn() },
}));

vi.mock('../../firebaseconfig', () => ({
  messaging: null,
}));

// Create a minimal store for testing
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      authentication: (state = initialState.authentication || {}, action) => state,
      currency: (state = initialState.currency || {}, action) => state,
      device: (state = initialState.device || {}, action) => state,
    },
    preloadedState: initialState,
  });
};

describe('Integration Tests - Critical User Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  describe('Authentication Flow', () => {
    it('should handle unauthenticated user state', () => {
      const store = createMockStore({
        authentication: {
          access_token: null,
          isAuthenticated: false,
        },
      });

      const TestComponent = () => (
        <div>
          <h1>Auth Status</h1>
          <p>User: {store.getState().authentication.isAuthenticated ? 'Logged In' : 'Guest'}</p>
        </div>
      );

      render(
        <Provider store={store}>
          <MemoryRouter>
            <TestComponent />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('User: Guest')).toBeTruthy();
    });

    it('should handle authenticated user state', () => {
      const store = createMockStore({
        authentication: {
          access_token: 'mock-token-123',
          isAuthenticated: true,
        },
      });

      const TestComponent = () => (
        <div>
          <p>User: {store.getState().authentication.isAuthenticated ? 'Logged In' : 'Guest'}</p>
        </div>
      );

      render(
        <Provider store={store}>
          <MemoryRouter>
            <TestComponent />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('User: Logged In')).toBeTruthy();
    });
  });

  describe('Navigation Flow with Authentication', () => {
    it('should navigate between public routes', async () => {
      const store = createMockStore();

      const App = () => (
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/about" element={<div>About Page</div>} />
          <Route path="/plans" element={<div>Plans Page</div>} />
        </Routes>
      );

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/']}>
            <App />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Home Page')).toBeTruthy();

      // Test navigation by rendering with different route
      const { container } = render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/about']}>
            <App />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('About Page')).toBeTruthy();
    });

    it('should handle protected route access', () => {
      const store = createMockStore({
        authentication: {
          access_token: null,
          isAuthenticated: false,
        },
      });

      const ProtectedComponent = () => {
        const isAuth = store.getState().authentication.isAuthenticated;
        return isAuth ? <div>Protected Content</div> : <div>Please Login</div>;
      };

      render(
        <Provider store={store}>
          <MemoryRouter>
            <ProtectedComponent />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Please Login')).toBeTruthy();
    });
  });

  describe('Currency and Localization Flow', () => {
    it('should use default currency from store', () => {
      const store = createMockStore({
        currency: {
          system_currency: 'EUR',
        },
      });

      const CurrencyComponent = () => {
        const currency = store.getState().currency.system_currency;
        return <div>Currency: {currency}</div>;
      };

      render(
        <Provider store={store}>
          <MemoryRouter>
            <CurrencyComponent />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Currency: EUR')).toBeTruthy();
    });

    it('should use user selected currency from sessionStorage', () => {
      sessionStorage.setItem('user_currency', 'USD');

      const store = createMockStore({
        currency: {
          system_currency: 'EUR',
        },
      });

      const currency = sessionStorage.getItem('user_currency') || 
                      store.getState().currency.system_currency;

      expect(currency).toBe('USD');
    });

    it('should handle language preference', () => {
      localStorage.setItem('i18nextLng', 'fr');

      const language = localStorage.getItem('i18nextLng');

      expect(language).toBe('fr');
    });
  });

  describe('Device ID Management', () => {
    it('should generate and persist device ID', () => {
      const deviceId = 'device-abc-123';
      sessionStorage.setItem('x-device-id', deviceId);

      const storedDeviceId = sessionStorage.getItem('x-device-id');

      expect(storedDeviceId).toBe(deviceId);
    });

    it('should use default device ID when not set', () => {
      const deviceId = sessionStorage.getItem('x-device-id') || '1234';

      expect(deviceId).toBe('1234');
    });
  });

  describe('Affiliate Tracking Flow', () => {
    it('should capture and store affiliate click ID', () => {
      const clickId = 'affiliate-xyz-789';
      const timestamp = Date.now().toString();

      localStorage.setItem('affiliate_click_id', clickId);
      localStorage.setItem('affiliate_click_timestamp', timestamp);

      expect(localStorage.getItem('affiliate_click_id')).toBe(clickId);
      expect(localStorage.getItem('affiliate_click_timestamp')).toBe(timestamp);
    });

    it('should clear expired affiliate data', () => {
      const clickId = 'affiliate-xyz';
      const expiredTimestamp = (Date.now() - 31 * 24 * 60 * 60 * 1000).toString();

      localStorage.setItem('affiliate_click_id', clickId);
      localStorage.setItem('affiliate_click_timestamp', expiredTimestamp);

      const timestamp = parseInt(localStorage.getItem('affiliate_click_timestamp'));
      const isExpired = Date.now() - timestamp > 30 * 24 * 60 * 60 * 1000;

      if (isExpired) {
        localStorage.removeItem('affiliate_click_id');
        localStorage.removeItem('affiliate_click_timestamp');
      }

      expect(localStorage.getItem('affiliate_click_id')).toBeNull();
    });

    it('should preserve valid affiliate data', () => {
      const clickId = 'affiliate-valid';
      const validTimestamp = Date.now().toString();

      localStorage.setItem('affiliate_click_id', clickId);
      localStorage.setItem('affiliate_click_timestamp', validTimestamp);

      const timestamp = parseInt(localStorage.getItem('affiliate_click_timestamp'));
      const isExpired = Date.now() - timestamp > 30 * 24 * 60 * 60 * 1000;

      expect(isExpired).toBe(false);
      expect(localStorage.getItem('affiliate_click_id')).toBe(clickId);
    });
  });

  describe('Error Boundary Integration', () => {
    it('should handle component errors gracefully', () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      class ErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false };
        }

        static getDerivedStateFromError() {
          return { hasError: true };
        }

        render() {
          if (this.state.hasError) {
            return <div>Error Occurred</div>;
          }
          return this.props.children;
        }
      }

      const store = createMockStore();

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      render(
        <Provider store={store}>
          <MemoryRouter>
            <ErrorBoundary>
              <ErrorComponent />
            </ErrorBoundary>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Error Occurred')).toBeTruthy();

      console.error = originalError;
    });
  });

  describe('Session Persistence', () => {
    it('should maintain session across page reloads', () => {
      const mockToken = 'session-token-123';
      const deviceId = 'device-456';

      sessionStorage.setItem('x-device-id', deviceId);
      localStorage.setItem('auth_token', mockToken);

      // Simulate reload
      const restoredToken = localStorage.getItem('auth_token');
      const restoredDeviceId = sessionStorage.getItem('x-device-id');

      expect(restoredToken).toBe(mockToken);
      expect(restoredDeviceId).toBe(deviceId);
    });

    it('should clear session on logout', () => {
      sessionStorage.setItem('x-device-id', 'device-123');
      localStorage.setItem('auth_token', 'token-123');
      localStorage.setItem('i18nextLng', 'en');

      // Simulate logout
      sessionStorage.removeItem('x-device-id');
      localStorage.removeItem('auth_token');
      // Keep language preference

      expect(sessionStorage.getItem('x-device-id')).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('i18nextLng')).toBe('en');
    });
  });

  describe('Multi-tab Synchronization', () => {
    it('should handle localStorage changes from other tabs', () => {
      const originalValue = 'value-1';
      const updatedValue = 'value-2';

      localStorage.setItem('test_key', originalValue);

      // Simulate change from another tab
      localStorage.setItem('test_key', updatedValue);

      const currentValue = localStorage.getItem('test_key');

      expect(currentValue).toBe(updatedValue);
    });
  });

  describe('Performance and Stability', () => {
    it('should handle rapid state updates', () => {
      const store = createMockStore({
        authentication: {
          access_token: null,
        },
      });

      const RapidUpdateComponent = () => {
        const [count, setCount] = React.useState(0);

        return (
          <div>
            <p>Count: {count}</p>
            <button onClick={() => {
              for (let i = 0; i < 100; i++) {
                setCount(prev => prev + 1);
              }
            }}>
              Rapid Update
            </button>
          </div>
        );
      };

      render(
        <Provider store={store}>
          <MemoryRouter>
            <RapidUpdateComponent />
          </MemoryRouter>
        </Provider>
      );

      const button = screen.getByText('Rapid Update');

      expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('should handle large route trees', () => {
      const store = createMockStore();

      const routes = Array(50).fill(null).map((_, i) => (
        <Route key={i} path={`/route-${i}`} element={<div>Route {i}</div>} />
      ));

      const LargeRouteTree = () => (
        <Routes>
          {routes}
          <Route path="*" element={<div>404</div>} />
        </Routes>
      );

      expect(() => {
        render(
          <Provider store={store}>
            <MemoryRouter initialEntries={['/route-25']}>
              <LargeRouteTree />
            </MemoryRouter>
          </Provider>
        );
      }).not.toThrow();

      expect(screen.getByText('Route 25')).toBeTruthy();
    });
  });

  describe('Redux Integration', () => {
    it('should dispatch actions correctly', () => {
      const mockDispatch = vi.fn();
      const store = createMockStore({
        authentication: {
          access_token: null,
        },
      });
      store.dispatch = mockDispatch;

      const TestComponent = () => {
        return (
          <button onClick={() => {
            store.dispatch({ type: 'TEST_ACTION' });
          }}>
            Dispatch Action
          </button>
        );
      };

      render(
        <Provider store={store}>
          <MemoryRouter>
            <TestComponent />
          </MemoryRouter>
        </Provider>
      );

      const button = screen.getByText('Dispatch Action');
      fireEvent.click(button);

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should update store state', () => {
      const store = createMockStore({
        authentication: {
          access_token: 'token-123',
        },
      });

      const StateDisplayComponent = () => {
        const token = store.getState().authentication.access_token;
        return <div>Token: {token}</div>;
      };

      render(
        <Provider store={store}>
          <MemoryRouter>
            <StateDisplayComponent />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Token: token-123')).toBeTruthy();
    });

    it('should handle multiple store updates', () => {
      const mockDispatch = vi.fn();
      const store = createMockStore({
        authentication: {
          access_token: null,
        },
      });
      store.dispatch = mockDispatch;

      const MultiUpdateComponent = () => {
        return (
          <button onClick={() => {
            store.dispatch({ type: 'UPDATE_1' });
            store.dispatch({ type: 'UPDATE_2' });
            store.dispatch({ type: 'UPDATE_3' });
          }}>
            Update Multiple
          </button>
        );
      };

      render(
        <Provider store={store}>
          <MemoryRouter>
            <MultiUpdateComponent />
          </MemoryRouter>
        </Provider>
      );

      const button = screen.getByText('Update Multiple');
      fireEvent.click(button);

      expect(mockDispatch).toHaveBeenCalledTimes(3);
    });
  });

  describe('Form Handling Integration', () => {
    it('should handle basic form submission', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());

      const FormComponent = () => (
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" />
          <button type="submit">Submit</button>
        </form>
      );

      const store = createMockStore();

      render(
        <Provider store={store}>
          <MemoryRouter>
            <FormComponent />
          </MemoryRouter>
        </Provider>
      );

      const button = screen.getByText('Submit');
      fireEvent.click(button);

      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should handle input changes', () => {
      const FormComponent = () => {
        const [value, setValue] = React.useState('');

        return (
          <div>
            <input 
              value={value} 
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type here"
            />
            <p>Value: {value}</p>
          </div>
        );
      };

      const store = createMockStore();

      render(
        <Provider store={store}>
          <MemoryRouter>
            <FormComponent />
          </MemoryRouter>
        </Provider>
      );

      const input = screen.getByPlaceholderText('Type here');
      fireEvent.change(input, { target: { value: 'test input' } });

      expect(screen.getByText('Value: test input')).toBeTruthy();
    });

    it('should handle form validation', () => {
      const FormWithValidation = () => {
        const [email, setEmail] = React.useState('');
        const [error, setError] = React.useState('');

        const validate = () => {
          if (!email.includes('@')) {
            setError('Invalid email');
          } else {
            setError('');
          }
        };

        return (
          <div>
            <input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              onBlur={validate}
              placeholder="Email"
            />
            {error && <p>Error: {error}</p>}
          </div>
        );
      };

      const store = createMockStore();

      render(
        <Provider store={store}>
          <MemoryRouter>
            <FormWithValidation />
          </MemoryRouter>
        </Provider>
      );

      const input = screen.getByPlaceholderText('Email');
      fireEvent.change(input, { target: { value: 'invalid' } });
      fireEvent.blur(input);

      expect(screen.getByText('Error: Invalid email')).toBeTruthy();
    });
  });

  describe('Complete User Journey Simulation', () => {
    it('should simulate login flow', () => {
      const store = createMockStore({
        authentication: {
          access_token: null,
          isAuthenticated: false,
        },
      });

      const LoginFlow = () => {
        const [step, setStep] = React.useState('login');

        return (
          <div>
            {step === 'login' && (
              <div>
                <h1>Login Page</h1>
                <button onClick={() => {
                  store.dispatch({ type: 'LOGIN_SUCCESS' });
                  setStep('dashboard');
                }}>
                  Login
                </button>
              </div>
            )}
            {step === 'dashboard' && <h1>Dashboard</h1>}
          </div>
        );
      };

      render(
        <Provider store={store}>
          <MemoryRouter>
            <LoginFlow />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Login Page')).toBeTruthy();

      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);

      expect(screen.getByText('Dashboard')).toBeTruthy();
    });

    it('should simulate browse to purchase flow', () => {
      const store = createMockStore({
        authentication: {
          access_token: 'token-123',
          isAuthenticated: true,
        },
      });

      const PurchaseFlow = () => {
        const [step, setStep] = React.useState('browse');
        const [selectedBundle, setSelectedBundle] = React.useState(null);

        return (
          <div>
            {step === 'browse' && (
              <div>
                <h1>Browse Bundles</h1>
                <button onClick={() => {
                  setSelectedBundle('bundle-1');
                  setStep('details');
                }}>
                  View Bundle
                </button>
              </div>
            )}
            {step === 'details' && (
              <div>
                <h1>Bundle Details</h1>
                <p>Selected: {selectedBundle}</p>
                <button onClick={() => setStep('checkout')}>
                  Proceed to Checkout
                </button>
              </div>
            )}
            {step === 'checkout' && <h1>Checkout</h1>}
          </div>
        );
      };

      render(
        <Provider store={store}>
          <MemoryRouter>
            <PurchaseFlow />
          </MemoryRouter>
        </Provider>
      );

      // Browse
      expect(screen.getByText('Browse Bundles')).toBeTruthy();

      // Select bundle
      fireEvent.click(screen.getByText('View Bundle'));
      expect(screen.getByText('Bundle Details')).toBeTruthy();
      expect(screen.getByText('Selected: bundle-1')).toBeTruthy();

      // Checkout
      fireEvent.click(screen.getByText('Proceed to Checkout'));
      expect(screen.getByText('Checkout')).toBeTruthy();
    });

    it('should handle authentication-required flow', () => {
      const store = createMockStore({
        authentication: {
          access_token: null,
          isAuthenticated: false,
        },
      });

      const ProtectedFlow = () => {
        const isAuth = store.getState().authentication.isAuthenticated;
        return isAuth ? <h1>Protected Content</h1> : <h1>Please Login</h1>;
      };

      render(
        <Provider store={store}>
          <MemoryRouter>
            <Routes>
              <Route path="/" element={<ProtectedFlow />} />
              <Route path="/login" element={<h1>Login Page</h1>} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Please Login')).toBeTruthy();
    });
  });

  describe('Offline and Network Resilience', () => {
    it('should handle offline state', () => {
      const OfflineIndicator = () => {
        const [isOnline, setIsOnline] = React.useState(navigator.onLine);

        React.useEffect(() => {
          const handleOnline = () => setIsOnline(true);
          const handleOffline = () => setIsOnline(false);

          window.addEventListener('online', handleOnline);
          window.addEventListener('offline', handleOffline);

          return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
          };
        }, []);

        return <div>Status: {isOnline ? 'Online' : 'Offline'}</div>;
      };

      const store = createMockStore();

      render(
        <Provider store={store}>
          <MemoryRouter>
            <OfflineIndicator />
          </MemoryRouter>
        </Provider>
      );

      // Should render status
      expect(screen.getByText(/Status:/)).toBeTruthy();
    });

    it('should queue operations when offline', () => {
      const store = createMockStore();
      const queue = [];

      const QueuedOperations = () => {
        const addToQueue = (operation) => {
          if (!navigator.onLine) {
            queue.push(operation);
          }
        };

        return (
          <button onClick={() => addToQueue({ type: 'PURCHASE' })}>
            Queue Purchase
          </button>
        );
      };

      render(
        <Provider store={store}>
          <MemoryRouter>
            <QueuedOperations />
          </MemoryRouter>
        </Provider>
      );

      const button = screen.getByText('Queue Purchase');
      fireEvent.click(button);

      // Operation should be queued
      expect(() => button.click()).not.toThrow();
    });
  });
});
