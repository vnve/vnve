import { createHashRouter, RouterProvider } from "react-router-dom";
import { EditorPage } from "./page/EditorPage.tsx";
import { HomePage } from "./page/HomePage.tsx";
import { useTheme } from "./components/hooks/useTheme";

const router = createHashRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/editor",
    element: <EditorPage />,
  },
]);

export default function App() {
  // 初始化主题
  useTheme();

  return <RouterProvider router={router}></RouterProvider>;
}
