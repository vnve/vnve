import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEditorStore } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTemplates } from "@/components/hooks/useTemplates";

export function SceneList() {
  const editor = useEditorStore((state) => state.editor);
  const activeScene = useEditorStore((state) => state.activeScene);
  const scenes = useEditorStore((state) => state.scenes);
  const {
    defaultTemplates,
    customTemplates,
    handleAddDefaultTemplate,
    handleAddCustomTemplate,
  } = useTemplates();

  const handleRemoveScene = (scene) => {
    if (scene.name === activeScene?.name) {
      editor.setActiveScene(undefined);
    }

    editor.removeSceneByName(scene.name);
  };

  const handleCopyScene = (scene) => {
    const copiedScene = editor.cloneSceneByName(scene.name);

    editor.addScene(copiedScene);
  };

  const handleSwapScene = (fromIndex, toIndex) => {
    editor.swapScene(fromIndex, toIndex);
  };

  return (
    <Card className="flex-1 h-full rounded-md">
      <CardContent className="h-full p-2">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>场景</TableHead>
                <TableHead className="w-[100px] text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenes.map((scene, index) => (
                <TableRow
                  key={scene.name}
                  onClick={() => {
                    editor.setActiveSceneByName(scene.name);
                  }}
                  className={`${
                    activeScene?.name === scene.name ? "bg-muted" : ""
                  } cursor-pointer`}
                >
                  <TableCell>
                    <span className="font-medium mr-2">{index + 1}.</span>
                    {scene.label}
                  </TableCell>
                  <TableCell className="flex gap-1 justify-end">
                    {index > 0 && (
                      <Icons.moveUp
                        className="size-4 cursor-pointer"
                        onClick={() => handleSwapScene(index, index - 1)}
                      ></Icons.moveUp>
                    )}

                    {index < scenes.length - 1 && (
                      <Icons.moveDown
                        className="size-4 cursor-pointer"
                        onClick={() => handleSwapScene(index, index + 1)}
                      >
                        下移
                      </Icons.moveDown>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Icons.more className="size-4 cursor-pointer" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>插入</DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              {defaultTemplates.map((template) => (
                                <DropdownMenuItem
                                  key={template.name}
                                  onClick={handleAddDefaultTemplate(
                                    template.content,
                                  )}
                                >
                                  {template.name}
                                </DropdownMenuItem>
                              ))}
                              {customTemplates.length > 0 && (
                                <DropdownMenuSeparator />
                              )}
                              {customTemplates.map((template) => (
                                <DropdownMenuItem
                                  key={template.id}
                                  onClick={() =>
                                    handleAddCustomTemplate(template.content)
                                  }
                                >
                                  {template.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuItem
                          onClick={() => handleCopyScene(scene)}
                        >
                          复制
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleRemoveScene(scene)}
                        >
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
