import React from "react";

export interface GlobalState {
  viewer: number;
  visited: number;
}

export const GlobalContext = React.createContext<{
  state: GlobalState;
  setState: (newState: GlobalState) => void;
}>({
  state: {
    viewer: 0,
    visited: 0,
  },
  setState: (newState: GlobalState) => {},
});
