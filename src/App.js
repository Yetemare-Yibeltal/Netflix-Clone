
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  X,
  Play,
  Plus,
  Check,
  Star,
  Film,
  Bookmark,
  ArrowLeft,
  RotateCw,
} from "lucide-react";

import axios from "./axios";
import Banner from "./Components/BannerSection/Banner";
import Nav from "./Components/NavSection/Nav";
import Rows from "./Components/Rows/Rows";
import Footer from "./Components/Footer/Footer";
import requests from "./requests";
import "./App.css";

const POSTER_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/w780";
const STORAGE_KEY = "streamflix-my-list";

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="750">
      <rect width="100%" height="100%" fill="#202020"/>
      <text x="50%" y="48%" fill="#aaaaaa"
        font-family="Arial,sans-serif" font-size="28"
        text-anchor="middle">StreamFlix</text>
      <text x="50%" y="55%" fill="#777777"
        font-family="Arial,sans-serif" font-size="18"
        text-anchor="middle">Image unavailable</text>
    </svg>
  `);

const GENRES = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  14: "Fantasy",
  27: "Horror",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  53: "Thriller",
  10751: "Family",
  36: "History",
};

const catalogSections = [
  {
    title: "Trending This Week",
    url: requests.fetchTrending,
    category: "discovery",
  },
  {
    title: "Popular Movies",
    url: requests.fetchPopularMovies,
    category: "movies",
  },
  {
    title: "Popular TV Shows",
    url: requests.fetchPopularTV,
    category: "tv",
  },
  {
    title: "Netflix Originals",
    url: requests.fetchNetflixOriginals,
    category: "tv",
    large: true,
  },
  {
    title: "Top Rated Movies",
    url: requests.fetchTopRatedMovies,
    category: "movies",
  },
  {
    title: "Now Playing in Theaters",
    url: requests.fetchNowPlayingMovies,
    category: "discovery",
  },
  {
    title: "Action & Adventure",
    url: requests.fetchActionAdventure,
    category: "movies",
  },
  {
    title: "Comedy Movies",
    url: requests.fetchComedyMovies,
    category: "movies",
  },
  {
    title: "Crime Stories",
    url: requests.fetchCrimeMovies,
    category: "movies",
  },
  {
    title: "Documentaries",
    url: requests.fetchDocumentaries,
    category: "movies",
  },
  {
    title: "Drama",
    url: requests.fetchDramaMovies,
    category: "movies",
  },
  {
    title: "Family Favorites",
    url: requests.fetchFamilyMovies,
    category: "movies",
  },
  {
    title: "Fantasy Worlds",
    url: requests.fetchFantasyMovies,
    category: "movies",
  },
  {
    title: "Horror",
    url: requests.fetchHorrorMovies,
    category: "movies",
  },
  {
    title: "Mystery",
    url: requests.fetchMysteryMovies,
    category: "movies",
  },
  {
    title: "Romance",
    url: requests.fetchRomanceMovies,
    category: "movies",
  },
  {
    title: "Science Fiction",
    url: requests.fetchScienceFictionMovies,
    category: "movies",
  },
  {
    title: "Thrillers",
    url: requests.fetchThrillers || requests.fetchThrillerMovies,
    category: "movies",
  },
  {
    title: "Animation",
    url: requests.fetchAnimationMovies,
    category: "movies",
  },
  {
    title: "Historical Films",
    url: requests.fetchHistoryMovies,
    category: "movies",
  },
  {
    title: "Upcoming Movies",
    url: requests.fetchUpcomingMovies,
    category: "discovery",
  },
  {
    title: "Top Rated TV Shows",
    url: requests.fetchTopRatedTV,
    category: "tv",
  },
  {
    title: "TV Shows Airing Today",
    url: requests.fetchAiringTodayTV,
    category: "tv",
  },
].filter((section) => Boolean(section.url));

function readSavedList() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getTitle(item) {
  return (
    item?.title ||
    item?.name ||
    item?.original_name ||
    "Untitled"
  );
}

function getMediaType(item) {
  return (
    item?.media_type ||
    (item?.first_air_date ? "tv" : "movie")
  );
}

function getImage(item) {
  if (item?.poster_path) {
    return `${POSTER_BASE}${item.poster_path}`;
  }

  if (item?.backdrop_path) {
    return `${BACKDROP_BASE}${item.backdrop_path}`;
  }

  return FALLBACK_IMAGE;
}

function App() {
  const [activePage, setActivePage] = useState("Home");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchRetry, setSearchRetry] = useState(0);

  const [genreResults, setGenreResults] = useState([]);
  const [genrePage, setGenrePage] = useState(1);
  const [genreHasMore, setGenreHasMore] = useState(false);
  const [genreLoading, setGenreLoading] = useState(false);
  const [genreLoadingMore, setGenreLoadingMore] = useState(false);
  const [genreError, setGenreError] = useState("");
  const [genreRetry, setGenreRetry] = useState(0);

  const [savedList, setSavedList] = useState(readSavedList);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState("");
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [trailerError, setTrailerError] = useState("");

  const trailerRequestId = useRef(0);

  // Persist My List.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(savedList)
      );
    } catch (error) {
      console.error("Unable to save My List:", error);
    }
  }, [savedList]);

  // Search handler.
  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    setSearchError("");
  }, []);

  // Search movies and TV shows.
  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError("");
      return undefined;
    }

    let active = true;
    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setSearchLoading(true);
      setSearchError("");

      try {
        const response = await axios.get("/search/multi", {
          params: {
            query,
            page: 1,
            include_adult: false,
            language: "en-US",
          },
          signal: controller.signal,
        });

        if (!active) return;

        const results = Array.isArray(response.data?.results)
          ? response.data.results
          : [];

        setSearchResults(
          results.filter(
            (item) =>
              item.media_type !== "person" &&
              (item.poster_path || item.backdrop_path)
          )
        );
      } catch (error) {
        if (
          !active ||
          error.code === "ERR_CANCELED" ||
          error.name === "CanceledError"
        ) {
          return;
        }

        console.error("Search request failed:", error);
        setSearchResults([]);
        setSearchError(
          "Unable to search right now. Check your connection and TMDB API configuration."
        );
      } finally {
        if (active) setSearchLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, searchRetry]);

  // Load genre results.
  useEffect(() => {
    if (!activePage.startsWith("Genre:")) {
      setGenreResults([]);
      setGenrePage(1);
      setGenreHasMore(false);
      setGenreError("");
      setGenreLoading(false);
      setGenreLoadingMore(false);
      return undefined;
    }

    const genreId = activePage.slice("Genre:".length);

    if (!Object.prototype.hasOwnProperty.call(GENRES, genreId)) {
      setGenreResults([]);
      setGenreError("This genre is not supported.");
      setGenreLoading(false);
      setGenreLoadingMore(false);
      return undefined;
    }

    let active = true;
    const controller = new AbortController();
    const isFirstPage = genrePage === 1;

    if (isFirstPage) {
      setGenreLoading(true);
    } else {
      setGenreLoadingMore(true);
    }

    setGenreError("");

    async function loadGenreMovies() {
      try {
        const response = await axios.get("/discover/movie", {
          params: {
            with_genres: genreId,
            page: genrePage,
            sort_by: "popularity.desc",
            include_adult: false,
            language: "en-US",
          },
          signal: controller.signal,
        });

        if (!active) return;

        const results = (
          Array.isArray(response.data?.results)
            ? response.data.results
            : []
        ).filter(
          (movie) => movie.poster_path || movie.backdrop_path
        );

        setGenreResults((current) => {
          if (isFirstPage) return results;

          const existingIds = new Set(
            current.map((movie) => movie.id)
          );

          return [
            ...current,
            ...results.filter(
              (movie) => !existingIds.has(movie.id)
            ),
          ];
        });

        setGenreHasMore(
          genrePage < (response.data?.total_pages || 1)
        );
      } catch (error) {
        if (
          !active ||
          error.code === "ERR_CANCELED" ||
          error.name === "CanceledError"
        ) {
          return;
        }

        console.error("Genre request failed:", error);
        setGenreError(
          "Unable to load this genre. Please try again."
        );

        if (isFirstPage) {
          setGenreResults([]);
          setGenreHasMore(false);
        }
      } finally {
        if (active) {
          setGenreLoading(false);
          setGenreLoadingMore(false);
        }
      }
    }

    loadGenreMovies();

    return () => {
      active = false;
      controller.abort();
    };
  }, [activePage, genrePage, genreRetry]);

  // Add or remove a title from My List.
  const toggleList = useCallback((movie) => {
    setSavedList((current) => {
      const exists = current.some(
        (item) =>
          item.id === movie.id &&
          getMediaType(item) === getMediaType(movie)
      );

      if (exists) {
        return current.filter(
          (item) =>
            !(
              item.id === movie.id &&
              getMediaType(item) === getMediaType(movie)
            )
        );
      }

      return [
        { ...movie, media_type: getMediaType(movie) },
        ...current,
      ];
    });
  }, []);

  const isInList = useCallback(
    (movie) =>
      savedList.some(
        (item) =>
          item.id === movie.id &&
          getMediaType(item) === getMediaType(movie)
      ),
    [savedList]
  );

  // Navigate between pages.
  const handleNavigate = useCallback((page) => {
    trailerRequestId.current += 1;

    setActivePage(page);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
    setSelectedMovie(null);
    setTrailerKey("");
    setTrailerError("");
    setTrailerLoading(false);

    setGenreResults([]);
    setGenrePage(1);
    setGenreHasMore(false);
    setGenreError("");
    setGenreLoading(false);
    setGenreLoadingMore(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Open details immediately, without waiting for TMDB.
  const openDetails = useCallback((movie) => {
    console.log("[App] More Info clicked:", movie);

    if (!movie || !movie.id) {
      console.error("[App] Cannot open details: movie is missing an ID.");
      return;
    }

    trailerRequestId.current += 1;

    setSelectedMovie(movie);
    setTrailerKey("");
    setTrailerError("");
    setTrailerLoading(false);
  }, []);

  // Fetch and play a YouTube trailer.
  const playTrailer = useCallback(async (movie) => {
    console.log("[App] Play Trailer clicked:", movie);

    if (!movie || !movie.id) {
      console.error("[App] Cannot load trailer: movie is missing an ID.");
      return;
    }

    const requestId = ++trailerRequestId.current;

    setSelectedMovie(movie);
    setTrailerKey("");
    setTrailerError("");
    setTrailerLoading(true);

    try {
      const mediaType = getMediaType(movie);

      const response = await axios.get(
        `/${mediaType}/${movie.id}/videos`,
        { params: { language: "en-US" } }
      );

      if (requestId !== trailerRequestId.current) return;

      const videos = Array.isArray(response.data?.results)
        ? response.data.results
        : [];

      const youtubeVideos = videos.filter(
        (video) => video.site === "YouTube" && video.key
      );

      const trailer =
        youtubeVideos.find(
          (video) => video.type === "Trailer" && video.official
        ) ||
        youtubeVideos.find(
          (video) => video.type === "Trailer"
        ) ||
        youtubeVideos.find(
          (video) => video.type === "Teaser"
        ) ||
        youtubeVideos[0];

      if (trailer?.key) {
        setTrailerKey(trailer.key);
      } else {
        setTrailerError(
          "No YouTube trailer is available for this title."
        );
      }
    } catch (error) {
      if (requestId !== trailerRequestId.current) return;

      console.error("[App] Unable to load trailer:", error);
      setTrailerError(
        "Unable to load the trailer. Check your connection and TMDB API configuration."
      );
    } finally {
      if (requestId === trailerRequestId.current) {
        setTrailerLoading(false);
      }
    }
  }, []);

  const closeDetails = useCallback(() => {
    trailerRequestId.current += 1;
    setSelectedMovie(null);
    setTrailerKey("");
    setTrailerError("");
    setTrailerLoading(false);
  }, []);

  // Select the correct catalog for the active page.
  const visibleSections = useMemo(() => {
    switch (activePage) {
      case "Movies":
        return catalogSections.filter(
          (section) => section.category === "movies"
        );

      case "TV Shows":
        return catalogSections.filter(
          (section) => section.category === "tv"
        );

      case "New & Popular":
        return catalogSections.filter(
          (section) => section.category === "discovery"
        );

      case "Home":
      default:
        return catalogSections;
    }
  }, [activePage]);

  const genreId = activePage.startsWith("Genre:")
    ? activePage.slice("Genre:".length)
    : "";

  const genreTitle = GENRES[genreId] || "Genre";

  const savedRows = useMemo(
    () => (activePage === "My List" ? savedList : []),
    [activePage, savedList]
  );

  // Close the details modal with Escape.
  useEffect(() => {
    if (!selectedMovie) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") closeDetails();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMovie, closeDetails]);

  // Cards used by search, genre and My List pages.
  const renderMovieCard = (movie, showRemove = false) => (
    <article
      className="app-result-card"
      key={`${getMediaType(movie)}-${movie.id}`}
    >
      <button
        type="button"
        className="app-result-poster"
        onClick={() => openDetails(movie)}
        aria-label={`View details for ${getTitle(movie)}`}
      >
        <img
          src={getImage(movie)}
          alt={getTitle(movie)}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
      </button>

      <h2>{getTitle(movie)}</h2>

      {movie.vote_average > 0 && (
        <p className="app-card-rating">
          <Star size={14} fill="currentColor" />
          {Number(movie.vote_average).toFixed(1)} / 10
        </p>
      )}

      <div className="app-result-actions">
        {showRemove ? (
          <button
            type="button"
            className="secondary-button"
            onClick={() => toggleList(movie)}
          >
            <X size={16} />
            Remove
          </button>
        ) : (
          <>
            <button
              type="button"
              className="primary-button"
              onClick={() => playTrailer(movie)}
            >
              <Play size={16} fill="currentColor" />
              Trailer
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => toggleList(movie)}
            >
              {isInList(movie) ? (
                <Check size={16} />
              ) : (
                <Plus size={16} />
              )}
              {isInList(movie) ? "Saved" : "My List"}
            </button>
          </>
        )}
      </div>
    </article>
  );

  return (
    <div className="App">
      <Nav
        onSearch={handleSearch}
        onNavigate={handleNavigate}
        activePage={activePage}
      />

      <main className="app-main">
        {!searchQuery && activePage === "Home" && (
          <Banner
            onPlay={playTrailer}
            onMoreInfo={openDetails}
          />
        )}

        {searchQuery ? (
          <section className="app-results page-container">
            <h1 className="app-page-title">
              Search results for “{searchQuery}”
            </h1>

            {searchLoading ? (
              <div className="status-message">
                <div className="loading-spinner" />
                Searching movies and shows…
              </div>
            ) : searchError ? (
              <div className="status-message error-message">
                <p>{searchError}</p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setSearchRetry((value) => value + 1)}
                >
                  <RotateCw size={16} />
                  Try again
                </button>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="app-results-grid">
                {searchResults.map((movie) => renderMovieCard(movie))}
              </div>
            ) : (
              <div className="status-message">
                No movies or shows found. Try a different title.
              </div>
            )}
          </section>
        ) : activePage === "My List" ? (
          <section className="app-list-page page-container">
            <h1 className="app-page-title">My List</h1>
            <p className="app-page-subtitle">
              Your saved movies and shows, ready whenever you are.
            </p>

            {savedRows.length > 0 ? (
              <div className="app-results-grid">
                {savedRows.map((movie) => renderMovieCard(movie, true))}
              </div>
            ) : (
              <div className="status-message">
                <Bookmark size={24} />
                <p>Your list is empty.</p>
                <p>Add movies and shows using the My List button.</p>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => handleNavigate("Home")}
                >
                  <Film size={16} />
                  Browse titles
                </button>
              </div>
            )}
          </section>
        ) : activePage.startsWith("Genre:") ? (
          <section className="app-results page-container">
            <div className="genre-page-heading">
              <div>
                <p className="app-page-subtitle">EXPLORE BY GENRE</p>
                <h1 className="app-page-title">{genreTitle} Movies</h1>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={() => handleNavigate("Home")}
              >
                <ArrowLeft size={16} />
                All Movies
              </button>
            </div>

            {genreError && (
              <div className="status-message error-message">
                <p>{genreError}</p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setGenreResults([]);
                    setGenrePage(1);
                    setGenreError("");
                    setGenreRetry((value) => value + 1);
                  }}
                >
                  <RotateCw size={16} />
                  Try again
                </button>
              </div>
            )}

            {genreLoading && genreResults.length === 0 ? (
              <div className="status-message">
                <div className="loading-spinner" />
                Loading {genreTitle.toLowerCase()} movies…
              </div>
            ) : genreResults.length > 0 ? (
              <>
                <div className="app-results-grid">
                  {genreResults.map((movie) => renderMovieCard(movie))}
                </div>

                {genreHasMore && (
                  <div className="genre-load-more">
                    <button
                      type="button"
                      className="primary-button"
                      disabled={genreLoadingMore}
                      onClick={() => setGenrePage((page) => page + 1)}
                    >
                      {genreLoadingMore ? (
                        <>
                          <RotateCw size={16} />
                          Loading…
                        </>
                      ) : (
                        "Load More Movies"
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : !genreLoading && !genreError ? (
              <div className="status-message">
                No {genreTitle.toLowerCase()} movies were found.
              </div>
            ) : null}
          </section>
        ) : (
          <>
            {activePage !== "Home" && (
              <section className="page-container app-section-heading">
                <h1 className="app-page-title">{activePage}</h1>
                <p className="app-page-subtitle">
                  {activePage === "Movies"
                    ? "Explore movies by popularity, rating, and genre."
                    : activePage === "TV Shows"
                      ? "Discover popular and highly rated television shows."
                      : activePage === "New & Popular"
                        ? "Discover trending titles, new releases, and movies in theaters."
                        : ""}
                </p>
              </section>
            )}

            {visibleSections.length > 0 ? (
              visibleSections.map((section) => (
                <Rows
                  key={section.title}
                  title={section.title}
                  fetchUrl={section.url}
                  isLargeRow={Boolean(section.large)}
                  onPlay={playTrailer}
                  onMoreInfo={openDetails}
                  onToggleList={toggleList}
                  isInList={isInList}
                  searchQuery={searchQuery}
                />
              ))
            ) : (
              <div className="status-message">
                No content is configured for this page yet. Check your
                requests.js configuration.
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {selectedMovie && (
        <div
          className="modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeDetails();
            }
          }}
        >
          <section
            className="modal-content title-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${getTitle(selectedMovie)} details`}
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close details"
              onClick={closeDetails}
            >
              <X size={23} />
            </button>

            {trailerKey ? (
              <div className="title-trailer">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0`}
                  title={`${getTitle(selectedMovie)} trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            ) : (
              <div
                className="title-modal-backdrop"
                style={{
                  backgroundImage: selectedMovie.backdrop_path
                    ? `url("${BACKDROP_BASE}${selectedMovie.backdrop_path}")`
                    : `url("${getImage(selectedMovie)}")`,
                }}
              />
            )}

            <div className="title-modal-body">
              <p className="title-modal-kicker">STREAMFLIX TITLE</p>
              <h2>{getTitle(selectedMovie)}</h2>

              <div className="title-modal-meta">
                {selectedMovie.vote_average > 0 && (
                  <span className="title-modal-rating">
                    <Star size={15} fill="currentColor" />
                    {Number(selectedMovie.vote_average).toFixed(1)} / 10
                  </span>
                )}

                {(selectedMovie.release_date ||
                  selectedMovie.first_air_date) && (
                  <span>
                    {(
                      selectedMovie.release_date ||
                      selectedMovie.first_air_date
                    ).slice(0, 4)}
                  </span>
                )}

                <span className="banner-quality">HD</span>
              </div>

              <p className="title-modal-overview">
                {selectedMovie.overview ||
                  "No description is available for this title."}
              </p>

              {trailerLoading && (
                <div className="status-message">
                  <div className="loading-spinner" />
                  Finding a trailer…
                </div>
              )}

              {trailerError && (
                <p className="title-modal-note" role="status">
                  {trailerError}
                </p>
              )}

              <div className="title-modal-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => playTrailer(selectedMovie)}
                  disabled={trailerLoading}
                >
                  <Play size={18} fill="currentColor" />
                  {trailerLoading ? "Loading…" : "Play Trailer"}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => toggleList(selectedMovie)}
                >
                  {isInList(selectedMovie) ? (
                    <Check size={18} />
                  ) : (
                    <Plus size={18} />
                  )}
                  {isInList(selectedMovie) ? "In My List" : "My List"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
