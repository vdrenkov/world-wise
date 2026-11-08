import { Link } from "react-router";

import PageNav from "../components/PageNav";

export default function PageNotFound() {
  return (
    <div className="public-page">
      <PageNav />
      <section className="not-found">
        <p className="eyebrow">404 / Off the beaten path</p>
        <h1>Page not found</h1>
        <p>This trail doesn’t lead anywhere. Let’s get you back on the map.</p>
        <Link className="cta" to="/">
          Back to home ↗
        </Link>
      </section>
    </div>
  );
}
