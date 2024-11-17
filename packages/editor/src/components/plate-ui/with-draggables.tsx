import type { FC } from "react";

import {
  ParagraphPlugin,
  createNodesWithHOC,
} from "@udecode/plate-common/react";
import {
  type WithDraggableOptions,
  withDraggable as withDraggablePrimitive,
} from "@udecode/plate-dnd";
import { HEADING_KEYS } from "@udecode/plate-heading";

import { Draggable, type DraggableProps } from "./draggable";

export const withDraggable = (
  Component: FC,
  options?: WithDraggableOptions<
    Partial<Omit<DraggableProps, "children" | "editor" | "element">>
  >,
) =>
  withDraggablePrimitive<DraggableProps>(Draggable, Component, options as any);

export const withDraggablesPrimitive = createNodesWithHOC(withDraggable);

export const withDraggables = (components: any) => {
  return withDraggablesPrimitive(components, [
    {
      draggableProps: {
        classNames: {
          blockToolbarWrapper: "h-[1.3em]",
          gutterLeft: "px-0 pb-1 text-[1.875em]",
        },
      },
      key: HEADING_KEYS.h1,
    },
    {
      draggableProps: {
        classNames: {
          blockToolbarWrapper: "h-[1.3em]",
          gutterLeft: "px-0 pb-1 text-[1.5em]",
        },
      },
      key: HEADING_KEYS.h2,
    },
    {
      draggableProps: {
        classNames: {
          blockToolbarWrapper: "h-[1.3em]",
          gutterLeft: "pt-[2px] px-0 pb-1 text-[1.25em]",
        },
      },
      key: HEADING_KEYS.h3,
    },
    {
      draggableProps: {
        classNames: {
          blockToolbarWrapper: "h-[1.3em]",
          gutterLeft: "pt-[3px] px-0 pb-0 text-[1.1em]",
        },
      },
      keys: [HEADING_KEYS.h4, HEADING_KEYS.h5],
    },
    {
      draggableProps: {
        classNames: {
          gutterLeft: "pt-[3px] px-0 pb-0",
        },
      },
      keys: [ParagraphPlugin.key],
    },
  ]);
};
