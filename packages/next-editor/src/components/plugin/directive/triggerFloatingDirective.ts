import { type SlateEditor, getEditorPlugin } from "@udecode/plate-common";
import { DirectivePlugin, TDirectiveElement } from "./DirectivePlugin";

export const triggerFloatingDirective = (
  editor: SlateEditor,
  {
    directiveElement,
  }: {
    directiveElement?: TDirectiveElement;
  } = {},
) => {
  const { api } = getEditorPlugin(editor, DirectivePlugin);

  if (directiveElement) {
    api.floatingDirective.show("edit", editor.id, directiveElement);
  } else {
    api.floatingDirective.show("insert", editor.id);
  }
};
