const BOOKMARKS_KEY = 'rate_bookmark'; // singular key now

export interface BookmarkedRate {
  id: string; // name of the rate
  address: string;
  dateBookmarked: string;
}

export const getBookmark = (): BookmarkedRate | null => {
  try {
    const bookmark = localStorage.getItem(BOOKMARKS_KEY);
    return bookmark ? JSON.parse(bookmark) : null;
  } catch (error) {
    console.error('Error loading bookmark:', error);
    return null;
  }
};

export const saveBookmark = (bookmark: BookmarkedRate): void => {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmark));
  } catch (error) {
    console.error('Error saving bookmark:', error);
  }
};

export const removeBookmark = (): void => {
  try {
    localStorage.removeItem(BOOKMARKS_KEY);
  } catch (error) {
    console.error('Error removing bookmark:', error);
  }
};

export const isBookmarked = (id: string): boolean => {
  const bookmark = getBookmark();
  return bookmark?.id === id;
};
