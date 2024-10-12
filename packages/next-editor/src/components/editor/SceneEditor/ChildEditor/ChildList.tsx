import { useEditorStore } from "@/store";
import { Child } from "@vnve/next-core";
import { useMemo } from "react";

export function ChildList() {
  const editor = useEditorStore((state) => state.editor);
  const activeChild = useEditorStore((state) => state.activeChild);
  const activeScene = useEditorStore((state) => state.activeScene);

  const childList = useMemo(() => {
    if (!activeScene) {
      return [];
    }

    return activeScene.children.filter((item) => item.name);
  }, [activeScene]);

  const handleSelectChild = (child: Child) => {
    editor.setActiveChildByName(child.name);
  };

  const handleRemoveChild = (child: Child) => {
    editor.removeChildByName(child.name);

    if (activeChild?.name === child.name) {
      editor.setActiveChild(undefined);
    }
  };

  const handleToggleChildVisible = (child: Child) => {
    editor.toggleChildVisibleByName(child.name);
  };

  const handleToggleChildInteractive = (child: Child) => {
    editor.toggleChildInteractiveByName(child.name);
  };

  // TODO: childList应该需要分类
  // 同时列出音频

  return (
    <div>
      <ul>
        {childList.map((child) => {
          return (
            <li
              key={child.name}
              className={activeChild?.name === child.name ? "bg-gray-100" : ""}
            >
              <div onClick={() => handleSelectChild(child)}>
                {child.label} {child.name}
              </div>
              <div onClick={() => handleRemoveChild(child)}>删除</div>
              <div onClick={() => handleToggleChildVisible(child)}>
                {child.visible ? "隐藏" : "显示"}
              </div>
              <div onClick={() => handleToggleChildInteractive(child)}>
                {child.interactive ? "锁定" : "解锁"}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
