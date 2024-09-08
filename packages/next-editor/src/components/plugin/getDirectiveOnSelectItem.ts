import {
  type SlateEditor,
  getEditorPlugin,
  moveSelection,
} from "@udecode/plate-common";

import {
  type DirectiveConfig,
  DirectivePlugin,
  TDirectiveValue,
} from "./DirectivePlugin";

interface TDirectiveElementBase {
  value: TDirectiveValue;
}

export type AddDirectiveItem<
  TItem extends TDirectiveElementBase = TDirectiveElementBase,
> = (editor: SlateEditor, item: TItem, search?: string) => void;

export const getDirectiveOnSelectItem =
  <TItem extends TDirectiveElementBase = TDirectiveElementBase>({
    key = DirectivePlugin.key,
  }: { key?: string } = {}): AddDirectiveItem<TItem> =>
  (editor, item) => {
    const { tf } = getEditorPlugin<DirectiveConfig>(editor, {
      key: key as any,
    });

    tf.insert.directive({ value: item.value });

    // move the selection after the element
    moveSelection(editor, { unit: "offset" });
  };
