import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme, withDefaultSize } from "@chakra-ui/react";
import "./app.css";
import "react-contexify/dist/ReactContexify.css";
import App from "./App.tsx";

window.onbeforeunload = function () {
  return "确认离开？";
};

const theme = extendTheme(
  withDefaultSize({
    size: "sm",
    components: [
      "Button",
      "Card",
      "Input",
      "Textarea",
      "Select",
      "FormControl",
      "NumberInput",
    ],
  }),
);
const rootElement = document.getElementById("root");

ReactDOM.createRoot(rootElement!).render(
  <ChakraProvider theme={theme}>
    <App></App>
  </ChakraProvider>,
);
