import { useState } from 'react';
import { getBookmarks, removeBookmark, type BookmarkedRate } from "../APIs/BookmarkManager";
import { useOutletContext, useNavigate } from "react-router-dom";

type LayoutContextType = {
  setActiveTab: (tab: "MY_DATA" | "SEARCH" | "UPLOAD") => void;
};

export function DataPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedRate[]>(getBookmarks());
  const { setActiveTab } = useOutletContext<LayoutContextType>();
  const navigate = useNavigate();

  const handleViewChart = (bookmark: BookmarkedRate) => {
    navigate(`/ratechart?address=${bookmark.address}&rate=${bookmark.id}`);
  };

  const handleRemoveBookmark = (bookmark: BookmarkedRate) => {
    removeBookmark(bookmark.address, bookmark.id);
    setBookmarks(getBookmarks());
  };

  return (
    <div className="d-flex flex-column h-100 bg-light">
        <div className="px-2">
            <h4 className="m-0 border-bottom border-3 border-secondary p-2" 
                style={{display: 'inline-block', width: 'fit-content'}}>Your Saved Energy Rates
            </h4>
        </div>
        {bookmarks.length > 0 ? (
            <div className="d-flex flex-column gap-2 p-2">
                {bookmarks.map((bookmark) => (
                    <div key={`${bookmark.id}-${bookmark.address}`} className="card">
                    <div className="card-body py-2">
                        <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="mb-1">{bookmark.id}</h6>
                            <small className="text-muted">{bookmark.address}</small>
                        </div>
                        <div className="d-flex gap-2">
                            <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleViewChart(bookmark)}
                            >
                            View
                            </button>
                            <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleRemoveBookmark(bookmark)}
                            >
                            ✕
                            </button>
                        </div>
                        </div>
                    </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center">
                <h5 className="mb-2">No bookmarked rates</h5>
                <p className="text-muted mb-3 px-4">
                    Bookmark energy rates to quickly access charts and compare pricing.
                </p>
                <button
                    className="btn btn-primary mt-2"
                    onClick={() => setActiveTab("SEARCH")}
                    >
                    Search Rates
                </button>
            </div>
        )}
    </div>
  );
}