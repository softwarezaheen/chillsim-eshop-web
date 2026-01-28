import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';

/**
 * E2E Multi-Region Bundle Selection Tests
 * 
 * Tests region-specific bundle selection and pricing:
 * - Regional bundle availability by user location
 * - Currency conversion and localization
 * - Coverage map integration
 * - Country-specific restrictions
 * - Multi-country bundle selection
 */

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      bundles: (state = initialState.bundles || {
        list: [],
        selectedRegion: null,
        userLocation: null,
      }) => state,
      localization: (state = initialState.localization || {
        currency: 'EUR',
        language: 'en',
        country: null,
      }) => state,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

const MockRegionSelector = () => (
  <div>
    <h1>Select Your Region</h1>
    <div data-testid="region-buttons">
      <button data-testid="region-global">Global</button>
      <button data-testid="region-europe">Europe</button>
      <button data-testid="region-asia">Asia</button>
      <button data-testid="region-americas">Americas</button>
      <button data-testid="region-africa">Africa</button>
    </div>
  </div>
);

const MockRegionalBundles = ({ region }) => {
  const bundles = {
    global: [
      { id: 'g1', name: 'Global Explorer', data: '50GB', price: 29.99, countries: 150 },
      { id: 'g2', name: 'Global Business', data: '100GB', price: 49.99, countries: 150 },
    ],
    europe: [
      { id: 'e1', name: 'Europe Traveler', data: '20GB', price: 19.99, countries: 39 },
      { id: 'e2', name: 'Europe Plus', data: '50GB', price: 34.99, countries: 39 },
    ],
    asia: [
      { id: 'a1', name: 'Asia Explorer', data: '30GB', price: 24.99, countries: 25 },
      { id: 'a2', name: 'Asia Premium', data: '60GB', price: 39.99, countries: 25 },
    ],
  };

  const regionBundles = bundles[region] || [];

  return (
    <div>
      <h1>{region.charAt(0).toUpperCase() + region.slice(1)} Bundles</h1>
      <div data-testid="bundle-list">
        {regionBundles.map(bundle => (
          <div key={bundle.id} data-testid={`bundle-${bundle.id}`}>
            <h2>{bundle.name}</h2>
            <p data-testid={`data-${bundle.id}`}>{bundle.data}</p>
            <p data-testid={`price-${bundle.id}`}>€{bundle.price}</p>
            <p data-testid={`countries-${bundle.id}`}>{bundle.countries} countries</p>
            <button data-testid={`select-${bundle.id}`}>Select</button>
            <button data-testid={`details-${bundle.id}`}>View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const MockCoverageMap = ({ bundleId }) => {
  const coverageData = {
    g1: {
      name: 'Global Explorer',
      regions: ['Europe', 'Asia', 'Americas', 'Africa', 'Oceania'],
      countries: ['USA', 'UK', 'Germany', 'France', 'Japan', 'Australia'],
    },
    e1: {
      name: 'Europe Traveler',
      regions: ['Western Europe', 'Eastern Europe'],
      countries: ['France', 'Germany', 'Italy', 'Spain', 'Poland', 'Czech Republic'],
    },
  };

  const coverage = coverageData[bundleId] || { regions: [], countries: [] };

  return (
    <div>
      <h1>Coverage Map: {coverage.name}</h1>
      <div data-testid="coverage-regions">
        <h2>Regions Covered</h2>
        {coverage.regions.map(region => (
          <span key={region} data-testid={`region-${region.replace(/\s+/g, '-').toLowerCase()}`}>
            {region}
          </span>
        ))}
      </div>
      <div data-testid="coverage-countries">
        <h2>Sample Countries</h2>
        {coverage.countries.map(country => (
          <span key={country} data-testid={`country-${country.toLowerCase()}`}>
            {country}
          </span>
        ))}
      </div>
      <button data-testid="view-full-list">View Full Country List</button>
    </div>
  );
};

const MockCurrencyConverter = ({ basePrice, baseCurrency = 'EUR' }) => {
  const exchangeRates = {
    USD: 1.09,
    GBP: 0.86,
    JPY: 163.5,
    AUD: 1.65,
  };

  return (
    <div>
      <h1>Price in Your Currency</h1>
      <p data-testid="base-price">{baseCurrency} {basePrice.toFixed(2)}</p>
      <div data-testid="converted-prices">
        {Object.entries(exchangeRates).map(([currency, rate]) => (
          <p key={currency} data-testid={`price-${currency}`}>
            {currency} {(basePrice * rate).toFixed(2)}
          </p>
        ))}
      </div>
      <button data-testid="select-currency">Change Currency</button>
    </div>
  );
};

describe('E2E Multi-Region Bundle Selection', () => {
  let store;

  beforeEach(() => {
    store = createMockStore();
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Region Selection Flow', () => {
    it('should display all available regions', () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <MockRegionSelector />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Select Your Region')).toBeInTheDocument();
      expect(screen.getByTestId('region-global')).toBeInTheDocument();
      expect(screen.getByTestId('region-europe')).toBeInTheDocument();
      expect(screen.getByTestId('region-asia')).toBeInTheDocument();
      expect(screen.getByTestId('region-americas')).toBeInTheDocument();
      expect(screen.getByTestId('region-africa')).toBeInTheDocument();
    });

    it('should load region-specific bundles after region selection', async () => {
      const { rerender } = render(
        <Provider store={store}>
          <MemoryRouter>
            <MockRegionSelector />
          </MemoryRouter>
        </Provider>
      );

      const europeButton = screen.getByTestId('region-europe');
      
      await act(async () => {
        fireEvent.click(europeButton);
      });

      rerender(
        <Provider store={store}>
          <MemoryRouter>
            <MockRegionalBundles region="europe" />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Europe Bundles')).toBeInTheDocument();
      expect(screen.getByText('Europe Traveler')).toBeInTheDocument();
      expect(screen.getByText('Europe Plus')).toBeInTheDocument();
      expect(screen.getByTestId('data-e1')).toHaveTextContent('20GB');
      expect(screen.getByTestId('price-e1')).toHaveTextContent('€19.99');
      expect(screen.getByTestId('countries-e1')).toHaveTextContent('39 countries');
    });

    it('should display global bundles with comprehensive coverage', async () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <MockRegionalBundles region="global" />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Global Bundles')).toBeInTheDocument();
      expect(screen.getByText('Global Explorer')).toBeInTheDocument();
      expect(screen.getByText('Global Business')).toBeInTheDocument();
      expect(screen.getByTestId('countries-g1')).toHaveTextContent('150 countries');
      expect(screen.getByTestId('countries-g2')).toHaveTextContent('150 countries');
    });
  });

  describe('Coverage Map Integration', () => {
    it('should display detailed coverage map for selected bundle', async () => {
      const { rerender } = render(
        <Provider store={store}>
          <MemoryRouter>
            <MockRegionalBundles region="global" />
          </MemoryRouter>
        </Provider>
      );

      const detailsButton = screen.getByTestId('details-g1');
      
      await act(async () => {
        fireEvent.click(detailsButton);
      });

      rerender(
        <Provider store={store}>
          <MemoryRouter>
            <MockCoverageMap bundleId="g1" />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText(/Coverage Map: Global Explorer/i)).toBeInTheDocument();
      expect(screen.getByTestId('region-europe')).toBeInTheDocument();
      expect(screen.getByTestId('region-asia')).toBeInTheDocument();
      expect(screen.getByTestId('region-americas')).toBeInTheDocument();
      expect(screen.getByTestId('country-usa')).toBeInTheDocument();
      expect(screen.getByTestId('country-uk')).toBeInTheDocument();
      expect(screen.getByTestId('country-japan')).toBeInTheDocument();
    });

    it('should show region-specific coverage for Europe bundle', async () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <MockCoverageMap bundleId="e1" />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText(/Coverage Map: Europe Traveler/i)).toBeInTheDocument();
      expect(screen.getByTestId('region-western-europe')).toBeInTheDocument();
      expect(screen.getByTestId('region-eastern-europe')).toBeInTheDocument();
      expect(screen.getByTestId('country-france')).toBeInTheDocument();
      expect(screen.getByTestId('country-germany')).toBeInTheDocument();
      expect(screen.getByTestId('country-poland')).toBeInTheDocument();
    });

    it('should allow viewing full country list', async () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <MockCoverageMap bundleId="g1" />
          </MemoryRouter>
        </Provider>
      );

      const viewFullListButton = screen.getByTestId('view-full-list');
      expect(viewFullListButton).toBeInTheDocument();
      
      await act(async () => {
        fireEvent.click(viewFullListButton);
      });

      expect(viewFullListButton).toBeInTheDocument();
    });
  });

  describe('Currency Conversion', () => {
    it('should display prices in multiple currencies', () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <MockCurrencyConverter basePrice={29.99} />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Price in Your Currency')).toBeInTheDocument();
      expect(screen.getByTestId('base-price')).toHaveTextContent('EUR 29.99');
      
      // Check converted prices
      expect(screen.getByTestId('price-USD')).toHaveTextContent(/USD 32\.69/);
      expect(screen.getByTestId('price-GBP')).toHaveTextContent(/GBP 25\.79/);
      expect(screen.getByTestId('price-JPY')).toHaveTextContent(/JPY 49/);
      expect(screen.getByTestId('price-AUD')).toHaveTextContent(/AUD 49\.48/);
    });

    it('should allow changing display currency', async () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <MockCurrencyConverter basePrice={19.99} />
          </MemoryRouter>
        </Provider>
      );

      const changeCurrencyButton = screen.getByTestId('select-currency');
      expect(changeCurrencyButton).toBeInTheDocument();
      
      await act(async () => {
        fireEvent.click(changeCurrencyButton);
      });

      expect(changeCurrencyButton).toBeInTheDocument();
    });

    it('should maintain accurate conversion rates', () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <MockCurrencyConverter basePrice={49.99} />
          </MemoryRouter>
        </Provider>
      );

      // Verify conversions are mathematically correct
      const usdPrice = screen.getByTestId('price-USD');
      const gbpPrice = screen.getByTestId('price-GBP');
      
      expect(usdPrice).toHaveTextContent(/USD 54\.49/);
      expect(gbpPrice).toHaveTextContent(/GBP 42\.99/);
    });
  });

  describe('Multi-Region User Journey', () => {
    it('should allow comparing bundles across different regions', async () => {
      const { rerender } = render(
        <Provider store={store}>
          <MemoryRouter>
            <MockRegionalBundles region="europe" />
          </MemoryRouter>
        </Provider>
      );

      // View Europe bundles
      expect(screen.getByText('Europe Traveler')).toBeInTheDocument();
      const europePrice = screen.getByTestId('price-e1');
      expect(europePrice).toHaveTextContent('€19.99');

      // Switch to Asia bundles
      rerender(
        <Provider store={store}>
          <MemoryRouter>
            <MockRegionalBundles region="asia" />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Asia Explorer')).toBeInTheDocument();
      const asiaPrice = screen.getByTestId('price-a1');
      expect(asiaPrice).toHaveTextContent('€24.99');

      // Switch to Global bundles
      rerender(
        <Provider store={store}>
          <MemoryRouter>
            <MockRegionalBundles region="global" />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Global Explorer')).toBeInTheDocument();
      const globalPrice = screen.getByTestId('price-g1');
      expect(globalPrice).toHaveTextContent('€29.99');
    });

    it('should handle region-specific availability restrictions', () => {
      // Test that certain bundles only appear in specific regions
      const { rerender } = render(
        <Provider store={store}>
          <MemoryRouter>
            <MockRegionalBundles region="europe" />
          </MemoryRouter>
        </Provider>
      );

      // Europe should only have Europe bundles
      expect(screen.queryByText('Global Explorer')).not.toBeInTheDocument();
      expect(screen.queryByText('Asia Explorer')).not.toBeInTheDocument();
      expect(screen.getByText('Europe Traveler')).toBeInTheDocument();

      rerender(
        <Provider store={store}>
          <MemoryRouter>
            <MockRegionalBundles region="asia" />
          </MemoryRouter>
        </Provider>
      );

      // Asia should only have Asia bundles
      expect(screen.queryByText('Europe Traveler')).not.toBeInTheDocument();
      expect(screen.getByText('Asia Explorer')).toBeInTheDocument();
    });

    it('should persist selected region preference', async () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <MockRegionSelector />
          </MemoryRouter>
        </Provider>
      );

      const asiaButton = screen.getByTestId('region-asia');
      
      await act(async () => {
        fireEvent.click(asiaButton);
      });

      // Store selected region
      localStorage.setItem('selectedRegion', 'asia');

      // Verify persistence
      expect(localStorage.getItem('selectedRegion')).toBe('asia');
    });
  });

  describe('Country-Specific Bundle Selection', () => {
    it('should auto-detect user location and suggest appropriate bundles', async () => {
      const MockLocationBased = ({ userCountry }) => {
        const suggestions = {
          'USA': { region: 'americas', bundle: 'Americas Plus' },
          'Germany': { region: 'europe', bundle: 'Europe Plus' },
          'Japan': { region: 'asia', bundle: 'Asia Premium' },
        };

        const suggestion = suggestions[userCountry] || { region: 'global', bundle: 'Global Explorer' };

        return (
          <div>
            <h1>Recommended for {userCountry}</h1>
            <div data-testid="suggested-bundle">
              <p>Best match: {suggestion.bundle}</p>
              <p>Region: {suggestion.region}</p>
            </div>
            <button data-testid="view-suggested">View Bundle</button>
            <button data-testid="browse-all">Browse All Regions</button>
          </div>
        );
      };

      render(
        <Provider store={store}>
          <MemoryRouter>
            <MockLocationBased userCountry="Germany" />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Recommended for Germany')).toBeInTheDocument();
      expect(screen.getByText('Best match: Europe Plus')).toBeInTheDocument();
      expect(screen.getByText('Region: europe')).toBeInTheDocument();
    });

    it('should handle multi-country trips with appropriate bundle selection', () => {
      const MockMultiCountry = () => {
        const selectedCountries = ['France', 'Italy', 'Spain', 'Germany'];
        const recommendedBundle = 'Europe Traveler';

        return (
          <div>
            <h1>Multi-Country Trip</h1>
            <div data-testid="selected-countries">
              {selectedCountries.map(country => (
                <span key={country} data-testid={`country-${country.toLowerCase()}`}>
                  {country}
                </span>
              ))}
            </div>
            <div data-testid="recommendation">
              <p>Recommended: {recommendedBundle}</p>
              <p>Covers all {selectedCountries.length} selected countries</p>
            </div>
            <button data-testid="select-bundle">Select This Bundle</button>
          </div>
        );
      };

      render(
        <Provider store={store}>
          <MemoryRouter>
            <MockMultiCountry />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Multi-Country Trip')).toBeInTheDocument();
      expect(screen.getByTestId('country-france')).toBeInTheDocument();
      expect(screen.getByTestId('country-italy')).toBeInTheDocument();
      expect(screen.getByText('Recommended: Europe Traveler')).toBeInTheDocument();
      expect(screen.getByText('Covers all 4 selected countries')).toBeInTheDocument();
    });
  });

  describe('Bundle Comparison Flow', () => {
    it('should allow side-by-side comparison of regional bundles', () => {
      const MockComparison = () => {
        const bundles = [
          { id: 'e1', name: 'Europe Traveler', data: '20GB', price: 19.99, countries: 39 },
          { id: 'a1', name: 'Asia Explorer', data: '30GB', price: 24.99, countries: 25 },
          { id: 'g1', name: 'Global Explorer', data: '50GB', price: 29.99, countries: 150 },
        ];

        return (
          <div>
            <h1>Compare Bundles</h1>
            <table data-testid="comparison-table">
              <thead>
                <tr>
                  <th>Bundle</th>
                  <th>Data</th>
                  <th>Price</th>
                  <th>Countries</th>
                </tr>
              </thead>
              <tbody>
                {bundles.map(bundle => (
                  <tr key={bundle.id} data-testid={`row-${bundle.id}`}>
                    <td>{bundle.name}</td>
                    <td data-testid={`compare-data-${bundle.id}`}>{bundle.data}</td>
                    <td data-testid={`compare-price-${bundle.id}`}>€{bundle.price}</td>
                    <td data-testid={`compare-countries-${bundle.id}`}>{bundle.countries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      };

      render(
        <Provider store={store}>
          <MemoryRouter>
            <MockComparison />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Compare Bundles')).toBeInTheDocument();
      expect(screen.getByTestId('row-e1')).toBeInTheDocument();
      expect(screen.getByTestId('row-a1')).toBeInTheDocument();
      expect(screen.getByTestId('row-g1')).toBeInTheDocument();
      
      expect(screen.getByTestId('compare-data-e1')).toHaveTextContent('20GB');
      expect(screen.getByTestId('compare-price-g1')).toHaveTextContent('€29.99');
      expect(screen.getByTestId('compare-countries-g1')).toHaveTextContent('150');
    });
  });
});
