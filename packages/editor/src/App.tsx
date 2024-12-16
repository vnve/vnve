import { createHashRouter, RouterProvider } from "react-router-dom";
import { EditorPage } from "./page/EditorPage.tsx";
import { GamePage } from "./page/GamePage.tsx";
import { useEffect, useState } from "react";
import { useToast } from "@/components/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { checkEnv } from "@vnve/core";
import { setDisableAudio } from "@/lib/core";

const router = createHashRouter([
  {
    path: "/",
    element: <EditorPage />,
  },
  {
    path: "/game",
    element: <GamePage />,
  },
]);

export default function App() {
  const [isSupported, setIsSupported] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    checkEnv().then((env) => {
      setIsSupported(env.video);

      if (!env.audio) {
        setDisableAudio(true);
        toast({
          title: "提示",
          description:
            "当前浏览器不支持音频合成，请使用最新桌面版的Chrome或Edge浏览器获取完整体验～",
          duration: 1500,
        });
      }
    });
  }, [toast]);

  if (!isSupported) {
    return (
      <div className="flex h-screen items-center justify-center">
        {isSupported === false ? (
          <div className="text-center">
            <h1 className="text-2xl font-semibold">您的浏览器不支持</h1>
            <p className="text-sm">请使用最新桌面版的Chrome或Edge浏览器～</p>
          </div>
        ) : (
          <div className="text-center">环境检测中...</div>
        )}
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router}></RouterProvider>
      <Toaster />
    </>
  );
}
