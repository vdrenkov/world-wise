import PageNav from "../components/PageNav";
import styles from "./Product.module.css";

export default function Product() {
  return (
    <main className={styles.product}>
      <PageNav />

      <section>
        <img
          src="img-1.jpg"
          alt="A person with dog overlooking the mountain with a beautiful sunset."
        />
        <div>
          <h2>About WorldWide.</h2>
          <p>
            WorldWise is your personal travel companion—a place to capture the
            cities you've explored, the memories you've made, and the routes
            that connect them. Whether you're on a weekend getaway or a
            months-long journey, every stop is pinned to your interactive map so
            you'll never forget where life has taken you.
          </p>
          <p>
            Share your adventures with friends, revisit old trips, and plan the
            next one with ease. WorldWise works anywhere, on any device, so your
            travel story grows with you—beautifully organized and always at your
            fingertips.
          </p>
        </div>
      </section>
    </main>
  );
}
