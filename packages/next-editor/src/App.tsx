import { createHashRouter, RouterProvider } from "react-router-dom";
import { EditorPage } from "./page/EditorPage.tsx";

const router = createHashRouter([
  {
    path: "/",
    element: <EditorPage />,
  },
]);

export default function App() {
  return <RouterProvider router={router}></RouterProvider>;
}
