import { createHashRouter, RouterProvider } from "react-router-dom";
import { EditorPage } from "./page/EditorPage.tsx";
import { HomePage } from "./page/HomePage.tsx";

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
  return <RouterProvider router={router}></RouterProvider>;
}
