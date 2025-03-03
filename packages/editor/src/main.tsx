import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import {
  checkAndImportPresetAssets,
  insertNarratorAsset,
  loadDBFonts,
} from "./db";

window.onbeforeunload = function () {
  return "确认离开？";
};

// 补充的兼容逻辑，固定插入一个旁白角色
insertNarratorAsset();

checkAndImportPresetAssets().finally(() => {
  loadDBFonts();
});

const rootElement = document.getElementById("root");

ReactDOM.createRoot(rootElement!).render(<App></App>);
