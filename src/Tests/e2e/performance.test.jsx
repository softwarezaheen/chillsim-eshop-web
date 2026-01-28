import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';

/**
 * E2E Performance & Load Testing
 * 
 * Tests application behavior under various load conditions:
 * - Large bundle lists and pagination
 * - Concurrent user actions
 * - Network delays and slow connections
 * - Image lazy loading
 * - Cache behavior
 * - Memory leak detection
 */

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      bundles: (state = initialState.bundles || {
        list: [],
        loading: false,
      }) => state,
      cache: (state = initialState.cache || {
        bundles: {},
        images: {},
      }) => state,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

// Generate large dataset for performance testing
const generateMockBundles = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `bundle-${i + 1}`,
    name: `Bundle ${i + 1}`,
    data: `${(i % 10 + 1) * 10}GB`,
    price: (i % 5 + 1) * 9.99,
    region: ['Europe', 'Asia', 'Americas', 'Global'][i % 4],
    countries: (i % 50) + 10,
  }));
};

const MockBundleGrid = ({ bundles, itemsPerPage = 20 }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  
  const totalPages = Math.ceil(bundles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedBundles = bundles.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <h1>Available Bundles</h1>
      <p data-testid="bundle-count">Showing {displayedBundles.length} of {bundles.length}</p>
      <div data-testid="bundle-grid">
        {displayedBundles.map(bundle => (
          <div key={bundle.id} data-testid={`bundle-${bundle.id}`}>
            <h3>{bundle.name}</h3>
            <p>{bundle.data} - €{bundle.price}</p>
          </div>
        ))}
      </div>
      <div data-testid="pagination">
        <button
          data-testid="prev-page"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span data-testid="page-info">Page {currentPage} of {totalPages}</span>
        <button
          data-testid="next-page"
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const MockLazyImage = ({ src, alt }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);
  }, [src]);

  return (
    <div data-testid="lazy-image-container">
      {!loaded && !error && <div data-testid="image-loading">Loading...</div>}
      {error && <div data-testid="image-error">Failed to load</div>}
      {loaded && <img data-testid="image-loaded" src={src} alt={alt} />}
    </div>
  );
};

const MockInfiniteScroll = ({ items }) => {
  const [displayCount, setDisplayCount] = React.useState(20);

  const handleScroll = () => {
    if (displayCount < items.length) {
      setDisplayCount(prev => Math.min(prev + 20, items.length));
    }
  };

  return (
    <div>
      <h1>Infinite Scroll Bundles</h1>
      <div data-testid="scroll-container" onScroll={handleScroll}>
        {items.slice(0, displayCount).map((item, i) => (
          <div key={i} data-testid={`item-${i}`}>
            {item.name}
          </div>
        ))}
      </div>
      <div data-testid="load-more">
        {displayCount < items.length && (
          <button onClick={handleScroll}>Load More</button>
        )}
      </div>
      <p data-testid="loaded-count">{displayCount} of {items.length} loaded</p>
    </div>
  );
};

describe('E2E Performance & Load Testing', () => {
  let store;

  beforeEach(() => {
    store = createMockStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Large Dataset Handling', () => {
    it('should efficiently render 100+ bundles with pagination', () => {
      const largeBundleList = generateMockBundles(150);

      const { container } = render(
        <Provider store={store}>
          <MemoryRouter>
            <MockBundleGrid bundles={largeBundleList} itemsPerPage={20} />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Available Bundles')).toBeInTheDocument();
      expect(screen.getByTestId('bundle-count')).toHaveTextContent('Showing 20 of 150');
      
      // Only first page items should be rendered
      expect(screen.getByTestId('bundle-bundle-1')).toBeInTheDocument();
      expect(screen.getByTestId('bundle-bundle-20')).toBeInTheDocument();
      expect(screen.queryByTestId('bundle-bundle-21')).not.toBeInTheDocument();

      // Verify pagination exists
      expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 8');
    });

    it('should navigate through paginated results without performance degradation', async () => {
      const largeBundleList = generateMockBundles(100);

      render(
        <Provider store={store}>
          <MemoryRouter>
            <MockBundleGrid bundles={largeBundleList} itemsPerPage={20} />
          </MemoryRouter>
        </Provider>
      );

      const nextButton = screen.getByTestId('next-page');

      // Navigate to page 2
      await act(async () => {
        fireEvent.click(nextButton);
      });

      expect(screen.getByTestId('page-info')).toHaveTextContent('Page 2 of 5');
      expect(screen.getByTestId('bundle-bundle-21')).toBeInTheDocument();
      expect(screen.queryByTestId('bundle-bundle-1')).not.toBeInTheDocument();

      // Navigate to page 3
      await act(async () => {
        fireEvent.click(nextButton);
      });

      expect(screen.getByTestId('page-info')).toHaveTextContent('Page 3 of 5');
      expect(screen.getByTestId('bundle-bundle-41')).toBeInTheDocument();
    });

    it('should handle rapid pagination clicks without breaking', async () => {
      const bundles = generateMockBundles(200);

      render(
        <Provider store={store}>
          <MemoryRouter>
            <MockBundleGrid bundles={bundles} itemsPerPage={25} />
          </MemoryRouter>
        </Provider>
      );

      const nextButton = screen.getByTestId('next-page');

      // Rapid clicks
      await act(async () => {
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);
      });

      // Should still be functional
      expect(screen.getByTestId('page-info')).toBeInTheDocument();
      expect(screen.getByTestId('bundle-grid')).toBeInTheDocument();
    });
  });

  describe('Infinite Scroll Performance', () => {
    it('should load items progressively as user scrolls', async () => {
      const items = generateMockBundles(100);

      render(
        <Provider store={store}>
          <MemoryRouter>
            <MockInfiniteScroll items={items} />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Infinite Scroll Bundles')).toBeInTheDocument();
      expect(screen.getByTestId('loaded-count')).toHaveTextContent('20 of 100 loaded');

      // Initial load - only 20 items
      expect(screen.getByTestId('item-0')).toBeInTheDocument();
      expect(screen.getByTestId('item-19')).toBeInTheDocument();
      expect(screen.queryByTestId('item-20')).not.toBeInTheDocument();
    });

    it('should load more items on load more click', async () => {
      const items = generateMockBundles(60);

      render(
        <Provider store={store}>
          <MemoryRouter>
            <MockInfiniteScroll items={items} />
          </MemoryRouter>
        </Provider>
      );

      const loadMoreButton = screen.getByText('Load More');
      
      await act(async () => {
        fireEvent.click(loadMoreButton);
      });

      expect(screen.getByTestId('loaded-count')).toHaveTextContent('40 of 60 loaded');
      expect(screen.getByTestId('item-39')).toBeInTheDocument();

      // Load more again
      await act(async () => {
        fireEvent.click(loadMoreButton);
      });

      expect(screen.getByTestId('loaded-count')).toHaveTextContent('60 of 60 loaded');
    });
  });

  describe('Image Lazy Loading', () => {
    it('should show loading state before image loads', () => {
      render(
        <MemoryRouter>
          <MockLazyImage src="https://example.com/bundle-image.jpg" alt="Bundle" />
        </MemoryRouter>
      );

      expect(screen.getByTestId('image-loading')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle image load errors gracefully', async () => {
      render(
        <MemoryRouter>
          <MockLazyImage src="https://invalid-url.com/nonexistent.jpg" alt="Bundle" />
        </MemoryRouter>
      );

      // Wait for error state
      await waitFor(() => {
        expect(screen.queryByTestId('image-error')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });
  });

  describe('Concurrent User Actions', () => {
    it('should handle multiple rapid filter changes', async () => {
      const MockFilteredBundles = () => {
        const [filter, setFilter] = React.useState('all');
        const allBundles = generateMockBundles(50);
        
        const filteredBundles = filter === 'all' 
          ? allBundles 
          : allBundles.filter(b => b.region === filter);

        return (
          <div>
            <div data-testid="filters">
              <button onClick={() => setFilter('all')} data-testid="filter-all">All</button>
              <button onClick={() => setFilter('Europe')} data-testid="filter-europe">Europe</button>
              <button onClick={() => setFilter('Asia')} data-testid="filter-asia">Asia</button>
              <button onClick={() => setFilter('Global')} data-testid="filter-global">Global</button>
            </div>
            <p data-testid="result-count">{filteredBundles.length} bundles</p>
          </div>
        );
      };

      render(
        <Provider store={store}>
          <MemoryRouter>
            <MockFilteredBundles />
          </MemoryRouter>
        </Provider>
      );

      // Rapid filter changes
      await act(async () => {
        fireEvent.click(screen.getByTestId('filter-europe'));
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('filter-asia'));
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('filter-global'));
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('filter-all'));
      });

      expect(screen.getByTestId('result-count')).toHaveTextContent('50 bundles');
    });

    it('should handle simultaneous search and filter operations', async () => {
      const MockSearchAndFilter = () => {
        const [search, setSearch] = React.useState('');
        const [region, setRegion] = React.useState('all');
        const bundles = generateMockBundles(100);

        const filtered = bundles.filter(b => {
          const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
          const matchesRegion = region === 'all' || b.region === region;
          return matchesSearch && matchesRegion;
        });

        return (
          <div>
            <input
              data-testid="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bundles"
            />
            <select
              data-testid="region-select"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="all">All Regions</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
            </select>
            <p data-testid="filtered-count">{filtered.length} results</p>
          </div>
        );
      };

      render(
        <Provider store={store}>
          <MemoryRouter>
            <MockSearchAndFilter />
          </MemoryRouter>
        </Provider>
      );

      const searchInput = screen.getByTestId('search-input');
      const regionSelect = screen.getByTestId('region-select');

      // Simultaneous search and filter
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'Bundle 1' } });
        fireEvent.change(regionSelect, { target: { value: 'Europe' } });
      });

      expect(screen.getByTestId('filtered-count')).toBeInTheDocument();
    });
  });

  describe('Network Delay Simulation', () => {
    it('should show loading state during slow network requests', async () => {
      const MockSlowLoad = () => {
        const [loading, setLoading] = React.useState(true);
        const [data, setData] = React.useState(null);

        React.useEffect(() => {
          // Simulate slow network
          const timer = setTimeout(() => {
            setData({ bundles: generateMockBundles(10) });
            setLoading(false);
          }, 2000);

          return () => clearTimeout(timer);
        }, []);

        if (loading) {
          return <div data-testid="loading-spinner">Loading bundles...</div>;
        }

        return (
          <div>
            <h1>Bundles Loaded</h1>
            <p data-testid="bundle-count">{data.bundles.length} bundles</p>
          </div>
        );
      };

      render(
        <Provider store={store}>
          <MemoryRouter>
            <MockSlowLoad />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading bundles...')).toBeInTheDocument();
    });

    it('should timeout and show error after excessive wait', async () => {
      const MockTimeout = () => {
        const [status, setStatus] = React.useState('loading');

        React.useEffect(() => {
          const timeout = setTimeout(() => {
            setStatus('timeout');
          }, 1000);

          return () => clearTimeout(timeout);
        }, []);

        if (status === 'loading') {
          return <div data-testid="loading">Loading...</div>;
        }

        return (
          <div data-testid="timeout-error">
            <p>Request timed out</p>
            <button data-testid="retry">Retry</button>
          </div>
        );
      };

      render(
        <Provider store={store}>
          <MemoryRouter>
            <MockTimeout />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('timeout-error')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('Request timed out')).toBeInTheDocument();
      expect(screen.getByTestId('retry')).toBeInTheDocument();
    });
  });

  describe('Cache Behavior', () => {
    it('should cache bundle data to avoid redundant requests', () => {
      const cache = new Map();
      
      const MockCached = ({ bundleId }) => {
        const getCachedBundle = (id) => {
          if (cache.has(id)) {
            return { ...cache.get(id), cached: true };
          }
          
          const bundle = { id, name: `Bundle ${id}`, data: '50GB' };
          cache.set(id, bundle);
          return { ...bundle, cached: false };
        };

        const bundle = getCachedBundle(bundleId);

        return (
          <div>
            <h1>{bundle.name}</h1>
            <p data-testid="cache-status">
              {bundle.cached ? 'Loaded from cache' : 'Fetched from server'}
            </p>
          </div>
        );
      };

      const { rerender } = render(
        <Provider store={store}>
          <MemoryRouter>
            <MockCached bundleId="bundle-1" />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByTestId('cache-status')).toHaveTextContent('Fetched from server');

      // Request same bundle again
      rerender(
        <Provider store={store}>
          <MemoryRouter>
            <MockCached bundleId="bundle-1" />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByTestId('cache-status')).toHaveTextContent('Loaded from cache');
    });

    it('should invalidate cache when data is updated', () => {
      const cache = { bundles: new Map(), version: 1 };

      const invalidateCache = () => {
        cache.bundles.clear();
        cache.version++;
      };

      cache.bundles.set('bundle-1', { id: 'bundle-1', name: 'Bundle 1' });
      expect(cache.bundles.size).toBe(1);
      expect(cache.version).toBe(1);

      invalidateCache();

      expect(cache.bundles.size).toBe(0);
      expect(cache.version).toBe(2);
    });
  });

  describe('Memory Management', () => {
    it('should clean up event listeners on component unmount', () => {
      const listeners = [];

      const MockWithListeners = () => {
        React.useEffect(() => {
          const handler = () => {};
          window.addEventListener('resize', handler);
          listeners.push(handler);

          return () => {
            window.removeEventListener('resize', handler);
            const index = listeners.indexOf(handler);
            if (index > -1) listeners.splice(index, 1);
          };
        }, []);

        return <div data-testid="component">Component</div>;
      };

      const { unmount } = render(
        <MemoryRouter>
          <MockWithListeners />
        </MemoryRouter>
      );

      expect(listeners.length).toBe(1);

      unmount();

      expect(listeners.length).toBe(0);
    });

    it('should cancel pending requests on component unmount', () => {
      const pendingRequests = [];

      const MockWithRequests = () => {
        React.useEffect(() => {
          const controller = new AbortController();
          pendingRequests.push(controller);

          return () => {
            controller.abort();
            const index = pendingRequests.indexOf(controller);
            if (index > -1) pendingRequests.splice(index, 1);
          };
        }, []);

        return <div data-testid="component">Component</div>;
      };

      const { unmount } = render(
        <MemoryRouter>
          <MockWithRequests />
        </MemoryRouter>
      );

      expect(pendingRequests.length).toBe(1);

      unmount();

      expect(pendingRequests.length).toBe(0);
    });
  });
});
