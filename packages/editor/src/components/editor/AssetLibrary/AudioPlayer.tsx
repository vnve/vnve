import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AudioPlayer({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div
      className={cn(
        "w-full aspect-[1/1] flex justify-center items-center cursor-pointer relative",
        className,
      )}
    >
      <audio ref={audioRef} src={url} className="hidden" />
      <Button
        onClick={togglePlayPause}
        variant="outline"
        size="icon"
        className="w-12 h-12"
      >
        {isPlaying ? (
          <Pause className="h-6 w-6" />
        ) : (
          <Play className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
