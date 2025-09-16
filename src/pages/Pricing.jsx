import PageNav from "../components/PageNav";

// Uses the same styles as Product
import styles from "./Product.module.css";

export default function Product() {
  return (
    <main className={styles.product}>
      <PageNav />

      <section>
        <div>
          <h2>
            Simple pricing.
            <br />
            Just $9/month.
          </h2>
          <p>
            One flat rate, no surprises. For just $9 a month you can record
            every journey, upload unlimited stops, and access your interactive
            world map from any device. No hidden fees, no complicated tiers—just
            simple, unlimited adventure tracking.
          </p>
        </div>
        <img
          src="img-2.jpg"
          alt="An overview of a large city with skyscrapers."
        />
      </section>
    </main>
  );
}
