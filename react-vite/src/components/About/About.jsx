// react-vite/src/components/About/About.jsx

import "./About.css";

export default function About() {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1>About KnowBie</h1>
        <p>
          KnowBie is an interactive learning platform designed to help students strengthen their knowledge through engaging quizzes and personalized feedback. Instructors can create quizzes, assign them to students or classes, and track progress through dashboards.
        </p>

        <h2>Creator</h2>
        <p>
          This project was created by <strong>Shak Gillani</strong>. You can connect with me on <a href="https://www.linkedin.com/in/shakeel-gillani-4a11515b/" target="_blank" rel="noreferrer">LinkedIn</a>.
        </p>

        <h2>Technologies Used</h2>
        <ul>
          <li>React</li>
          <li>Redux</li>
          <li>Flask</li>
          <li>SQLAlchemy</li>
          <li>PostgreSQL</li>
          <li>Render for deployment</li>
        </ul>

        <h2>Live Site & Repo</h2>
        <ul>
          <li>Live: <a href="https://finalproject-xl5u.onrender.com" target="_blank" rel="noreferrer">https://finalproject-xl5u.onrender.com</a></li>
          <li>GitHub: <a href="https://github.com/shakgill786/FinalProject" target="_blank" rel="noreferrer">https://github.com/shakgill786/FinalProject</a></li>
        </ul>
      </div>
    </div>
  );
}
