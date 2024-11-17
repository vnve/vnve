import { cn } from "@/lib/utils";

export function ImageViewer({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full h-full cursor-pointer flex justify-center items-center relative",
        className,
      )}
      style={{
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect width="10" height="10" fill="%23ccc"/><rect x="10" y="10" width="10" height="10" fill="%23ccc"/></svg>')`,
      }}
    >
      {url && (
        <img
          src={url}
          className="absolute left-0 top-0 h-full w-full object-contain"
        />
      )}
    </div>
  );
}
