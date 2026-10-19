import React, { useEffect, useState } from "react";
import {
  Search,
  X,
  Film,
  Bookmark,
  ChevronDown,
} from "lucide-react";
import "./Nav.css";

const GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 53, name: "Thriller" },
  { id: 10751, name: "Family" },
  { id: 36, name: "History" },
];

function Nav({
  onSearch,
  onNavigate,
  activePage = "Home",
}) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!onSearch) return;

    const timer = window.setTimeout(() => {
      onSearch(searchTerm.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const navigate = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
    setProfileOpen(false);
  };

  const toggleSearch = () => {
    if (searchOpen) {
      setSearchTerm("");
      if (onSearch) onSearch("");
    }

    setSearchOpen((open) => !open);
  };

  const handleGenreChange = (event) => {
    const genreId = event.target.value;

    if (!genreId) return;

    const genre = GENRES.find(
      (item) => String(item.id) === genreId
    );

    setSelectedGenre("");

    if (genre && onNavigate) {
      onNavigate(`Genre:${genre.id}`);
    }
  };

  return (
    <header className={`nav ${scrolled ? "nav-black" : ""}`}>
      <div className="nav-inner">
        <button
          className="nav-brand"
          type="button"
          onClick={() => navigate("Home")}
          aria-label="Go to home"
        >
          <span className="nav-brand-mark">N</span>
          <span className="nav-brand-name">STREAMFLIX</span>
        </button>

        <nav className="nav-links" aria-label="Main navigation">
          {["Home", "TV Shows", "Movies", "New & Popular"].map(
            (page) => (
              <button
                key={page}
                type="button"
                className={`nav-link ${
                  activePage === page ? "active" : ""
                }`}
                onClick={() => navigate(page)}
                aria-current={
                  activePage === page ? "page" : undefined
                }
              >
                {page}
              </button>
            )
          )}
        </nav>

        <div className="nav-genres">
          <label htmlFor="nav-genre">Browse genres</label>

          <div className="nav-genre-control">
            <select
              id="nav-genre"
              value={selectedGenre}
              onChange={handleGenreChange}
              aria-label="Browse movies by genre"
            >
              <option value="">Browse Genres</option>

              {GENRES.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>

            <ChevronDown
              className="nav-genre-chevron"
              size={15}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="nav-actions">
          <div
            className={`nav-search ${
              searchOpen ? "search-open" : ""
            }`}
          >
            {searchOpen && (
              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Titles, people, genres"
                aria-label="Search movies and TV shows"
                autoFocus
              />
            )}

            <button
              type="button"
              className="nav-icon-button"
              onClick={toggleSearch}
              aria-label={
                searchOpen ? "Close search" : "Open search"
              }
            >
              {searchOpen ? (
                <X size={21} />
              ) : (
                <Search size={21} />
              )}
            </button>
          </div>

          <button
            type="button"
            className="nav-list-button"
            onClick={() => navigate("My List")}
            aria-label="Open My List"
          >
            <Bookmark size={18} />
            <span>My List</span>
          </button>

          <div className="nav-profile-wrapper">
            <button
              type="button"
              className="nav-profile"
              onClick={() => setProfileOpen((open) => !open)}
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
            >
              <Film size={20} />
            </button>

            {profileOpen && (
              <div className="nav-profile-menu">
                <button
                  type="button"
                  onClick={() => navigate("My List")}
                >
                  <Bookmark size={16} />
                  My List
                </button>

                <button
                  type="button"
                  onClick={() => navigate("Home")}
                >
                  <Film size={16} />
                  Browse titles
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Nav;
