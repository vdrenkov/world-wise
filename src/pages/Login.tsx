import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import Button from "../components/Button";
import PageContent from "../components/PageContent";
import PageNav from "../components/PageNav";
import { useAuth } from "../contexts/FakeAuthContext";
import styles from "./Login.module.css";

import type { FormEvent } from "react";

export default function Login() {
  const [email, setEmail] = useState("vdrenkov@example.com");
  const [password, setPassword] = useState("qwerty");
  const [error, setError] = useState("");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !password) {
      return;
    }

    const valid = login(email, password);
    setError(valid ? "" : "Use the login details shown below.");
  }

  useEffect(() => {
    if (isAuthenticated) {
      void navigate("/app", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="public-page">
      <PageNav />
      <PageContent className={styles.panel}>
        <div>
          <p className="eyebrow">The next page is yours</p>
          <h1>A world of memories awaits.</h1>
          <p>
            Keep the places you’ve been and the stories you want to remember.
          </p>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2>Open your journal</h2>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error && (
            <p role="alert" className="alert">
              {error}
            </p>
          )}
          <Button type="primary" htmlType="submit">
            Login
          </Button>
          <p className={styles.credentials}>
            Login details
            <br />
            <code>vdrenkov@example.com</code> / <code>qwerty</code>
          </p>
        </form>
      </PageContent>
    </div>
  );
}
