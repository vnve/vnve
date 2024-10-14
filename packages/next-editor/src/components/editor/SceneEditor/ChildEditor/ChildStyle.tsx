import { useEditorStore } from "@/store";
import { ChildBasicStyle } from "./ChildBasicStyle";
import { ChildTextStyle } from "./ChildTextStyle";
import { ChildGraphicsStyle } from "./ChildGraphicsStyle";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ChildStyle() {
  const activeChild = useEditorStore((state) => state.activeChild);

  return (
    <ScrollArea className="h-full pr-2">
      {activeChild && (
        <>
          <fieldset className="rounded-md border p-2">
            <legend className="-ml-1 px-1 text-sm font-medium">基础属性</legend>
            <ChildBasicStyle />
          </fieldset>
          {activeChild.type === "Text" && (
            <fieldset className="rounded-md border p-2 mt-2">
              <legend className="-ml-1 px-1 text-sm font-medium">
                文字属性
              </legend>
              <ChildTextStyle />
            </fieldset>
          )}
          {activeChild.type === "Graphics" && (
            <fieldset className="rounded-md border p-2 mt-2">
              <legend className="-ml-1 px-1 text-sm font-medium">
                对话框属性
              </legend>
              <ChildGraphicsStyle />
            </fieldset>
          )}
        </>
      )}
    </ScrollArea>
  );
}
