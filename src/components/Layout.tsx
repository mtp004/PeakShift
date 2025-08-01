import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { getBookmark } from '../APIs/BookmarkManager';

const NavTab = {
  MyData: 'MY_DATA',
  Search: 'SEARCH',
} as const;

const highlightColor = '#430727ff';

type NavTab = (typeof NavTab)[keyof typeof NavTab];

export default function Layout() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<NavTab>(NavTab.MyData);

  function handleNavigationClick(active: NavTab) {
    setActiveTab(active);

    if (active === NavTab.MyData) {
      const bookmark = getBookmark();
      if (bookmark) {
        navigate(`/ratechart?address=${bookmark.address}&rate=${bookmark.id}`);
      } else {
        navigate('/');
      }
    } else if (active === NavTab.Search) {
      navigate('/');
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
        </div>
      </nav>

      {/* Scrollable content area below navbar */}
      <div className="flex-grow-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
