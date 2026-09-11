import { Component } from "react";
import type { ReactNode } from "react";

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

interface State {
  broke: boolean;
}

/** A WebGL context can fail to init (old GPU, driver blocklist, out of
 *  contexts) or throw mid-session — this must never take the whole page
 *  down with it. Catches and swaps to the static fallback silently. */
export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { broke: false };

  static getDerivedStateFromError() {
    return { broke: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.warn("3D hero scene failed, falling back to static backdrop:", error);
  }

  render() {
    return this.state.broke ? this.props.fallback : this.props.children;
  }
}
