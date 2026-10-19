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
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchFeatured() {
      setLoading(true);
      setLoadError(false);

      try {
        const response = await axios.get(requests.fetchNetflixOriginals, {
          params: { page: 1 },
        });

        const results = (response.data.results || []).filter(
          (item) => item.backdrop_path && item.overview,
        );

        if (active && results.length > 0) {
          const featured =
            results[Math.floor(Math.random() * results.length)];

          setMovie(featured);
        } else if (active) {
          setMovie(null);
          setLoadError(true);
        }
      } catch (error) {
        if (active) {
          console.error("Unable to load featured title:", error);
          setMovie(null);
          setLoadError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchFeatured();

    return () => {
      active = false;
    };
  }, []);

  const handlePlay = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!movie) return;

    if (typeof onPlay === "function") {
      onPlay(movie);
    } else {
      console.error(
        "Banner: onPlay was not provided. Check the Banner props in App.js.",
      );
    }
  };

  const handleMoreInfo = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!movie) return;

    if (typeof onMoreInfo === "function") {
      onMoreInfo(movie);
    } else {
      console.error(
        "Banner: onMoreInfo was not provided. Check the Banner props in App.js.",
      );
    }
  };

  const handleSoundToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setMuted((previousMuted) => !previousMuted);
  };

  if (loading) {
    return (
      <section
        className="banner banner-loading"
        aria-label="Featured title"
      >
        <div className="loading-spinner" />
        <span>Loading featured titles…</span>
      </section>
    );
  }

  if (!movie) {
    return (
      <section
        className="banner banner-empty"
        aria-label="Featured title"
      >
        <div className="banner-content">
          <p className="banner-eyebrow">YOUR NEXT FAVORITE</p>
          <h1 className="banner-title">Discover something amazing.</h1>
          <p className="banner-description">
            {loadError
              ? "Featured titles could not be loaded. Please check your connection and try again."
              : "Explore movies and series, discover new stories, and build your personal watchlist."}
          </p>
        </div>
      </section>
    );
  }

  const title =
    movie.title || movie.name || movie.original_name || "Featured title";

  const year = (
    movie.release_date ||
    movie.first_air_date ||
    ""
  ).slice(0, 4);

  return (
    <section
      className="banner"
      aria-label={`Featured title: ${title}`}
      style={{
        backgroundImage: `url("${IMAGE_BASE}${movie.backdrop_path}")`,
        cursor: "default",
      }}
    >
      <div className="banner-shade" aria-hidden="true" />

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

        <p className="banner-description">
          {truncate(movie.overview, 220)}
        </p>

        <div className="banner-buttons">
          <button
            className="banner-button banner-button-play"
            type="button"
            onClick={handlePlay}
            aria-label={`Play trailer for ${title}`}
            title="Play trailer"
          >
            <Play size={21} fill="currentColor" />
            Play Trailer
          </button>

          <button
            className="banner-button banner-button-info"
            type="button"
            onClick={handleMoreInfo}
            aria-label={`More information about ${title}`}
            title="More info"
          >
            <Info size={21} />
            More Info
          </button>
        </div>
      </div>

      <button
        type="button"
        className="banner-sound"
        onClick={handleSoundToggle}
        aria-label={muted ? "Enable sound" : "Mute sound"}
        aria-pressed={!muted}
        title={muted ? "Enable sound" : "Mute sound"}
      >
        {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
      </button>

      <div className="banner-bottom-gradient" aria-hidden="true" />
    </section>
  );
}

export default Banner;