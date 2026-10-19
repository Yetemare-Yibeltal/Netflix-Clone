import React, { useCallback, useEffect, useMemo, useState } from "react";
import { X, Play, Plus, Check, Star } from "lucide-react";
import axios from "./axios";
import Banner from "./Components/BannerSection/Banner";
import Nav from "./Components/NavSection/Nav";
import Rows from "./Components/Rows/Rows";
import Footer from "./Components/Footer/Footer";
import requests from "./requests";
import "./App.css";

const IMAGE_BASE = "https://image.tmdb.org/t/p/original";
const STORAGE_KEY = "streamflix-my-list";

const catalogSections = [
  { title: "Trending This Week", url: requests.fetchTrending },
  { title: "Popular Movies", url: requests.fetchPopularMovies },
  { title: "Popular TV Shows", url: requests.fetchPopularTV },
  {
    title: "Netflix Originals",
    url: requests.fetchNetflixOriginals,
    large: true,
  },
  { title: "Top Rated Movies", url: requests.fetchTopRatedMovies },
  { title: "Now Playing in Theaters", url: requests.fetchNowPlayingMovies },
  { title: "Action & Adventure", url: requests.fetchActionAdventure },
  { title: "Comedy Movies", url: requests.fetchComedyMovies },
  { title: "Crime Stories", url: requests.fetchCrimeMovies },
  { title: "Documentaries", url: requests.fetchDocumentaries },
  { title: "Drama", url: requests.fetchDramaMovies },
  { title: "Family Favorites", url: requests.fetchFamilyMovies },
  { title: "Fantasy Worlds", url: requests.fetchFantasyMovies },
  { title: "Horror", url: requests.fetchHorrorMovies },
  { title: "Mystery", url: requests.fetchMysteryMovies },
  { title: "Romance", url: requests.fetchRomanceMovies },
  { title: "Science Fiction", url: requests.fetchScienceFictionMovies },
  { title: "Thrillers", url: requests.fetchThrillerMovies },
  { title: "Animation", url: requests.fetchAnimationMovies },
  { title: "Historical Films", url: requests.fetchHistoryMovies },
  { title: "Upcoming Movies", url: requests.fetchUpcomingMovies },
  { title: "Top Rated TV Shows", url: requests.fetchTopRatedTV },
  { title: "TV Shows Airing Today", url: requests.fetchAiringTodayTV },
];

function readSavedList() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getTitle(item) {
  return item.title || item.name || item.original_name || "Untitled";
}

function App() {
  const [activePage, setActivePage] = useState("Home");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [savedList, setSavedList] = useState(readSavedList);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState("");
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedList));
    } catch (error) {
      console.error("Unable to save My List:", error);
    }
  }, [savedList]);

  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    setSearchError("");
  }, []);

  useEffect(() => {
    let active = true;

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError("");
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      setSearchLoading(true);

      try {
        const response = await axios.get("/search/multi", {
          params: { query: searchQuery, page: 1, include_adult: false },
        });

        if (!active) return;

        setSearchResults(
          (response.data.results || []).filter(
            (item) =>
              item.media_type !== "person" &&
              (item.poster_path || item.backdrop_path),
          ),
        );
        setSearchError("");
      } catch (error) {
        if (!active) return;
        console.error("Search failed:", error);
        setSearchResults([]);
        setSearchError("Search failed. Check your connection and try again.");
      } finally {
        if (active) setSearchLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  const toggleList = useCallback((movie) => {
    setSavedList((current) => {
      const exists = current.some((item) => item.id === movie.id);
      if (exists) {
        return current.filter((item) => item.id !== movie.id);
      }
      return [
        {
          ...movie,
          media_type:
            movie.media_type || (movie.first_air_date ? "tv" : "movie"),
        },
        ...current,
      ];
    });
  }, []);

  const isInList = useCallback(
    (movie) => savedList.some((item) => item.id === movie.id),
    [savedList],
  );

  const handleNavigate = useCallback((page) => {
    setActivePage(page);
    setSearchQuery("");
    setSelectedMovie(null);
    setTrailerKey("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const playTrailer = useCallback(async (movie) => {
    setSelectedMovie(movie);
    setTrailerKey("");
    setTrailerLoading(true);

    try {
      const mediaType =
        movie.media_type || (movie.first_air_date ? "tv" : "movie");

      const response = await axios.get(`/${mediaType}/${movie.id}/videos`);

      const videos = response.data.results || [];
      const trailer =
        videos.find(
          (video) =>
            video.site === "YouTube" &&
            video.type === "Trailer" &&
            video.official,
        ) ||
        videos.find(
          (video) => video.site === "YouTube" && video.type === "Trailer",
        ) ||
        videos.find((video) => video.site === "YouTube");

      setTrailerKey(trailer?.key || "");
    } catch (error) {
      console.error("Unable to load trailer:", error);
      setTrailerKey("");
    } finally {
      setTrailerLoading(false);
    }
  }, []);

  const visibleSections = useMemo(() => {
    if (activePage === "TV Shows") {
      return catalogSections.filter((section) =>
        /TV Shows|Netflix Originals|Trending|Top Rated TV/.test(section.title),
      );
    }

    if (activePage === "Movies") {
      return catalogSections.filter(
        (section) =>
          !/TV Shows Airing|Popular TV|Top Rated TV/.test(section.title),
      );
    }

    if (activePage === "New & Popular") {
      return catalogSections.filter((section) =>
        /Trending|Popular|Upcoming|Now Playing/.test(section.title),
      );
    }

    return catalogSections;
  }, [activePage]);

  const savedRows = useMemo(() => {
    if (activePage !== "My List") return [];
    return savedList;
  }, [activePage, savedList]);

  return (
    <div className="App">
      <Nav
        onSearch={handleSearch}
        onNavigate={handleNavigate}
        activePage={activePage}
      />

      <main className="app-main">
        {!searchQuery && activePage === "Home" && (
          <Banner onPlay={playTrailer} onMoreInfo={setSelectedMovie} />
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
              <div className="status-message error-message">{searchError}</div>
            ) : searchResults.length ? (
              <div className="app-results-grid">
                {searchResults.map((movie) => (
                  <article
                    className="app-result-card"
                    key={`${movie.media_type}-${movie.id}`}
                  >
                    <button
                      type="button"
                      className="app-result-poster"
                      onClick={() => setSelectedMovie(movie)}
                    >
                      <img
                        src={`${IMAGE_BASE}${movie.poster_path || movie.backdrop_path}`}
                        alt={getTitle(movie)}
                        loading="lazy"
                      />
                    </button>
                    <h2>{getTitle(movie)}</h2>
                    <div className="app-result-actions">
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
                        My List
                      </button>
                    </div>
                  </article>
                ))}
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

            {savedRows.length ? (
              <div className="app-results-grid">
                {savedRows.map((movie) => (
                  <article className="app-result-card" key={movie.id}>
                    <button
                      type="button"
                      className="app-result-poster"
                      onClick={() => setSelectedMovie(movie)}
                    >
                      {movie.poster_path || movie.backdrop_path ? (
                        <img
                          src={`${IMAGE_BASE}${movie.poster_path || movie.backdrop_path}`}
                          alt={getTitle(movie)}
                          loading="lazy"
                        />
                      ) : (
                        <span>{getTitle(movie)}</span>
                      )}
                    </button>
                    <h2>{getTitle(movie)}</h2>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => toggleList(movie)}
                    >
                      <X size={16} />
                      Remove
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="status-message">
                Your list is empty. Add titles using the plus button on a movie.
              </div>
            )}
          </section>
        ) : (
          visibleSections.map((section) => (
            <Rows
              key={section.title}
              title={section.title}
              fetchUrl={section.url}
              isLargeRow={section.large}
              onPlay={playTrailer}
              onMoreInfo={setSelectedMovie}
              onToggleList={toggleList}
              isInList={isInList}
            />
          ))
        )}
      </main>

      <Footer />

      {selectedMovie && (
        <div
          className="modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedMovie(null);
              setTrailerKey("");
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
              onClick={() => {
                setSelectedMovie(null);
                setTrailerKey("");
              }}
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
                    ? `url("${IMAGE_BASE}${selectedMovie.backdrop_path}")`
                    : undefined,
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
                    {selectedMovie.vote_average.toFixed(1)} / 10
                  </span>
                )}
                {(selectedMovie.release_date ||
                  selectedMovie.first_air_date) && (
                  <span>
                    {(
                      selectedMovie.release_date || selectedMovie.first_air_date
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

              {!trailerLoading && !trailerKey && (
                <p className="title-modal-note">
                  Select Play Trailer to look for an available trailer.
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
                  Play Trailer
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
