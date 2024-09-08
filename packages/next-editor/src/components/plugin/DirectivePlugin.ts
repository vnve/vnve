import type { TElement } from "@udecode/plate-common";
import { toPlatePlugin } from "@udecode/plate-common/react";
import {
  type PluginConfig,
  createSlatePlugin,
  insertNodes,
} from "@udecode/plate-common";

export interface TDirectiveValue {
  directive: string;
  params: any;
}

export interface TDirectiveElement extends TElement {
  value: TDirectiveValue;
}

export type DirectiveConfig = PluginConfig<
  "directive",
  object,
  object,
  {
    insert: {
      directive: (options: { value: TDirectiveValue }) => void;
    };
  }
>;

export const DirectivePlugin = toPlatePlugin(
  createSlatePlugin({
    key: "directive",
    node: {
      isElement: true,
      isInline: true,
      isMarkableVoid: true,
      isVoid: true,
    },
    options: {},
  }).extendEditorTransforms<DirectiveConfig["transforms"]>(
    ({ editor, type }) => ({
      insert: {
        directive: ({ value }) => {
          insertNodes<TDirectiveElement>(editor, {
            children: [{ text: "" }],
            type,
            value,
          });
        },
      },
    }),
  ),
);
