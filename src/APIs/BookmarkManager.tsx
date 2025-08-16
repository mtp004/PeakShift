const BOOKMARKS_KEY = 'rate_bookmarks'; // plural key now

export interface BookmarkedRate {
  id: string; // name of the rate
  address: string;
  dateBookmarked: string;
}

export const getBookmarks = (): BookmarkedRate[] => {
  const bookmarks = localStorage.getItem(BOOKMARKS_KEY);
  return bookmarks ? JSON.parse(bookmarks) : [];
};

export const saveBookmark = (bookmark: BookmarkedRate): void => {
  const existingBookmarks = getBookmarks();
  const existingIndex = existingBookmarks.findIndex(b => b.id === bookmark.id && b.address === bookmark.address);
  
  if (existingIndex >= 0) {
    // Update existing bookmark
    existingBookmarks[existingIndex] = bookmark;
  } else {
    // Add new bookmark
    existingBookmarks.push(bookmark);
  }
  
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(existingBookmarks));
};

export const removeBookmark = (address: string, id: string): void => {
  const existingBookmarks = getBookmarks();
  const filteredBookmarks = existingBookmarks.filter(b => !(b.id === id && b.address === address));
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filteredBookmarks));
};

export const removeAllBookmarks = (): void => {
  localStorage.removeItem(BOOKMARKS_KEY);
};

export const isBookmarked = (address: string, id: string): boolean => {
  const bookmarks = getBookmarks();
  return bookmarks.some(bookmark => bookmark.id === id && bookmark.address === address);
};