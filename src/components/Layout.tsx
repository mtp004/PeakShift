import { Link, Outlet, useNavigate } from 'react-router-dom';
import { getBookmark } from '../APIs/BookmarkManager';

export default function Layout() {
  const navigate = useNavigate();

  function handleMyDataClick(e: React.MouseEvent) {
    e.preventDefault();
    const bookmark = getBookmark();
    if (bookmark) {
      navigate('/ratechart', { state: { report: bookmark.report } });
    } else {
      navigate('/');
    }
  };

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
        <Link
          to="/"
          className="navbar-brand fw-bold text-decoration-none"
          style={{ color: '#dfd2d9ff' }}
        >
          Search
        </Link>

        <a
          href="#"
          onClick={handleMyDataClick}
          className="navbar-brand fw-bold text-decoration-none"
          style={{ color: '#dfd2d9ff' }}
        >
          My Data
        </a>
      </nav>

      {/* Scrollable content area below navbar */}
      <div className="flex-grow-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
