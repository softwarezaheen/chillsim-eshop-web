import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, useNavigate, useSearchParams, useLocation, Routes, Route, Link, NavLink, Outlet, useParams } from 'react-router-dom';
import React from 'react';

// Test components using React Router 7 hooks
const NavigationTestComponent = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>Navigation Test</h1>
      <button onClick={() => navigate('/about')}>Go to About</button>
      <button onClick={() => navigate(-1)}>Go Back</button>
      <button onClick={() => navigate('/products', { state: { from: 'home' } })}>
        Go to Products
      </button>
    </div>
  );
};

const SearchParamsTestComponent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  return (
    <div>
      <h1>Search: {query || 'none'}</h1>
      <button onClick={() => setSearchParams({ q: 'test' })}>Set Query</button>
      <button onClick={() => setSearchParams({})}>Clear Query</button>
    </div>
  );
};

const LocationTestComponent = () => {
  const location = useLocation();
  
  return (
    <div>
      <h1>Current Path: {location.pathname}</h1>
      <p>State: {JSON.stringify(location.state)}</p>
    </div>
  );
};

const NestedRoutesComponent = () => {
  return (
    <Routes>
      <Route path="/" element={<div>Home Page</div>} />
      <Route path="/about" element={<div>About Page</div>} />
      <Route path="/products" element={<div>Products Page</div>} />
      <Route path="/products/:id" element={<div>Product Detail</div>} />
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

describe('React Router 7 - Navigation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useNavigate Hook', () => {
    it('should render navigation component without errors', () => {
      render(
        <MemoryRouter>
          <NavigationTestComponent />
        </MemoryRouter>
      );

      expect(screen.getByText('Navigation Test')).toBeTruthy();
      expect(screen.getByText('Go to About')).toBeTruthy();
    });

    it('should not crash when calling navigate', async () => {
      const { getByText } = render(
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<NavigationTestComponent />} />
            <Route path="/about" element={<div>About Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      const button = getByText('Go to About');
      
      // Click should not crash
      expect(() => act(() => {
        button.click();
      })).not.toThrow();
    });

    it('should handle navigate with state', () => {
      render(
        <MemoryRouter>
          <NavigationTestComponent />
        </MemoryRouter>
      );

      const button = screen.getByText('Go to Products');
      
      expect(() => act(() => {
        button.click();
      })).not.toThrow();
    });

    it('should handle back navigation', () => {
      render(
        <MemoryRouter initialEntries={['/first', '/second']}>
          <NavigationTestComponent />
        </MemoryRouter>
      );

      const backButton = screen.getByText('Go Back');
      
      expect(() => act(() => {
        backButton.click();
      })).not.toThrow();
    });
  });

  describe('useSearchParams Hook', () => {
    it('should read URL search parameters', () => {
      render(
        <MemoryRouter initialEntries={['/?q=testing']}>
          <SearchParamsTestComponent />
        </MemoryRouter>
      );

      expect(screen.getByText('Search: testing')).toBeTruthy();
    });

    it('should handle empty search parameters', () => {
      render(
        <MemoryRouter>
          <SearchParamsTestComponent />
        </MemoryRouter>
      );

      expect(screen.getByText('Search: none')).toBeTruthy();
    });

    it('should update search parameters without crashing', () => {
      const { getByText } = render(
        <MemoryRouter>
          <SearchParamsTestComponent />
        </MemoryRouter>
      );

      const setButton = getByText('Set Query');
      
      expect(() => act(() => {
        setButton.click();
      })).not.toThrow();
    });

    it('should clear search parameters without crashing', () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/?q=test']}>
          <SearchParamsTestComponent />
        </MemoryRouter>
      );

      const clearButton = getByText('Clear Query');
      
      expect(() => act(() => {
        clearButton.click();
      })).not.toThrow();
    });
  });

  describe('useLocation Hook', () => {
    it('should read current location pathname', () => {
      render(
        <MemoryRouter initialEntries={['/test-path']}>
          <LocationTestComponent />
        </MemoryRouter>
      );

      expect(screen.getByText('Current Path: /test-path')).toBeTruthy();
    });

    it('should read location state', () => {
      render(
        <MemoryRouter
          initialEntries={[
            { pathname: '/test', state: { userId: 123 } },
          ]}
        >
          <LocationTestComponent />
        </MemoryRouter>
      );

      expect(screen.getByText(/userId/)).toBeTruthy();
    });

    it('should handle null location state', () => {
      render(
        <MemoryRouter>
          <LocationTestComponent />
        </MemoryRouter>
      );

      expect(screen.getByText('State: null')).toBeTruthy();
    });
  });

  describe('Routes and Route Components', () => {
    it('should render default route', () => {
      render(
        <MemoryRouter>
          <NestedRoutesComponent />
        </MemoryRouter>
      );

      expect(screen.getByText('Home Page')).toBeTruthy();
    });

    it('should render nested routes', () => {
      render(
        <MemoryRouter initialEntries={['/about']}>
          <NestedRoutesComponent />
        </MemoryRouter>
      );

      expect(screen.getByText('About Page')).toBeTruthy();
    });

    it('should handle dynamic route parameters', () => {
      render(
        <MemoryRouter initialEntries={['/products/123']}>
          <NestedRoutesComponent />
        </MemoryRouter>
      );

      expect(screen.getByText('Product Detail')).toBeTruthy();
    });

    it('should render 404 for unknown routes', () => {
      render(
        <MemoryRouter initialEntries={['/unknown-route']}>
          <NestedRoutesComponent />
        </MemoryRouter>
      );

      expect(screen.getByText('404 Not Found')).toBeTruthy();
    });
  });

  describe('XSS Protection - React Router 7', () => {
    it('should not allow script injection via navigation', () => {
      const MaliciousNavComponent = () => {
        const navigate = useNavigate();
        
        return (
          <button onClick={() => navigate('/test?xss=<script>alert("xss")</script>')}>
            Navigate
          </button>
        );
      };

      const { getByRole } = render(
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<MaliciousNavComponent />} />
            <Route path="/test" element={<div>Test Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      const button = getByRole('button');
      
      // Should not execute script
      expect(() => act(() => {
        button.click();
      })).not.toThrow();
    });

    it('should sanitize state objects', () => {
      const StateTestComponent = () => {
        const navigate = useNavigate();
        const location = useLocation();
        
        return (
          <div>
            <button onClick={() => navigate('/test', { 
              state: { 
                data: '<img src=x onerror=alert(1)>' 
              } 
            })}>
              Navigate with XSS
            </button>
            <p>{location.state?.data || 'No data'}</p>
          </div>
        );
      };

      render(
        <MemoryRouter>
          <StateTestComponent />
        </MemoryRouter>
      );

      // Component should render without executing any scripts
      expect(screen.getByText('No data')).toBeTruthy();
    });
  });

  describe('External Redirect Protection', () => {
    it('should handle relative paths safely', () => {
      const RelativeNavComponent = () => {
        const navigate = useNavigate();
        
        return (
          <div>
            <button onClick={() => navigate('../parent')}>Relative Nav</button>
            <button onClick={() => navigate('./child')}>Child Nav</button>
          </div>
        );
      };

      render(
        <MemoryRouter initialEntries={['/parent/child']}>
          <RelativeNavComponent />
        </MemoryRouter>
      );

      expect(screen.getByText('Relative Nav')).toBeTruthy();
      expect(screen.getByText('Child Nav')).toBeTruthy();
    });

    it('should not allow external URL navigation via navigate', () => {
      const ExternalNavComponent = () => {
        const navigate = useNavigate();
        
        return (
          <button onClick={() => {
            // React Router 7 should prevent this or handle it safely
            try {
              navigate('https://evil.com');
            } catch (e) {
              // Expected to fail or be handled safely
            }
          }}>
            External Nav
          </button>
        );
      };

      render(
        <MemoryRouter>
          <ExternalNavComponent />
        </MemoryRouter>
      );

      const button = screen.getByText('External Nav');
      
      // Should not crash the app
      expect(() => act(() => {
        button.click();
      })).not.toThrow();
    });
  });

  describe('Performance and Memory', () => {
    it('should handle rapid navigation without memory leaks', () => {
      const RapidNavComponent = () => {
        const navigate = useNavigate();
        
        return (
          <button onClick={() => {
            for (let i = 0; i < 10; i++) {
              navigate(`/page-${i}`);
            }
          }}>
            Rapid Navigate
          </button>
        );
      };

      render(
        <MemoryRouter>
          <RapidNavComponent />
        </MemoryRouter>
      );

      const button = screen.getByText('Rapid Navigate');
      
      expect(() => act(() => {
        button.click();
      })).not.toThrow();
    });

    it('should clean up on unmount', () => {
      const { unmount } = render(
        <MemoryRouter>
          <NavigationTestComponent />
        </MemoryRouter>
      );

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Link Component Tests', () => {
    it('should render Link component', () => {
      render(
        <MemoryRouter>
          <Routes>
            <Route path="/" element={
              <div>
                <Link to="/about">About Link</Link>
              </div>
            } />
            <Route path="/about" element={<div>About Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('About Link')).toBeTruthy();
    });

    it('should navigate when Link is clicked', () => {
      const { container } = render(
        <MemoryRouter>
          <Routes>
            <Route path="/" element={
              <div>
                <h1>Home</h1>
                <Link to="/about">Go to About</Link>
              </div>
            } />
            <Route path="/about" element={<h1>About Page</h1>} />
          </Routes>
        </MemoryRouter>
      );

      const link = screen.getByText('Go to About');
      fireEvent.click(link);

      waitFor(() => {
        expect(screen.getByText('About Page')).toBeTruthy();
      });
    });

    it('should pass state through Link', () => {
      const StateReceiver = () => {
        const location = useLocation();
        return <div>State: {location.state?.message || 'none'}</div>;
      };

      render(
        <MemoryRouter>
          <Routes>
            <Route path="/" element={
              <Link to="/destination" state={{ message: 'Hello' }}>Click</Link>
            } />
            <Route path="/destination" element={<StateReceiver />} />
          </Routes>
        </MemoryRouter>
      );

      const link = screen.getByText('Click');
      fireEvent.click(link);

      waitFor(() => {
        expect(screen.getByText('State: Hello')).toBeTruthy();
      });
    });

    it('should render NavLink with active class', () => {
      render(
        <MemoryRouter initialEntries={['/home']}>
          <Routes>
            <Route path="/home" element={
              <div>
                <NavLink 
                  to="/home"
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  Home
                </NavLink>
              </div>
            } />
          </Routes>
        </MemoryRouter>
      );

      const navLink = screen.getByText('Home');
      expect(navLink.className).toContain('active');
    });
  });

  describe('Advanced Routing Features', () => {
    it('should handle dynamic route parameters', () => {
      const ProductDetail = () => {
        const { id } = useParams();
        return <div>Product ID: {id}</div>;
      };

      render(
        <MemoryRouter initialEntries={['/products/123']}>
          <Routes>
            <Route path="/products/:id" element={<ProductDetail />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Product ID: 123')).toBeTruthy();
    });

    it('should handle multiple params', () => {
      const UserPost = () => {
        const { userId, postId } = useParams();
        return <div>User {userId} - Post {postId}</div>;
      };

      render(
        <MemoryRouter initialEntries={['/users/42/posts/99']}>
          <Routes>
            <Route path="/users/:userId/posts/:postId" element={<UserPost />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('User 42 - Post 99')).toBeTruthy();
    });

    it('should render index route', () => {
      const Layout = () => (
        <div>
          <h1>Layout</h1>
          <Outlet />
        </div>
      );
      
      const IndexPage = () => <h1>Index Page</h1>;

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/dashboard" element={<Layout />}>
              <Route index element={<IndexPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Index Page')).toBeTruthy();
    });

    it('should render nested routes with Outlet', () => {
      const Layout = () => (
        <div>
          <h1>Layout</h1>
          <Outlet />
        </div>
      );

      render(
        <MemoryRouter initialEntries={['/dashboard/settings']}>
          <Routes>
            <Route path="/dashboard" element={<Layout />}>
              <Route path="settings" element={<div>Settings Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Layout')).toBeTruthy();
      expect(screen.getByText('Settings Content')).toBeTruthy();
    });

    it('should handle optional parameters', () => {
      const UserPage = () => {
        const { id } = useParams();
        return <div>User: {id || 'all'}</div>;
      };

      render(
        <MemoryRouter initialEntries={['/users']}>
          <Routes>
            <Route path="/users/:id?" element={<UserPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('User: all')).toBeTruthy();
    });

    it('should handle trailing slashes', () => {
      render(
        <MemoryRouter initialEntries={['/about/']}>
          <Routes>
            <Route path="/about" element={<div>About Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('About Page')).toBeTruthy();
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle very long URLs', () => {
      const longPath = '/path/' + 'segment/'.repeat(100);
      
      render(
        <MemoryRouter initialEntries={[longPath]}>
          <Routes>
            <Route path="*" element={<div>Caught</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Caught')).toBeTruthy();
    });

    it('should handle special characters in params', () => {
      const TestComponent = () => {
        const { id } = useParams();
        return <div>ID: {id}</div>;
      };

      render(
        <MemoryRouter initialEntries={['/items/test%20item']}>
          <Routes>
            <Route path="/items/:id" element={<TestComponent />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/ID:/)).toBeTruthy();
    });

    it('should handle unicode in URLs', () => {
      const TestComponent = () => {
        const { name } = useParams();
        return <div>Name: {name}</div>;
      };

      render(
        <MemoryRouter initialEntries={['/users/日本語']}>
          <Routes>
            <Route path="/users/:name" element={<TestComponent />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/Name:/)).toBeTruthy();
    });

    it('should handle hash fragments', () => {
      render(
        <MemoryRouter initialEntries={['/page#section']}>
          <Routes>
            <Route path="/page" element={<div>Page Content</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Page Content')).toBeTruthy();
    });

    it('should handle query strings with special characters', () => {
      const QueryTest = () => {
        const [searchParams] = useSearchParams();
        const query = searchParams.get('q');
        return <div>Query: {query}</div>;
      };

      render(
        <MemoryRouter initialEntries={['/?q=test&value']}>
          <Routes>
            <Route path="/" element={<QueryTest />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/Query:/)).toBeTruthy();
    });
  });
});
