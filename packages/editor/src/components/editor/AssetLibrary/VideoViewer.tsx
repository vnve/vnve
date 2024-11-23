import { cn } from "@/lib/utils";

export function VideoViewer({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  return (
    <video
      src={url}
      className={cn("w-full h-full", className)}
      controls
      muted
    ></video>
  );
}
