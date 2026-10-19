import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Play,
  Plus,
  Check,
  Info,
  RotateCw,
} from "lucide-react";

import axios from "../../axios";
import "./Rows.css";

const POSTER_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/w780";

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="750">
      <rect width="100%" height="100%" fill="#202020"/>
      <text
        x="50%"
        y="48%"
        fill="#aaaaaa"
        font-family="Arial, sans-serif"
        font-size="28"
        text-anchor="middle"
      >StreamFlix</text>
      <text
        x="50%"
        y="55%"
        fill="#777777"
        font-family="Arial, sans-serif"
        font-size="18"
        text-anchor="middle"
      >Image unavailable</text>
    </svg>
  `);

function getTitle(movie) {
  return (
    movie?.title ||
    movie?.name ||
    movie?.original_name ||
    "Untitled"
  );
}

function getYear(movie) {
  const date =
    movie?.release_date ||
    movie?.first_air_date ||
    "";

  return date ? date.slice(0, 4) : "";
}

function getImage(movie, isLargeRow) {
  if (isLargeRow && movie?.poster_path) {
    return `${POSTER_BASE}${movie.poster_path}`;
  }

  if (movie?.backdrop_path) {
    return `${BACKDROP_BASE}${movie.backdrop_path}`;
  }

  if (movie?.poster_path) {
    return `${POSTER_BASE}${movie.poster_path}`;
  }

  return FALLBACK_IMAGE;
}

function getMediaType(movie) {
  return (
    movie?.media_type ||
    (movie?.first_air_date ? "tv" : "movie")
  );
}

function MovieImage({ movie, isLargeRow, title }) {
  const [src, setSrc] = useState(() =>
    getImage(movie, isLargeRow)
  );

  useEffect(() => {
    setSrc(getImage(movie, isLargeRow));
  }, [
    movie?.poster_path,
    movie?.backdrop_path,
    isLargeRow,
  ]);

  return (
    <img
      className="movie-poster"
      src={src}
      alt={title}
      loading="lazy"
      decoding="async"
      onError={() => {
        setSrc((current) =>
          current === FALLBACK_IMAGE
            ? current
            : FALLBACK_IMAGE
        );
      }}
    />
  );
}

function Rows({
  title,
  fetchUrl,
  isLargeRow = false,
  onPlay,
  onMoreInfo,
  onToggleList,
  isInList,
  searchQuery = "",
}) {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // Changing this value triggers a new request when Retry is clicked.
  const [retryCount, setRetryCount] = useState(0);

  const rowRef = useRef(null);
  const requestId = useRef(0);
  const controllerRef = useRef(null);

  // Load a page of movies. Abort any older request first.
  const loadMovies = useCallback(
    async (pageNumber, append = false) => {
      if (!fetchUrl) {
        setMovies([]);
        setError("This collection has no configured TMDB URL.");
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      controllerRef.current?.abort();

      const controller = new AbortController();
      controllerRef.current = controller;

      const id = ++requestId.current;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError("");
      }

      try {
        const response = await axios.get(fetchUrl, {
          params: {
            page: pageNumber,
          },
          signal: controller.signal,
        });

        if (
          id !== requestId.current ||
          controller.signal.aborted
        ) {
          return;
        }

        const results = Array.isArray(response.data?.results)
          ? response.data.results
          : [];

        setMovies((current) => {
          if (!append) {
            return results;
          }

          const seen = new Set(
            current.map(
              (movie) => `${getMediaType(movie)}-${movie.id}`
            )
          );

          const newMovies = results.filter((movie) => {
            const key = `${getMediaType(movie)}-${movie.id}`;

            if (seen.has(key)) {
              return false;
            }

            seen.add(key);
            return true;
          });

          return [...current, ...newMovies];
        });

        setPage(pageNumber);

        setTotalPages(
          Math.min(
            Math.max(Number(response.data?.total_pages) || 1, 1),
            500
          )
        );

        setError("");
      } catch (err) {
        if (
          id !== requestId.current ||
          controller.signal.aborted ||
          err.code === "ERR_CANCELED" ||
          err.name === "CanceledError"
        ) {
          return;
        }

        console.error(`Unable to load ${title}:`, err);

        if (!append) {
          setMovies([]);
        }

        setError(
          append
            ? "Unable to load more titles. Please try again."
            : "This collection couldn't load. Check your connection and try again."
        );
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [fetchUrl, title]
  );

  // Load the first page whenever this row's URL or retry changes.
  useEffect(() => {
    setMovies([]);
    setPage(1);
    setTotalPages(1);
    setError("");
    setLoading(true);
    setLoadingMore(false);

    loadMovies(1, false);

    return () => {
      controllerRef.current?.abort();
      requestId.current += 1;
    };
  }, [loadMovies, retryCount]);

  // Scroll horizontally through the row.
  const scrollRow = useCallback((direction) => {
    if (!rowRef.current) return;

    rowRef.current.scrollBy({
      left: direction * rowRef.current.clientWidth * 0.85,
      behavior: "smooth",
    });
  }, []);

  // Load the next page.
  const loadMore = useCallback(() => {
    if (
      loadingMore ||
      loading ||
      page >= totalPages
    ) {
      return;
    }

    loadMovies(page + 1, true);
  }, [
    loadingMore,
    loading,
    page,
    totalPages,
    loadMovies,
  ]);

  const filteredMovies = searchQuery.trim()
    ? movies.filter((movie) =>
        getTitle(movie)
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase())
      )
    : movies;

  // Initial loading state.
  if (loading && movies.length === 0) {
    return (
      <section
        className="row-section"
        aria-label={title}
        aria-busy="true"
      >
        <div className="row-heading">
          <h2 className="row-title">{title}</h2>
        </div>

        <div
          className={`row-posters ${
            isLargeRow ? "row-posters-large" : ""
          }`}
        >
          {Array.from({ length: 8 }, (_, index) => (
            <div
              className="movie-skeleton"
              key={`skeleton-${index}`}
              aria-hidden="true"
            />
          ))}
        </div>
      </section>
    );
  }

  // Initial request failed.
  if (error && movies.length === 0) {
    return (
      <section className="row-section" aria-label={title}>
        <h2 className="row-title">{title}</h2>

        <div className="row-status" role="alert">
          <p>{error}</p>

          <button
            className="row-retry-button"
            type="button"
            onClick={() =>
              setRetryCount((count) => count + 1)
            }
          >
            <RotateCw size={16} />
            Retry
          </button>
        </div>
      </section>
    );
  }

  // No movies were returned, or the current filter matches none.
  if (filteredMovies.length === 0) {
    return (
      <section className="row-section" aria-label={title}>
        <h2 className="row-title">{title}</h2>

        <div className="row-status">
          {searchQuery.trim()
            ? "No matching titles in this collection."
            : "No titles found in this collection."}
        </div>
      </section>
    );
  }

  return (
    <section
      className="row-section"
      aria-label={title}
      aria-busy={loadingMore}
    >
      <div className="row-heading">
        <h2 className="row-title">{title}</h2>

        <div className="row-controls">
          <button
            type="button"
            className="row-arrow"
            onClick={() => scrollRow(-1)}
            aria-label={`Scroll ${title} left`}
            title="Scroll left"
          >
            <ChevronLeft size={23} />
          </button>

          <button
            type="button"
            className="row-arrow"
            onClick={() => scrollRow(1)}
            aria-label={`Scroll ${title} right`}
            title="Scroll right"
          >
            <ChevronRight size={23} />
          </button>
        </div>
      </div>

      <div
        ref={rowRef}
        className={`row-posters ${
          isLargeRow ? "row-posters-large" : ""
        }`}
      >
        {filteredMovies.map((movie) => {
          const titleText = getTitle(movie);
          const saved = Boolean(isInList?.(movie));

          return (
            <article
              className="movie-card"
              key={`${getMediaType(movie)}-${movie.id}`}
            >
              <button
                type="button"
                className="movie-card-image-button"
                onClick={() => onMoreInfo?.(movie)}
                aria-label={`More information about ${titleText}`}
              >
                <MovieImage
                  movie={movie}
                  isLargeRow={isLargeRow}
                  title={titleText}
                />
              </button>

              <div className="movie-card-overlay">
                <div className="movie-card-actions">
                  <button
                    type="button"
                    className="movie-action movie-action-play"
                    onClick={() => onPlay?.(movie)}
                    aria-label={`Play trailer for ${titleText}`}
                    title="Play trailer"
                  >
                    <Play size={16} fill="currentColor" />
                  </button>

                  <button
                    type="button"
                    className="movie-action"
                    onClick={() => onToggleList?.(movie)}
                    aria-label={
                      saved
                        ? `Remove ${titleText} from My List`
                        : `Add ${titleText} to My List`
                    }
                    title={
                      saved
                        ? "Remove from My List"
                        : "Add to My List"
                    }
                  >
                    {saved ? (
                      <Check size={17} />
                    ) : (
                      <Plus size={17} />
                    )}
                  </button>

                  <button
                    type="button"
                    className="movie-action movie-action-info"
                    onClick={() => onMoreInfo?.(movie)}
                    aria-label={`Details for ${titleText}`}
                    title="More information"
                  >
                    <Info size={16} />
                  </button>
                </div>

                <h3 className="movie-card-title">
                  {titleText}
                </h3>

                <div className="movie-card-meta">
                  {movie.vote_average > 0 && (
                    <span className="movie-rating">
                      ★ {Number(movie.vote_average).toFixed(1)}
                    </span>
                  )}

                  {getYear(movie) && (
                    <span>{getYear(movie)}</span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {error && movies.length > 0 && (
        <div className="row-status" role="alert">
          <p>{error}</p>

          <button
            className="row-retry-button"
            type="button"
            onClick={() => loadMovies(page + 1, true)}
            disabled={loadingMore}
          >
            <RotateCw size={16} />
            Retry loading more
          </button>
        </div>
      )}

      {page < totalPages && (
        <div className="row-load-more">
          <button
            type="button"
            className="row-more-button"
            onClick={loadMore}
            disabled={loadingMore || loading}
          >
            {loadingMore ? (
              <>
                <RotateCw size={16} />
                Loading more titles…
              </>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
    </section>
  );
}

export default Rows;