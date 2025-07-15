import React from "react";
import { Link } from "gatsby";
import { useLocation } from "@reach/router";

const Layout = (props) => {
  const data = useLocation();
  const { title, children } = props;
  // const path = props&&props.location&&props.location

  const [toggleNav, setToggleNav] = React.useState(false);
  return (
    <div className={`site-wrapper ${toggleNav ? `site-head-open` : ``}`}>
      <header className="site-head">
        <div className="site-head-container">
          <button
            className="nav-burger"
            type="button"
            onClick={() => setToggleNav(!toggleNav)}
            aria-label="Menu"
            aria-controls="navigation"
            aria-expanded={toggleNav}
          >
            <div className="hamburger hamburger--collapse">
              <div className="hamburger-box">
                <div className="hamburger-inner" />
              </div>
            </div>
          </button>

          <nav id="swup" className="site-head-left">
            <ul className="nav">
              <li className={`nav-home  ${data.pathname === "/" ? "nav-current" : ""} `}>
                <Link to={`/`}>Home</Link>
              </li>
              
              <li className={`nav-home  ${data.pathname.includes("/bio") ? "nav-current" : ""} `}>
                <Link to={`/bio`}>Bio</Link>
              </li>
              
              <li className={`nav-home  ${data.pathname.includes("/work") ? "nav-current" : ""} `}>
                <Link to={`/work`}>Work</Link>
              </li>
              
              <li className={`nav-home  ${data.pathname.includes("/blog") ? "nav-current" : ""} `}>
                <Link to={`/blog`}>Blog</Link>
              </li>
              
              <li className={`nav-home  ${data.pathname.includes("/contact") ? "nav-current" : ""} `}>
                <Link to={`/contact`}>Contact</Link>
              </li>
            </ul>
          </nav>

          <div className="site-head-center">
            <Link className="site-head-logo" to={`/`}>
              {title}
            </Link>
          </div>

          <div className="site-head-right">
            <div className="social-links">
              <a href={`https://www.facebook.com/markvbaustin`} title="Facebook" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
           
              <a href={`https://instagram.com/mark.vb.austin`} title="Instagram" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </div>
          </div>

        </div>
      </header>

      <main id="site-main" className=" container-fluid site-main">
        <div id="swup" className="transition-fade row">
          <div className="col">
            {children}
          </div>
        </div>
      </main>

      <footer className="site-foot">
        &copy; {new Date().getFullYear()} {title} &mdash;
        Built by {""}
        <a
          href="https://markaustin.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          Mark Austin.dev
        </a>
      </footer>
    </div>
  );
};

export default Layout;
