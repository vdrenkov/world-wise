import { useNavigate } from "react-router";

import { useAuth } from "../contexts/FakeAuthContext";
import styles from "./User.module.css";

export default function User() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleClick() {
    logout();
    await navigate("/");
  }

  return (
    <div className={styles.user}>
      <span className={styles.avatar} aria-hidden="true">
        V
      </span>
      <span className={styles.name}>
        Welcome, {user?.name}
        <small>Your travel journal</small>
      </span>
      <button type="button" onClick={handleClick}>
        Logout
      </button>
    </div>
  );
}
