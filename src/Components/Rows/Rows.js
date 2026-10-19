import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Plus,
  Check,
  Info,
} from "lucide-react";
import axios from "../../axios";
import "./Rows.css";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

function getTitle(movie) {
  return movie.title || movie.name || movie.original_name || "Untitled";
}

function getYear(movie) {
  const date = movie.release_date || movie.first_air_date || "";
  return date ? date.slice(0, 4) : "";
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
  const rowRef = useRef(null);
  const requestId = useRef(0);

  const loadMovies = useCallback(
    async (pageNumber, append = false) => {
      const id = ++requestId.current;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError("");
      }

      try {
        const response = await axios.get(fetchUrl, {
          params: { page: pageNumber },
        });

        if (id !== requestId.current) return;

        const results = response.data.results || [];

        setMovies((current) => {
          if (!append) return results;

          const seen = new Set(current.map((movie) => movie.id));
          return [
            ...current,
            ...results.filter((movie) => !seen.has(movie.id)),
          ];
        });

        setPage(pageNumber);
        setTotalPages(Math.min(response.data.total_pages || 1, 500));
      } catch (err) {
        if (id !== requestId.current) return;

        console.error(`Unable to load ${title}:`, err);

        if (!append) {
          setMovies([]);
          setError("This collection couldn't load. Please try again.");
        }
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [fetchUrl, title],
  );

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setTotalPages(1);
    setLoading(true);
    loadMovies(1);

    return () => {
      requestId.current += 1;
    };
  }, [loadMovies]);

  const scrollRow = (direction) => {
    if (!rowRef.current) return;

    rowRef.current.scrollBy({
      left: direction * rowRef.current.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  const loadMore = () => {
    if (loadingMore || loading || page >= totalPages) return;
    loadMovies(page + 1, true);
  };

  const filteredMovies = searchQuery
    ? movies.filter((movie) =>
        getTitle(movie).toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : movies;

  if (!loading && error && movies.length === 0) {
    return (
      <section className="row-section">
        <h2 className="row-title">{title}</h2>
        <div className="row-status">
          <p>{error}</p>
          <button
            className="row-retry-button"
            type="button"
            onClick={() => loadMovies(1)}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!loading && filteredMovies.length === 0) {
    return (
      <section className="row-section">
        <h2 className="row-title">{title}</h2>
        <div className="row-status">
          {loading ? "Loading titles…" : "No titles found in this collection."}
        </div>
      </section>
    );
  }

  return (
    <section className="row-section" aria-label={title}>
      <div className="row-heading">
        <h2 className="row-title">{title}</h2>
        <div className="row-controls">
          <button
            type="button"
            className="row-arrow"
            onClick={() => scrollRow(-1)}
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft size={23} />
          </button>
          <button
            type="button"
            className="row-arrow"
            onClick={() => scrollRow(1)}
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight size={23} />
          </button>
        </div>
      </div>

      <div
        ref={rowRef}
        className={`row-posters ${isLargeRow ? "row-posters-large" : ""}`}
      >
        {loading && movies.length === 0
          ? Array.from({ length: 8 }, (_, index) => (
              <div
                className="movie-skeleton"
                key={`skeleton-${index}`}
                aria-hidden="true"
              />
            ))
          : filteredMovies.map((movie) => {
              const titleText = getTitle(movie);
              const saved = Boolean(isInList?.(movie));

              const poster = isLargeRow
                ? movie.poster_path
                : movie.backdrop_path || movie.poster_path;

              if (!poster) return null;

              return (
                <article className="movie-card" key={movie.id}>
                  <button
                    type="button"
                    className="movie-card-image-button"
                    onClick={() => onMoreInfo?.(movie)}
                    aria-label={`More information about ${titleText}`}
                  >
                    <img
                      className="movie-poster"
                      src={`${IMAGE_BASE}${poster}`}
                      alt={titleText}
                      loading="lazy"
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
                        title={saved ? "Remove from My List" : "Add to My List"}
                      >
                        {saved ? <Check size={17} /> : <Plus size={17} />}
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

                    <h3 className="movie-card-title">{titleText}</h3>

                    <div className="movie-card-meta">
                      {movie.vote_average > 0 && (
                        <span className="movie-rating">
                          ★ {movie.vote_average.toFixed(1)}
                        </span>
                      )}
                      {getYear(movie) && <span>{getYear(movie)}</span>}
                    </div>
                  </div>
                </article>
              );
            })}
      </div>

      {page < totalPages && (
        <div className="row-load-more">
          <button
            type="button"
            className="row-more-button"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading more titles…" : "Load More"}
          </button>
        </div>
      )}
    </section>
  );
}

export default Rows;
