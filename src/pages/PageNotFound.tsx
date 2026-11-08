import { Link } from "react-router";

import PageContent from "../components/PageContent";
import PageNav from "../components/PageNav";

export default function PageNotFound() {
  return (
    <div className="public-page">
      <PageNav />
      <PageContent className="not-found">
        <p className="eyebrow">404 / Off the beaten path</p>
        <h1>Page not found</h1>
        <p>This trail doesn’t lead anywhere. Let’s get you back on the map.</p>
        <Link tabIndex={0} className="cta" to="/">
          Back to home ↗
        </Link>
      </PageContent>
    </div>
  );
}
