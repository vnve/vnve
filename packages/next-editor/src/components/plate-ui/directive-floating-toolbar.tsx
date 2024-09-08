"use client";

import React from "react";

import { cn } from "@udecode/cn";
import {
  useEditorPlugin,
  useFormInputProps,
} from "@udecode/plate-common/react";
import {
  type UseVirtualFloatingOptions,
  flip,
  offset,
} from "@udecode/plate-floating";

import { Icons } from "@/components/icons";

import { buttonVariants } from "./button";
import { inputVariants } from "./input";
import { popoverVariants } from "./popover";
import { Separator } from "./separator";
import { useFloatingDirectiveInsert } from "../plugin/directive";

const floatingOptions: UseVirtualFloatingOptions = {
  middleware: [
    offset(12),
    flip({
      fallbackPlacements: ["bottom-end", "top-start", "top-end"],
      padding: 12,
    }),
  ],
  placement: "bottom-start",
};

export function DirectiveFloatingToolbar() {
  const inputProps = useFormInputProps({
    preventDefaultOnEnterKeydown: true,
  });
  const {
    ref: insertRef,
    props: insertProps,
    onInsert,
  } = useFloatingDirectiveInsert({
    floatingOptions,
    triggerFloatingLinkHotkeys: "mod+k", // TODO: change to mod+d
  });

  const input = (
    <div className="flex w-[330px] flex-col" {...inputProps}>
      <div className="flex items-center">
        <div className="flex items-center pl-3 text-muted-foreground">
          <Icons.link className="size-4" />
        </div>
      </div>
      <Separator />
      <div className="flex items-center">
        <div className="flex items-center pl-3 text-muted-foreground">
          <Icons.text className="size-4" />
        </div>
        <input
          className={inputVariants({ h: "sm", variant: "ghost" })}
          placeholder="Text to display"
        />
        <button
          onClick={(e) => {
            onInsert({ value: { directive: "Show", params: {} } });
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          加入
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={cn(popoverVariants(), "w-auto p-1")}
      {...insertProps}
      ref={insertRef}
    >
      {input}
    </div>
  );
}
