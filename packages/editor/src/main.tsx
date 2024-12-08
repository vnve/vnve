import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { checkAndImportPresetAssets, loadDBFonts } from "./db";

window.onbeforeunload = function () {
  return "确认离开？";
};

checkAndImportPresetAssets().finally(() => {
  loadDBFonts();
});

const rootElement = document.getElementById("root");

ReactDOM.createRoot(rootElement!).render(<App></App>);
