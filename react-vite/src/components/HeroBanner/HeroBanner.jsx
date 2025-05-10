import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Lottie from "lottie-react";
import robotAnimation from "../../assets/CuteBear.json";  // ← adjust filename if you renamed it
import "./HeroBanner.css";

export default function HeroBanner() {
  const sessionUser = useSelector((st) => st.session.user);
  const [greeting, setGreeting] = useState("");

  // pick a greeting based on time
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);

  // capitalize the username or fallback to “there”
  const name = sessionUser
    ? sessionUser.username.charAt(0).toUpperCase() + sessionUser.username.slice(1)
    : "there";

  return (
    <div className="hero-banner">
      <div className="hero-text">
        <h1>{greeting}, {name}!</h1>
        <p>Ready to level up today?</p>
      </div>
      <div className="hero-animation">
        <Lottie animationData={robotAnimation} loop autoplay />
      </div>
    </div>
  );
}