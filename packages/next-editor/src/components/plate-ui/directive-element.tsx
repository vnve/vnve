import React from "react";

import {
  DirectivePlugin,
  type TDirectiveElement,
} from "../plugin/directive/DirectivePlugin";

import { cn, withRef } from "@udecode/cn";
import { getHandler } from "@udecode/plate-common";
import {
  PlateElement,
  useEditorPlugin,
  useElement,
} from "@udecode/plate-common/react";
import { useFocused, useSelected } from "slate-react";
import { triggerFloatingDirective } from "../plugin/directive";

export const DirectiveElement = withRef<
  typeof PlateElement,
  {
    onClick?: (directiveNode: TDirectiveElement) => void;
    prefix?: string;
  }
>(({ children, className, onClick, prefix, ...props }, ref) => {
  const element = useElement<TDirectiveElement>();
  const selected = useSelected();
  const focused = useFocused();
  const { editor } = useEditorPlugin(DirectivePlugin);
  const onClickElement = () => {
    triggerFloatingDirective(editor, {
      directiveElement: element,
    });
  };

  return (
    <PlateElement
      className={cn(
        "inline-block cursor-pointer rounded-md bg-muted px-1.5 py-0.5 align-baseline text-sm font-medium select-none",
        selected && focused && "ring-2 ring-ring",
        element.children[0].bold === true && "font-bold",
        element.children[0].italic === true && "italic",
        element.children[0].underline === true && "underline",
        className,
      )}
      contentEditable={false}
      onClick={onClickElement}
      ref={ref}
      {...props}
    >
      {prefix}
      {element.value.label || ""}
      {children}
    </PlateElement>
  );
});
