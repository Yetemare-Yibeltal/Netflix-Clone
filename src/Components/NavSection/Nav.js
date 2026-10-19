
import React, { useEffect, useState } from "react";
import { Search, X, Film, Bookmark } from "lucide-react";
import "./Nav.css";

function Nav({ onSearch, onNavigate, activePage = "Home" }) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

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
  };

  const toggleSearch = () => {
    setSearchOpen((open) => {
      if (open) {
        setSearchTerm("");
        if (onSearch) onSearch("");
      }
      return !open;
    });
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
          {["Home", "TV Shows", "Movies", "New & Popular"].map((page) => (
            <button
              key={page}
              type="button"
              className={`nav-link ${activePage === page ? "active" : ""}`}
              onClick={() => navigate(page)}
              aria-current={activePage === page ? "page" : undefined}
            >
              {page}
            </button>
          ))}
        </nav>
        <div className="nav-genres">
          <label htmlFor="nav-genre">Browse Genres</label>
          <select
            id="nav-genre"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value && onNavigate) {
                onNavigate(`Genre:${event.target.value}`);
              }
            }}
          >
            <option value="" disabled>
              Genres
            </option>
            <option value="28">Action</option>
            <option value="12">Adventure</option>
            <option value="16">Animation</option>
            <option value="35">Comedy</option>
            <option value="80">Crime</option>
            <option value="99">Documentary</option>
            <option value="18">Drama</option>
            <option value="14">Fantasy</option>
            <option value="27">Horror</option>
            <option value="9648">Mystery</option>
            <option value="10749">Romance</option>
            <option value="878">Science Fiction</option>
            <option value="53">Thriller</option>
          </select>
        </div>

        <div className="nav-actions">
          <div className={`nav-search ${searchOpen ? "search-open" : ""}`}>
            {searchOpen && (
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Titles, people, genres"
                aria-label="Search movies and TV shows"
                autoFocus
              />
            )}

            <button
              type="button"
              className="nav-icon-button"
              onClick={toggleSearch}
              aria-label={searchOpen ? "Close search" : "Open search"}
            >
              {searchOpen ? <X size={21} /> : <Search size={21} />}
            </button>
          </div>

          <button
            type="button"
            className="nav-list-button"
            onClick={() => navigate("My List")}
          >
            <Bookmark size={18} />
            <span>My List</span>
          </button>

          <button
            type="button"
            className="nav-profile"
            onClick={() => navigate("My List")}
            aria-label="Open your profile and saved list"
          >
            <Film size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Nav;
