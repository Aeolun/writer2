import * as ReactDOM from "react-dom/client";
import { App } from "./app";
import "./book.css";

const root = document.getElementById("app");
if (root) {
  ReactDOM.createRoot(root).render(<App />);
} else {
  console.error("Root element not found");
}
