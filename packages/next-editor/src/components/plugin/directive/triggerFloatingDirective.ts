import {
  type SlateEditor,
  findNode,
  getEditorPlugin,
} from "@udecode/plate-common";
import { DirectivePlugin, TDirectiveElement } from "./DirectivePlugin";

export const triggerFloatingDirective = (
  editor: SlateEditor,
  {
    directiveElement,
  }: {
    directiveElement?: TDirectiveElement;
  } = {},
) => {
  const { api, tf } = getEditorPlugin(editor, DirectivePlugin);
  const at = editor.selection;

  if (directiveElement) {
    const [, hitPath] = findNode<TDirectiveElement>(editor, {
      at,
      match: { type: editor.getType(DirectivePlugin), id: directiveElement.id },
    });
    // TODO: show edit value
    tf.edit.directive({
      value: {
        directive: "Fade",
        params: {},
      },
      at: hitPath,
    });
  } else {
    api.floatingDirective.show("insert", editor.id);
  }
};
