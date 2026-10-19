import React, { useEffect, useState } from "react";
import { Play, Info, Volume2, VolumeX } from "lucide-react";
import axios from "../../axios";
import requests from "../../requests";
import "./Banner.css";

const IMAGE_BASE = "https://image.tmdb.org/t/p/original";

function truncate(text = "", maxLength = 200) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

function Banner({ onPlay, onMoreInfo }) {
  const [movie, setMovie] = useState(null);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchFeatured() {
      setLoading(true);

      try {
        const response = await axios.get(requests.fetchNetflixOriginals, {
          params: { page: 1 },
        });

        const results = (response.data.results || []).filter(
          (item) => item.backdrop_path && item.overview,
        );

        if (active && results.length) {
          const featured = results[Math.floor(Math.random() * results.length)];
          setMovie(featured);
        }
      } catch (error) {
        if (active) {
          console.error("Unable to load featured title:", error);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchFeatured();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="banner banner-loading" aria-label="Featured title">
        <div className="loading-spinner" />
        <span>Loading featured titles…</span>
      </section>
    );
  }

  if (!movie) {
    return (
      <section className="banner banner-empty" aria-label="Featured title">
        <div className="banner-content">
          <p className="banner-eyebrow">YOUR NEXT FAVORITE</p>
          <h1 className="banner-title">Discover something amazing.</h1>
          <p className="banner-description">
            Explore movies and series, discover new stories, and build your
            personal watchlist.
          </p>
        </div>
      </section>
    );
  }

  const title = movie.title || movie.name || movie.original_name;
  const year = (movie.release_date || movie.first_air_date || "").slice(0, 4);

  return (
    <section
      className="banner"
      aria-label={`Featured title: ${title}`}
      style={{
        backgroundImage: `url("${IMAGE_BASE}${movie.backdrop_path}")`,
      }}
    >
      <div className="banner-shade" />

      <div className="banner-content">
        <p className="banner-eyebrow">
          <span className="banner-n-mark">N</span>
          SERIES &amp; FILMS
        </p>

        <h1 className="banner-title">{title}</h1>

        <div className="banner-meta">
          {year && <span>{year}</span>}
          {movie.vote_average > 0 && (
            <span className="banner-rating">
              ★ {movie.vote_average.toFixed(1)} / 10
            </span>
          )}
          <span className="banner-quality">HD</span>
        </div>

        <p className="banner-description">{truncate(movie.overview, 220)}</p>

        <div className="banner-buttons">
          <button
            className="banner-button banner-button-play"
            type="button"
            onClick={() => onPlay?.(movie)}
          >
            <Play size={21} fill="currentColor" />
            Play Trailer
          </button>

          <button
            className="banner-button banner-button-info"
            type="button"
            onClick={() => onMoreInfo?.(movie)}
          >
            <Info size={21} />
            More Info
          </button>
        </div>
      </div>

      <button
        type="button"
        className="banner-sound"
        onClick={() => setMuted((value) => !value)}
        aria-label={muted ? "Sound is muted" : "Sound is enabled"}
        title={muted ? "Sound is muted" : "Sound is enabled"}
      >
        {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
      </button>

      <div className="banner-bottom-gradient" />
    </section>
  );
}

export default Banner;
