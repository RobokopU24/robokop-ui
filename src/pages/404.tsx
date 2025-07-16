import React from "react";
import Logo from "../components/Logo";
import { Link } from "@tanstack/react-router";

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#5e5e5e",
        background: "#f5f7fa",
        borderRadius: 16,
        boxShadow: "0 2px 16px 0 #e0e0e0",
        margin: "40px auto",
        maxWidth: 500,
        padding: 32,
      }}
    >
      <Logo style={{ width: 180, height: 30, marginBottom: 32 }} />
      <h1 style={{ fontSize: 48, margin: 0, fontWeight: 500, letterSpacing: 2 }}>404</h1>
      <p style={{ fontSize: 16, margin: "16px 0 32px 0", textAlign: "center" }}>
        Oops! The page you are looking for does not exist.
        <br />
        Let's get you back on track.
      </p>
      <Link to="/" style={{ textDecoration: "none" }}>
        <button
          style={{
            background: "linear-gradient(90deg, #24CAFF 0%, #8D47FF 100%)",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "12px 32px",
            fontSize: 18,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px 0 #b3b3b3",
            transition: "background 0.2s",
          }}
        >
          Go Home
        </button>
      </Link>
    </div>
  );
};

export default NotFound;
