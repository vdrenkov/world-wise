import { Component } from "react";

import type { ReactNode } from "react";

export default class AppErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="not-found">
          <p className="eyebrow">Let’s try that again</p>
          <h1>The journal could not open.</h1>
          <p>
            Your saved trips are still in this browser. Reload to try again.
          </p>
          <a tabIndex={0} className="cta" href="/">
            Reload WorldWise
          </a>
        </main>
      );
    }

    return this.props.children;
  }
}
