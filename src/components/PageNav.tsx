import { NavLink } from "react-router";

import Logo from "./Logo";
import styles from "./PageNav.module.css";

function PageNav() {
  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <Logo />

      <ul>
        <li>
          <NavLink tabIndex={0} to="/pricing">
            Pricing
          </NavLink>
        </li>
        <li>
          <NavLink tabIndex={0} to="/product">
            The journal
          </NavLink>
        </li>
        <li>
          <NavLink tabIndex={0} to="/login" className={styles.ctaLink}>
            Login
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default PageNav;
