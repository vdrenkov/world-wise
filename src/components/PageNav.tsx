import { NavLink } from "react-router";

import Logo from "./Logo";
import styles from "./PageNav.module.css";

function PageNav() {
  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <Logo />

      <ul>
        <li>
          <NavLink to="/pricing">Free demo</NavLink>
        </li>
        <li>
          <NavLink to="/product">The journal</NavLink>
        </li>
        <li>
          <NavLink to="/login" className={styles.ctaLink}>
            Login
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default PageNav;
