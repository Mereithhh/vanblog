import React from "react";
export interface GlobalState {
  theme: "auto-dark" | "auto-light" | "dark" | "light";
  viewer: number;
  visited: number;
}

export const GlobalContext = React.createContext<{
  state: GlobalState;
  setState: (newState: GlobalState) => void;
}>({
  state: {
    theme: "auto-light",
    viewer: 0,
    visited: 0,
  },
  setState: (newState: GlobalState) => {},
});
