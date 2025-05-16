// react-vite/src/components/Footer/AboutFooter.jsx

import "./AboutFooter.css";

export default function AboutFooter() {
  return (
    <footer className="about-footer">
      <div className="footer-content">
        <p>
          Created by <strong>Shak Gillani</strong> — <a
            href="https://www.linkedin.com/in/shakeelgillani"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </p>
        <p>
          KnowBie © {new Date().getFullYear()} | A fun learning platform for kids
        </p>
        <p>
          <a href="/about">About this project</a>
        </p>
      </div>
    </footer>
  );
}
