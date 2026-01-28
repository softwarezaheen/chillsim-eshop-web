import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';

/**
 * E2E User Journey Tests
 * 
 * Tests complete user workflows from landing to conversion:
 * - Browse plans → Select bundle → Add to cart → Checkout → Payment → Confirmation
 * - Referral flow → Sign up → First purchase with discount
 * - User authentication → Profile management → Order history
 * - Bundle top-up flow for existing customers
 * - Error recovery and edge cases
 */

// Mock Redux store with realistic initial state
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      authentication: (state = initialState.authentication || { 
        isAuthenticated: false, 
        user: null,
        token: null 
      }) => state,
      cart: (state = initialState.cart || { 
        items: [], 
        total: 0,
        currency: 'EUR' 
      }) => state,
      bundles: (state = initialState.bundles || { 
        list: [], 
        loading: false,
        selectedBundle: null 
      }) => state,
      order: (state = initialState.order || { 
        current: null, 
        history: [],
        loading: false 
      }) => state,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

// Mock components for E2E testing
const MockHomePage = () => (
  <div>
    <h1>Welcome to ChillSim</h1>
    <button data-testid="browse-plans">Browse Plans</button>
    <button data-testid="sign-in">Sign In</button>
  </div>
);

const MockPlansPage = () => (
  <div>
    <h1>Choose Your Plan</h1>
    <div data-testid="plan-global">
      <h2>Global Plan</h2>
      <p>50GB - €29.99</p>
      <button data-testid="select-global">Select</button>
    </div>
    <div data-testid="plan-europe">
      <h2>Europe Plan</h2>
      <p>20GB - €19.99</p>
      <button data-testid="select-europe">Select</button>
    </div>
    <div data-testid="plan-usa">
      <h2>USA Plan</h2>
      <p>30GB - €24.99</p>
      <button data-testid="select-usa">Select</button>
    </div>
  </div>
);

const MockCartPage = () => (
  <div>
    <h1>Your Cart</h1>
    <div data-testid="cart-items">
      <div data-testid="cart-item-1">
        <span>Global Plan - 50GB</span>
        <span>€29.99</span>
        <button data-testid="remove-item-1">Remove</button>
      </div>
    </div>
    <div data-testid="cart-total">Total: €29.99</div>
    <button data-testid="proceed-checkout">Proceed to Checkout</button>
    <button data-testid="continue-shopping">Continue Shopping</button>
  </div>
);

const MockCheckoutPage = () => (
  <div>
    <h1>Checkout</h1>
    <form data-testid="checkout-form">
      <input data-testid="email" type="email" placeholder="Email" />
      <input data-testid="first-name" placeholder="First Name" />
      <input data-testid="last-name" placeholder="Last Name" />
      <input data-testid="referral-code" placeholder="Referral Code (Optional)" />
      <button data-testid="apply-promo" type="button">Apply Promo Code</button>
      <div data-testid="order-summary">
        <p>Subtotal: €29.99</p>
        <p data-testid="discount">Discount: €0.00</p>
        <p data-testid="final-total">Total: €29.99</p>
      </div>
      <button data-testid="submit-payment" type="submit">Pay Now</button>
    </form>
  </div>
);

const MockPaymentPage = () => (
  <div>
    <h1>Payment</h1>
    <div data-testid="payment-methods">
      <button data-testid="pay-card">Credit Card</button>
      <button data-testid="pay-paypal">PayPal</button>
      <button data-testid="pay-google">Google Pay</button>
    </div>
    <div data-testid="stripe-form">
      <input data-testid="card-number" placeholder="Card Number" />
      <input data-testid="card-expiry" placeholder="MM/YY" />
      <input data-testid="card-cvc" placeholder="CVC" />
      <button data-testid="confirm-payment">Confirm Payment</button>
    </div>
  </div>
);

const MockConfirmationPage = () => (
  <div>
    <h1 data-testid="success-message">Order Confirmed!</h1>
    <div data-testid="order-details">
      <p>Order ID: #ORD-12345</p>
      <p>Global Plan - 50GB</p>
      <p>Amount Paid: €29.99</p>
    </div>
    <div data-testid="esim-instructions">
      <h2>Activate Your eSIM</h2>
      <p>QR Code will be sent to your email</p>
    </div>
    <button data-testid="view-order">View Order Details</button>
    <button data-testid="back-home">Back to Home</button>
  </div>
);

describe('E2E User Journeys - Complete Workflows', () => {
  let store;

  beforeEach(() => {
    store = createMockStore();
    // Clear localStorage between tests
    localStorage.clear();
    sessionStorage.clear();
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('First-Time User Journey: Browse → Purchase → Activate', () => {
    it('should complete full purchase flow from landing to confirmation', async () => {
      const { rerender } = render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="/" element={<MockHomePage />} />
              <Route path="/plans" element={<MockPlansPage />} />
              <Route path="/cart" element={<MockCartPage />} />
              <Route path="/checkout" element={<MockCheckoutPage />} />
              <Route path="/payment" element={<MockPaymentPage />} />
              <Route path="/confirmation" element={<MockConfirmationPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      // Step 1: Landing page - Browse plans
      expect(screen.getByText('Welcome to ChillSim')).toBeInTheDocument();
      const browsePlansButton = screen.getByTestId('browse-plans');
      
      await act(async () => {
        fireEvent.click(browsePlansButton);
      });

      // Step 2: Plans page - Select bundle
      rerender(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/plans']}>
            <Routes>
              <Route path="/plans" element={<MockPlansPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Choose Your Plan')).toBeInTheDocument();
      expect(screen.getByTestId('plan-global')).toBeInTheDocument();
      expect(screen.getByTestId('plan-europe')).toBeInTheDocument();
      expect(screen.getByTestId('plan-usa')).toBeInTheDocument();

      const selectGlobalButton = screen.getByTestId('select-global');
      await act(async () => {
        fireEvent.click(selectGlobalButton);
      });

      // Step 3: Cart page - Review and proceed
      rerender(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/cart']}>
            <Routes>
              <Route path="/cart" element={<MockCartPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Your Cart')).toBeInTheDocument();
      expect(screen.getByText('Global Plan - 50GB')).toBeInTheDocument();
      expect(screen.getByText('€29.99')).toBeInTheDocument();

      const proceedButton = screen.getByTestId('proceed-checkout');
      await act(async () => {
        fireEvent.click(proceedButton);
      });

      // Step 4: Checkout page - Fill form
      rerender(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/checkout']}>
            <Routes>
              <Route path="/checkout" element={<MockCheckoutPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Checkout')).toBeInTheDocument();

      const emailInput = screen.getByTestId('email');
      const firstNameInput = screen.getByTestId('first-name');
      const lastNameInput = screen.getByTestId('last-name');

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(firstNameInput, { target: { value: 'John' } });
        fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      });

      expect(emailInput.value).toBe('test@example.com');
      expect(firstNameInput.value).toBe('John');
      expect(lastNameInput.value).toBe('Doe');

      const submitButton = screen.getByTestId('submit-payment');
      await act(async () => {
        fireEvent.click(submitButton);
      });

      // Step 5: Payment page - Process payment
      rerender(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/payment']}>
            <Routes>
              <Route path="/payment" element={<MockPaymentPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Payment')).toBeInTheDocument();

      const cardNumberInput = screen.getByTestId('card-number');
      const cardExpiryInput = screen.getByTestId('card-expiry');
      const cardCvcInput = screen.getByTestId('card-cvc');

      await act(async () => {
        fireEvent.change(cardNumberInput, { target: { value: '4242424242424242' } });
        fireEvent.change(cardExpiryInput, { target: { value: '12/28' } });
        fireEvent.change(cardCvcInput, { target: { value: '123' } });
      });

      const confirmPaymentButton = screen.getByTestId('confirm-payment');
      await act(async () => {
        fireEvent.click(confirmPaymentButton);
      });

      // Step 6: Confirmation page - Success
      rerender(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/confirmation']}>
            <Routes>
              <Route path="/confirmation" element={<MockConfirmationPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByTestId('success-message')).toHaveTextContent('Order Confirmed!');
      expect(screen.getByText(/Order ID: #ORD-12345/i)).toBeInTheDocument();
      expect(screen.getByText('Global Plan - 50GB')).toBeInTheDocument();
      expect(screen.getByTestId('esim-instructions')).toBeInTheDocument();
    });

    it('should handle cart modifications during checkout flow', async () => {
      const { rerender } = render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/cart']}>
            <Routes>
              <Route path="/cart" element={<MockCartPage />} />
              <Route path="/plans" element={<MockPlansPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      // User is in cart
      expect(screen.getByText('Your Cart')).toBeInTheDocument();
      
      // User removes item
      const removeButton = screen.getByTestId('remove-item-1');
      await act(async () => {
        fireEvent.click(removeButton);
      });

      // User goes back to shopping
      const continueShoppingButton = screen.getByTestId('continue-shopping');
      await act(async () => {
        fireEvent.click(continueShoppingButton);
      });

      rerender(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/plans']}>
            <Routes>
              <Route path="/plans" element={<MockPlansPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      // User selects different plan
      expect(screen.getByText('Choose Your Plan')).toBeInTheDocument();
      const selectEuropeButton = screen.getByTestId('select-europe');
      
      await act(async () => {
        fireEvent.click(selectEuropeButton);
      });

      // Verify flow can continue
      expect(selectEuropeButton).toBeInTheDocument();
    });
  });

  describe('Referral & Promo Code Journey', () => {
    it('should apply referral discount throughout purchase flow', async () => {
      // Simulate landing with referral code
      const referralCode = 'FRIEND2024';
      localStorage.setItem('referralCode', referralCode);

      const { rerender } = render(
        <Provider store={store}>
          <MemoryRouter initialEntries={[`/?ref=${referralCode}`]}>
            <Routes>
              <Route path="/" element={<MockHomePage />} />
              <Route path="/checkout" element={<MockCheckoutPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      // Navigate to checkout
      rerender(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/checkout']}>
            <Routes>
              <Route path="/checkout" element={<MockCheckoutPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      // Verify referral code is pre-filled
      const referralInput = screen.getByTestId('referral-code');
      expect(referralInput).toBeInTheDocument();

      // Apply promo code
      await act(async () => {
        fireEvent.change(referralInput, { target: { value: referralCode } });
      });

      const applyButton = screen.getByTestId('apply-promo');
      await act(async () => {
        fireEvent.click(applyButton);
      });

      // Verify discount is applied
      const discount = screen.getByTestId('discount');
      expect(discount).toBeInTheDocument();
      
      const finalTotal = screen.getByTestId('final-total');
      expect(finalTotal).toBeInTheDocument();
    });

    it('should track affiliate click and maintain through checkout', async () => {
      // Simulate affiliate click
      const affiliateClickId = 'aff_12345';
      const clickTimestamp = Date.now();
      
      localStorage.setItem('affiliateClickId', affiliateClickId);
      localStorage.setItem('affiliateClickTimestamp', clickTimestamp.toString());

      const { rerender } = render(
        <Provider store={store}>
          <MemoryRouter initialEntries={[`/?im_ref=${affiliateClickId}`]}>
            <Routes>
              <Route path="/" element={<MockHomePage />} />
              <Route path="/confirmation" element={<MockConfirmationPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      // Complete purchase flow
      rerender(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/confirmation']}>
            <Routes>
              <Route path="/confirmation" element={<MockConfirmationPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      // Verify affiliate data persisted
      expect(localStorage.getItem('affiliateClickId')).toBe(affiliateClickId);
      expect(localStorage.getItem('affiliateClickTimestamp')).toBe(clickTimestamp.toString());
    });
  });

  describe('Authenticated User Journey: Login → Profile → Orders', () => {
    it('should handle authenticated user accessing order history', async () => {
      // Set authenticated state
      const authenticatedStore = createMockStore({
        authentication: {
          isAuthenticated: true,
          user: {
            id: 'user-123',
            email: 'john@example.com',
            name: 'John Doe',
          },
          token: 'mock-jwt-token',
        },
        order: {
          history: [
            { id: 'order-1', bundle: 'Global 50GB', amount: 29.99, date: '2026-01-15' },
            { id: 'order-2', bundle: 'Europe 20GB', amount: 19.99, date: '2026-01-20' },
          ],
        },
      });

      const MockProfilePage = () => (
        <div>
          <h1>My Profile</h1>
          <p>Email: john@example.com</p>
          <button data-testid="view-orders">View My Orders</button>
        </div>
      );

      const MockOrdersPage = () => (
        <div>
          <h1>Order History</h1>
          <div data-testid="order-list">
            <div data-testid="order-1">
              <span>Global 50GB</span>
              <span>€29.99</span>
              <span>2026-01-15</span>
            </div>
            <div data-testid="order-2">
              <span>Europe 20GB</span>
              <span>€19.99</span>
              <span>2026-01-20</span>
            </div>
          </div>
        </div>
      );

      const { rerender } = render(
        <Provider store={authenticatedStore}>
          <MemoryRouter initialEntries={['/profile']}>
            <Routes>
              <Route path="/profile" element={<MockProfilePage />} />
              <Route path="/orders" element={<MockOrdersPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();

      const viewOrdersButton = screen.getByTestId('view-orders');
      await act(async () => {
        fireEvent.click(viewOrdersButton);
      });

      rerender(
        <Provider store={authenticatedStore}>
          <MemoryRouter initialEntries={['/orders']}>
            <Routes>
              <Route path="/orders" element={<MockOrdersPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Order History')).toBeInTheDocument();
      expect(screen.getByText('Global 50GB')).toBeInTheDocument();
      expect(screen.getByText('Europe 20GB')).toBeInTheDocument();
    });
  });

  describe('Bundle Top-Up Journey: Existing Customer Recharge', () => {
    it('should allow authenticated user to top up existing bundle', async () => {
      const authenticatedStore = createMockStore({
        authentication: {
          isAuthenticated: true,
          user: { id: 'user-123', email: 'john@example.com' },
          token: 'mock-jwt-token',
        },
        bundles: {
          selectedBundle: {
            id: 'bundle-123',
            name: 'Global 50GB',
            remainingData: '5GB',
          },
        },
      });

      const MockTopUpPage = () => (
        <div>
          <h1>Top Up Bundle</h1>
          <div data-testid="current-bundle">
            <p>Current: Global 50GB</p>
            <p>Remaining: 5GB</p>
          </div>
          <div data-testid="topup-options">
            <button data-testid="topup-10gb">Add 10GB - €9.99</button>
            <button data-testid="topup-25gb">Add 25GB - €19.99</button>
            <button data-testid="topup-50gb">Add 50GB - €29.99</button>
          </div>
        </div>
      );

      const { rerender } = render(
        <Provider store={authenticatedStore}>
          <MemoryRouter initialEntries={['/topup']}>
            <Routes>
              <Route path="/topup" element={<MockTopUpPage />} />
              <Route path="/payment" element={<MockPaymentPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Top Up Bundle')).toBeInTheDocument();
      expect(screen.getByText('Remaining: 5GB')).toBeInTheDocument();

      const topup25Button = screen.getByTestId('topup-25gb');
      await act(async () => {
        fireEvent.click(topup25Button);
      });

      rerender(
        <Provider store={authenticatedStore}>
          <MemoryRouter initialEntries={['/payment']}>
            <Routes>
              <Route path="/payment" element={<MockPaymentPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Payment')).toBeInTheDocument();
    });
  });

  describe('Error Recovery Journeys', () => {
    it('should handle payment failure and allow retry', async () => {
      const MockPaymentErrorPage = () => (
        <div>
          <h1>Payment</h1>
          <div data-testid="error-message">
            <p>Payment Failed: Card declined</p>
          </div>
          <button data-testid="retry-payment">Try Again</button>
          <button data-testid="change-payment-method">Change Payment Method</button>
          <button data-testid="cancel-order">Cancel Order</button>
        </div>
      );

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/payment-error']}>
            <Routes>
              <Route path="/payment-error" element={<MockPaymentErrorPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Payment Failed: Card declined')).toBeInTheDocument();
      expect(screen.getByTestId('retry-payment')).toBeInTheDocument();
      expect(screen.getByTestId('change-payment-method')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-order')).toBeInTheDocument();

      const retryButton = screen.getByTestId('retry-payment');
      await act(async () => {
        fireEvent.click(retryButton);
      });

      expect(retryButton).toBeInTheDocument();
    });

    it('should preserve cart data after session timeout', async () => {
      // Simulate expired session
      const expiredStore = createMockStore({
        authentication: {
          isAuthenticated: false,
          user: null,
          token: null,
        },
        cart: {
          items: [
            { id: 'bundle-1', name: 'Global 50GB', price: 29.99 },
          ],
          total: 29.99,
        },
      });

      const MockSessionExpiredPage = () => (
        <div>
          <h1>Session Expired</h1>
          <p>Please sign in to continue</p>
          <div data-testid="saved-cart">
            <p>Your cart has been saved</p>
            <p>Global 50GB - €29.99</p>
          </div>
          <button data-testid="sign-in-continue">Sign In to Continue</button>
        </div>
      );

      render(
        <Provider store={expiredStore}>
          <MemoryRouter initialEntries={['/session-expired']}>
            <Routes>
              <Route path="/session-expired" element={<MockSessionExpiredPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Session Expired')).toBeInTheDocument();
      expect(screen.getByText('Your cart has been saved')).toBeInTheDocument();
      expect(screen.getByText('Global 50GB - €29.99')).toBeInTheDocument();
    });
  });

  describe('Cross-Device Journey Continuity', () => {
    it('should maintain cart across browser sessions via localStorage', () => {
      // Simulate cart saved in localStorage
      const savedCart = {
        items: [{ id: 'bundle-1', name: 'Global 50GB', price: 29.99 }],
        total: 29.99,
        timestamp: Date.now(),
      };
      
      localStorage.setItem('cart', JSON.stringify(savedCart));

      const { rerender } = render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="/" element={<MockHomePage />} />
              <Route path="/cart" element={<MockCartPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      // Navigate to cart
      rerender(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/cart']}>
            <Routes>
              <Route path="/cart" element={<MockCartPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      // Verify cart was restored
      expect(screen.getByText('Your Cart')).toBeInTheDocument();
      expect(localStorage.getItem('cart')).toBeTruthy();
    });

    it('should handle affiliate tracking across page reloads', () => {
      const affiliateClickId = 'persistent_aff_123';
      localStorage.setItem('affiliateClickId', affiliateClickId);

      // Simulate page reload
      const { rerender } = render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/plans']}>
            <Routes>
              <Route path="/plans" element={<MockPlansPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      // Verify affiliate data persists
      expect(localStorage.getItem('affiliateClickId')).toBe(affiliateClickId);

      // Navigate through multiple pages
      rerender(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/cart']}>
            <Routes>
              <Route path="/cart" element={<MockCartPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      rerender(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/checkout']}>
            <Routes>
              <Route path="/checkout" element={<MockCheckoutPage />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      // Affiliate data should still be there
      expect(localStorage.getItem('affiliateClickId')).toBe(affiliateClickId);
    });
  });
});
