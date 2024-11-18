import { Icons } from "@/components/icons";
import { useEditorStore } from "@/store";

export function EditorHeader() {
  const project = useEditorStore((state) => state.project);

  return (
    <header className="sticky top-0 z-10 flex h-[53px] items-center justify-between gap-1 border-b bg-background px-4">
      <h1 className="text-xl font-bold">
        V N V E
        {project && (
          <span className="text-xs text-muted-foreground">
            【{project.name}】
          </span>
        )}
      </h1>

      <Icons.gitHub
        className="size-5 cursor-pointer"
        onClick={() => {
          window.location.href = "https://github.com/vnve/vnve";
        }}
      ></Icons.gitHub>
    </header>
  );
}
