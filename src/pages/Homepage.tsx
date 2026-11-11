import { Link } from "react-router";

import PageContent from "../components/PageContent";
import PageNav from "../components/PageNav";
import styles from "./Homepage.module.css";

export default function Homepage() {
  return (
    <div className="public-page">
      <PageNav />
      <PageContent className={styles.hero}>
        <div className={styles.copy}>
          <p className="eyebrow">Your personal travel journal</p>
          <h1>
            Go places.
            <br />
            Keep the <em>stories.</em>
          </h1>
          <p className={styles.lead}>
            The café you stumbled into. The view you still think about. Give
            every place a pin, and every memory a home.
          </p>
          <Link tabIndex={0} to="/login" className="cta">
            Start your journal <span aria-hidden="true">↗</span>
          </Link>
          <p className={styles.note}>Free to explore. Saved in your browser.</p>
        </div>
        <div className={styles.visual}>
          <img
            src="/background.jpg"
            alt="Two travellers looking out over a mountain valley"
            width="1920"
            height="1280"
            fetchPriority="high"
          />
          <div className={styles.imageLabel}>
            <span aria-hidden="true">◎</span> A little further from the
            everyday.
          </div>
          <div className={styles.postcard}>
            <span className="eyebrow">Field notes</span>
            <p>
              Some places
              <br />
              stay with you.
            </p>
            <span className={styles.postmark} aria-hidden="true">
              ↗
            </span>
          </div>
        </div>
      </PageContent>
      <section className={styles.features} aria-label="How your journal works">
        <article>
          <span>01 / EXPLORE</span>
          <h2>Follow your curiosity.</h2>
          <p>Find a place on the world map, or add it by coordinates.</p>
        </article>
        <article>
          <span>02 / REMEMBER</span>
          <h2>Save the little things.</h2>
          <p>
            A date, a city, a few words. Keep the moments that made it yours.
          </p>
        </article>
        <article>
          <span>03 / REVISIT</span>
          <h2>See your world grow.</h2>
          <p>Browse your places and countries, one memory at a time.</p>
        </article>
      </section>
      <footer className={styles.footer}>
        <span>For the love of getting a little lost.</span>
        <span>WorldWise · A browser-based travel journal</span>
      </footer>
    </div>
  );
}
