// SearchPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import AddressInput from './AddressInput';
import AddressCard, { type AddressSuggestionForCard } from './AddressCard';
import { Tooltip } from './Tooltip';

type SearchMode = 'electric' | 'solar';

// Each suggestion we keep in state
type PlaceSuggestion = AddressSuggestionForCard & {
  getPlace: () => Promise<google.maps.places.Place>;
};

function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [address, setAddress] = useState(location.state?.addressQuery || '');
  const [searchMode, setSearchMode] = useState<SearchMode>(
    location.state?.searchMode || 'electric'
  );

  // null = no search yet / cleared
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pLibImported, setPlacesReady] = useState(false);

  // Session token for billing grouping
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  // Debounced autocomplete fetch
  const debouncedFetch = useRef(
    debounce(async (query: string) => {
      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
      }

      try {
        setIsLoading(true);
        setSuggestions(null); // clear old results while loading

        const { suggestions } =
          await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: query,
            sessionToken: sessionTokenRef.current,
            includedRegionCodes: ['us'],
          });

        const mapped: PlaceSuggestion[] =
          suggestions?.slice(0, 2).map((s: any) => ({
            id: s.placePrediction.placeId,
            formatted_address: s.placePrediction.text.text,
            types: s.placePrediction.types,
            getPlace: async () => s.placePrediction.toPlace(),
          })) ?? [];

        // [] = “searched but no matches”
        setSuggestions(mapped);
      } catch (err) {
        console.error('Error fetching autocomplete suggestions', err);
        setSuggestions([]); // treat error as “no results”
      } finally {
        setIsLoading(false);
      }
    }, 400)
  ).current;

  // Load Places library once
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await google.maps.importLibrary('places');
        if (!cancelled) setPlacesReady(true);
      } catch (err) {
        console.error('Error loading places library', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Run autocomplete when address changes
  useEffect(() => {
    if (!pLibImported) return;

    if (address.trim() !== '') {
      debouncedFetch(address);
    } else {
      debouncedFetch.cancel();
      setSuggestions(null);     // hide dropdown when input cleared
      setIsLoading(false);
      sessionTokenRef.current = null;
    }
  }, [address, pLibImported]);

  // When user clicks an address card
  async function onSelectSuggestion(suggestion: PlaceSuggestion) {
    try {
      const place = await suggestion.getPlace();

      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location'],
      });

      const formattedAddress = place.formattedAddress ?? suggestion.formatted_address;
      const encodedAddress = encodeURIComponent(formattedAddress);
      const location = place.location;

      if (searchMode === 'electric') {
        navigate(`/search/report?address=${encodedAddress}`, {
          state: { addressQuery: formattedAddress, searchMode },
        });
      } else {
        if (!location) {
          console.warn('No location on place object; cannot proceed to solar questionnaire.');
          return;
        }

        const lat = location.lat();
        const lng = location.lng();

        navigate(
          `/search/questionaire?address=${encodedAddress}&lat=${lat}&lon=${lng}`,
          {
            state: { addressQuery: formattedAddress, searchMode },
          }
        );
      }
    } catch (err) {
      console.error('Error selecting suggestion', err);
    }
  }

  const helpTooltip = (
    <>
      <div className="fw-bold mb-2">About PeakShift</div>
      <div className="mb-3 small">
        PeakShift helps you optimize your electricity usage by identifying the best times to run
        high-energy appliances. Get personalized insights based on your location&apos;s utility
        rates and demand patterns to reduce your energy costs.
      </div>

      <div className="fw-bold mb-2">How to get started:</div>
      <ol className="mb-2 ps-3 small">
        <li className="mb-1">
          <strong>Choose your search mode</strong> - Electric rates or Solar potential
        </li>
        <li className="mb-1">
          <strong>Enter your complete address</strong> in the search box (include street, city, and
          state)
        </li>
        <li className="mb-1">
          <strong>Select your address</strong> from the dropdown suggestions that appear
        </li>
        <li className="mb-1">
          <strong>View your personalized report</strong> showing insights and optimization
          opportunities
        </li>
      </ol>
    </>
  );

  return (
    <div className="h-100 d-flex justify-content-center align-items-center bg-light position-relative">
      {/* Toggle Button - Top Left */}
      <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
        <button
          type="button"
          className={`btn ${searchMode === 'electric' ? 'btn-primary' : 'btn-warning'}`}
          onClick={() =>
            setSearchMode((prev) => (prev === 'electric' ? 'solar' : 'electric'))
          }
        >
          {searchMode === 'electric' ? '⚡ Electric Rates' : '☀️ Solar Potential'}
        </button>
      </div>

      {/* Tooltip Component */}
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <Tooltip tooltip={helpTooltip} />
      </div>

      {/* Main content */}
      <div className="container" style={{ maxWidth: '600px' }}>
        <h1 className="text-center mb-4">
          {searchMode === 'electric'
            ? 'PeakShift - Electric Usage Optimizer'
            : 'PeakShift - Solar Potential Optimizer'}
        </h1>

        <div className="position-relative">
          <AddressInput address={address} setAddress={setAddress} />

          {(isLoading || suggestions !== null) && address.trim() !== '' && (
            <div
              className="dropdown-menu show p-0 border-0 shadow-sm w-100"
              style={{ zIndex: 100 }}
            >
              {isLoading ? (
                <div className="d-flex justify-content-center py-3">
                  <div className="spinner-border" role="status" />
                </div>
              ) : suggestions && suggestions.length === 0 ? (
                <div className="px-3 py-2 text-muted text-center">
                  No address match in{' '}
                  <a href="https://www.google.com/maps/" target="_blank" rel="noopener noreferrer">
                    GoogleMap
                  </a>
                  's database
                </div>
              ) : suggestions? (
                suggestions.map((s) => (
                  <AddressCard
                    key={s.id}
                    suggestion={s}
                    onSelect={() => onSelectSuggestion(s)}
                    searchMode={searchMode}
                  />
                ))
              ) : null}
            </div>
          )}
        </div>

        <div className="text-center mt-3">
          <small className="text-muted">Powered by Google Maps</small>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
