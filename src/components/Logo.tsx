import { Link } from "react-router";

import styles from "./Logo.module.css";

export default function Logo() {
  return (
    <Link
      tabIndex={0}
      to="/"
      className={styles.logo}
      aria-label="WorldWise home"
    >
      <svg
        viewBox="0 0 40 40"
        width="36"
        height="36"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="20"
          cy="20"
          r="17"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <ellipse
          cx="20"
          cy="20"
          rx="8"
          ry="17"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M4 14h32M4 26h32M3 20h34"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      <span>worldwise.</span>
    </Link>
  );
}
