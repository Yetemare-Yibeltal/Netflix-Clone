import React, { useState } from "react";
import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  ChevronDown,
} from "lucide-react";
import "./Footer.css";

const footerGroups = [
  [
    { label: "Audio Description", href: "#audio-description" },
    { label: "Investor Relations", href: "#investor-relations" },
    { label: "Legal Notices", href: "#legal-notices" },
  ],
  [
    { label: "Help Center", href: "#help-center" },
    { label: "Jobs", href: "#jobs" },
    { label: "Cookie Preferences", href: "#cookie-preferences" },
  ],
  [
    { label: "Gift Cards", href: "#gift-cards" },
    { label: "Terms of Use", href: "#terms" },
    { label: "Corporate Information", href: "#corporate" },
  ],
  [
    { label: "Media Center", href: "#media-center" },
    { label: "Privacy", href: "#privacy" },
    { label: "Contact Us", href: "#contact" },
  ],
];

function Footer() {
  const [language, setLanguage] = useState("en");

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-socials" aria-label="Social media">
          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
          >
            <Facebook size={22} />
          </a>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <Instagram size={22} />
          </a>
          <a
            href="https://www.youtube.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
          >
            <Youtube size={23} />
          </a>
          <a
            href="https://x.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="X"
          >
            <Twitter size={21} />
          </a>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          {footerGroups.map((group, index) => (
            <ul key={index}>
              {group.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          ))}
        </nav>

        <button
          className="footer-service-code"
          type="button"
          onClick={() => {
            const code = `STREAM-${Math.random()
              .toString(36)
              .slice(2, 8)
              .toUpperCase()}`;
            window.prompt("Your service code", code);
          }}
        >
          Service Code
        </button>

        <div className="footer-language">
          <label htmlFor="footer-language">Language</label>
          <div className="footer-language-select">
            <select
              id="footer-language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="en">English</option>
              <option value="am">አማርኛ</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>
            <ChevronDown size={15} aria-hidden="true" />
          </div>
        </div>

        <p className="footer-brand">STREAMFLIX</p>
        <p className="footer-copyright">
          © {new Date().getFullYear()} Streamflix. Built for entertainment
          discovery.
        </p>
        <p className="footer-disclaimer">
          This is an independent demonstration project and is not affiliated
          with or endorsed by Netflix. Movie metadata and images are provided by
          TMDB.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
