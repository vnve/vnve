import React from "react";

import {
  DirectivePlugin,
  type TDirectiveElement,
} from "../plugin/directive/DirectivePlugin";

import { cn, withRef } from "@udecode/cn";
import {
  PlateElement,
  useEditorPlugin,
  useElement,
} from "@udecode/plate-common/react";
import { IS_APPLE } from "@udecode/plate-common";
import { useFocused, useSelected } from "slate-react";
import { triggerFloatingDirective } from "../plugin/directive";
import { useMounted } from "../hooks/use-mounted";

export const DirectiveElement = withRef<
  typeof PlateElement,
  {
    onClick?: (directiveNode: TDirectiveElement) => void;
    prefix?: string;
  }
>(({ children, className, prefix, ...props }, ref) => {
  const element = useElement<TDirectiveElement>();
  const selected = useSelected();
  const focused = useFocused();
  const mounted = useMounted();
  const { editor } = useEditorPlugin(DirectivePlugin);
  const onClickElement = () => {
    triggerFloatingDirective(editor, {
      directiveElement: element,
    });
  };

  return (
    <PlateElement
      className={cn(
        "inline-block cursor-pointer rounded-md bg-muted px-1.5 py-0.5 align-baseline text-sm font-medium select-none mx-0.5",
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
      {mounted && IS_APPLE ? (
        // Mac OS IME https://github.com/ianstormtaylor/slate/issues/3490
        <React.Fragment>
          {children}
          {prefix}
          {element.value.label || ""}
        </React.Fragment>
      ) : (
        // Others like Android https://github.com/ianstormtaylor/slate/pull/5360
        <React.Fragment>
          {prefix}
          {element.value.label || ""}
          {children}
        </React.Fragment>
      )}
    </PlateElement>
  );
});
