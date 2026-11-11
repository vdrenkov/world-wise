import { Link } from "react-router";

import PageContent from "../components/PageContent";
import PageNav from "../components/PageNav";
import styles from "./Product.module.css";

export default function Pricing() {
  return (
    <div className={`public-page ${styles.product}`}>
      <PageNav />
      <PageContent>
        <div>
          <p className="eyebrow">No subscription. Just stories.</p>
          <h1>Free to explore.</h1>
          <p>
            Keep your travel memories in one place. Pin cities, revisit your
            notes and see where you’ve been.
          </p>
          <p>
            Your journal stays on this device, ready for the next adventure.
          </p>
          <Link tabIndex={0} className="cta" to="/login">
            Open your journal ↗
          </Link>
        </div>
        <img
          src="/img-2.jpg"
          alt="A city skyline filled with places to explore"
          width="1000"
          height="1000"
        />
      </PageContent>
    </div>
  );
}
