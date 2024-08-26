import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

window.onbeforeunload = function () {
  return "确认离开？";
};

const rootElement = document.getElementById("root");

ReactDOM.createRoot(rootElement!).render(<App></App>);
