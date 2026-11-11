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
            This is a portfolio demo, open for you to try. Add places, explore
            the map, and make it your own. There are no payments or paid plans.
          </p>
          <p>
            Trips are saved in this browser’s local storage. Clearing site data
            removes them. Use a personal browser for your journal and avoid
            storing sensitive information on a shared device.
          </p>
          <Link tabIndex={0} className="cta" to="/login">
            Open the demo ↗
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
