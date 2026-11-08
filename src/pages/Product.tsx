import { Link } from "react-router";

import PageNav from "../components/PageNav";
import styles from "./Product.module.css";

export default function Product() {
  return (
    <div className={styles.product}>
      <PageNav />
      <section>
        <img
          src="/img-1.jpg"
          alt="A traveller and a dog watching the sunset over the mountains"
          width="1000"
          height="1000"
        />
        <div>
          <p className="eyebrow">Less scrolling. More remembering.</p>
          <h1>A small home for big adventures.</h1>
          <p>
            WorldWise turns a world map into your personal travel journal. Pin a
            city, record when you visited, and write down what you want to
            remember.
          </p>
          <p>
            Your journal stays in this browser. There is no cloud account,
            sharing service, or cross-device sync. Map tiles and optional
            current-location naming use external providers.
          </p>
          <Link className="cta" to="/login">
            Make your first memory ↗
          </Link>
        </div>
      </section>
    </div>
  );
}
