import { createRoot } from "react-dom/client";
import App from "./app.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) {
  alert("No root element");
} else {
  const root = createRoot(rootElement);
  root.render(<App />);
}
