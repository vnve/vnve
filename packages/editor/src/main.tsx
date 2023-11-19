import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme, withDefaultSize } from "@chakra-ui/react";
import App from "./App.tsx";

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
