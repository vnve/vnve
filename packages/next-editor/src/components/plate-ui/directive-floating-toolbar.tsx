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
import { DirectivePlugin, useFloatingDirective } from "../plugin/directive";
import { DirectiveForm } from "./directive-form";

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
  const { useOption } = useEditorPlugin(DirectivePlugin);
  const editingDirective = useOption("editingDirective");
  const {
    ref: insertRef,
    props: insertProps,
    onSubmit,
    onCancel,
  } = useFloatingDirective({
    floatingOptions,
    triggerFloatingLinkHotkeys: "mod+k", // TODO: change to mod+d
  });

  return (
    <div
      className={cn(popoverVariants(), "w-auto p-1")}
      {...insertProps}
      ref={insertRef}
    >
      <div className="flex w-[330px] flex-col p-2" {...inputProps}>
        <DirectiveForm
          editingDirective={editingDirective}
          onSubmitDirective={onSubmit}
        ></DirectiveForm>
      </div>
    </div>
  );
}
