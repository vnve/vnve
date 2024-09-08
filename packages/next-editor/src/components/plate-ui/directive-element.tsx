import React from "react";

import type { TDirectiveElement } from "../plugin/DirectivePlugin";

import { cn, withRef } from "@udecode/cn";
import { getHandler } from "@udecode/plate-common";
import { PlateElement, useElement } from "@udecode/plate-common/react";
import { useFocused, useSelected } from "slate-react";

export const DirectiveElement = withRef<
  typeof PlateElement,
  {
    onClick?: (directiveNode: any) => void;
    prefix?: string;
    renderLabel?: (directiveElement: TDirectiveElement) => string;
  }
>(({ children, className, onClick, prefix, renderLabel, ...props }, ref) => {
  const element = useElement<TDirectiveElement>();
  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement
      className={cn(
        "inline-block cursor-pointer rounded-md bg-muted px-1.5 py-0.5 align-baseline text-sm font-medium",
        selected && focused && "ring-2 ring-ring",
        element.children[0].bold === true && "font-bold",
        element.children[0].italic === true && "italic",
        element.children[0].underline === true && "underline",
        className,
      )}
      contentEditable={false}
      onClick={getHandler(onClick, element)}
      ref={ref}
      {...props}
    >
      {prefix}
      {renderLabel ? renderLabel(element) : element.value.directive}
      {children}
    </PlateElement>
  );
});
