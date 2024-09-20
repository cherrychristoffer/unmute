import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

import App from "./App";

import { Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

import { Provider } from "react-redux";
import store from "./app/store";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <Provider store={store}>
    <Router hook={useHashLocation}>
      <App />
    </Router>
  </Provider>
  // </React.StrictMode>
);
