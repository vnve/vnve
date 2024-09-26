import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { registerSourceStore } from "./lib/core.ts";

registerSourceStore();

setTimeout(() => {
  fetch("https://l.s/").then((res) => {
    console.log(res);
  });
}, 3000);

window.onbeforeunload = function () {
  return "确认离开？";
};

const rootElement = document.getElementById("root");

ReactDOM.createRoot(rootElement!).render(<App></App>);
