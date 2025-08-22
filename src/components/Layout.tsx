import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const NavTab = {
  MyData: 'MY_DATA',
  Search: 'SEARCH',
  Upload: 'UPLOAD'
} as const;

const highlightColor = '#430727ff';

type NavTab = (typeof NavTab)[keyof typeof NavTab];

// Helper function to determine active tab from pathname
function getActiveTabFromPath(pathname: string, state?: any): NavTab {
  if (pathname === '/data') {
    return NavTab.MyData;
  } else if (pathname === '/upload') {
    return NavTab.Upload;
  } else if (pathname === '/ratechart') {
    // If we have state indicating we came from bookmarks, keep "My Data" active
    if (state?.fromBookmarks) {
      return NavTab.MyData;
    }
    return NavTab.Search;
  } else {
    // Default to Search for '/', '/report', and any other paths
    return NavTab.Search;
  }
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize activeTab based on current location
  const [activeTab, setActiveTab] = useState<NavTab>(() => 
    getActiveTabFromPath(location.pathname, location.state)
  );

  // Update activeTab when location changes (but don't navigate)
  useEffect(() => {
    const newActiveTab = getActiveTabFromPath(location.pathname, location.state);
    setActiveTab(newActiveTab);
  }, [location.pathname, location.state]);

  function handleNavigationClick(active: NavTab) {
    setActiveTab(active);

    if (active === NavTab.MyData) {
      navigate('/data');
    } else if (active === NavTab.Search) {
      navigate('/');
    } else if (active === NavTab.Upload) {
      navigate('/upload');
    }
  }

  return (
    <div className="d-flex flex-column vh-100">
      {/* Bootstrap Navbar */}
      <nav
        className="navbar border-bottom px-3"
        style={{
          height: '60px',
          backgroundColor: '#85114bff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => handleNavigationClick(NavTab.MyData)}
            className="navbar-brand fw-bold text-decoration-none p-2 border-0"
            style={{
              color: '#dfd2d9ff',
              backgroundColor:
                activeTab === NavTab.MyData ? highlightColor : 'transparent',
            }}
          >
            My Data
          </button>

          <button
            onClick={() => handleNavigationClick(NavTab.Search)}
            className="navbar-brand fw-bold text-decoration-none p-2 border-0"
            style={{
              color: '#dfd2d9ff',
              backgroundColor:
                activeTab === NavTab.Search ? highlightColor : 'transparent',
            }}
          >
            Search
          </button>

          <button
            onClick={() => handleNavigationClick(NavTab.Upload)}
            className="navbar-brand fw-bold text-decoration-none p-2 border-0"
            style={{
              color: '#dfd2d9ff',
              backgroundColor:
                activeTab === NavTab.Upload ? highlightColor : 'transparent',
            }}
          >
            Upload
          </button>
        </div>
      </nav>

      {/* Scrollable content area below navbar */}
      <div className="flex-grow-1 overflow-auto">
        <Outlet context={{ setActiveTab }} />
      </div>
    </div>
  );
}