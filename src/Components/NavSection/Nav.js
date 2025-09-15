import React, { useEffect, useState } from "react";
import "../NavSection/Nav.css";

function Nav() {
  const [show, handleShow] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        handleShow(true);
      } else {
        handleShow(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div className={`nav ${show && "nav-black"}`}>
      <img
        className="nav-logo"
        src="https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png"
      ></img>
      <img
        className="nav-avatar"
        src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/atlassian-rovo-icon.png"
      ></img>
    </div>
  );
}

export default Nav;
