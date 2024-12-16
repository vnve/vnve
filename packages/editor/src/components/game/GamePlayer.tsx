import { Card, CardContent } from "@/components/ui/card";
import { useGameStore } from "@/store";
import { useEffect, useRef } from "react";

export function GamePlayer() {
  const initGame = useGameStore((state) => state.initGame);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const adjustCanvasWidth = () => {
    const container = canvasContainerRef.current;
    const canvas = canvasRef.current;

    if (container && canvas) {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const aspectRatio = 16 / 9;

      let width = containerWidth;
      let height = containerWidth / aspectRatio;

      if (height > containerHeight) {
        height = containerHeight;
        width = containerHeight * aspectRatio;
      }

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }
  };

  useEffect(() => {
    window.addEventListener("resize", adjustCanvasWidth);

    adjustCanvasWidth();

    initGame(canvasRef.current);
    canvasRef.current.onselectstart = function () {
      return false;
    };

    return () => {
      window.removeEventListener("resize", adjustCanvasWidth);
    };
  }, [initGame]);

  return (
    <Card className="flex-1 rounded-md relative">
      <CardContent className="relative h-full p-2">
        <div
          className="w-full h-full flex justify-center items-center"
          ref={canvasContainerRef}
        >
          <canvas className="shadow border border-b" ref={canvasRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
