import { render } from "solid-js/web";
import App from "./router.tsx";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  alert("No root element");
} else {
  render(() => <App />, rootElement);
}
