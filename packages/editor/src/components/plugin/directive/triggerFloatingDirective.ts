import { type SlateEditor, getEditorPlugin } from "@udecode/plate-common";
import { DirectivePlugin, TDirectiveElement } from "./DirectivePlugin";
import { DirectiveType, getDirectiveType } from "@/config";

export const triggerFloatingDirective = (
  editor: SlateEditor,
  {
    directiveElement,
    directiveType,
  }: {
    directiveElement?: TDirectiveElement;
    directiveType?: DirectiveType;
  } = {},
) => {
  const { api } = getEditorPlugin(editor, DirectivePlugin);

  if (directiveElement) {
    const directiveName = directiveElement.value.directive;
    const editDirectiveType = getDirectiveType(directiveName);

    api.floatingDirective.show(
      "edit",
      editor.id,
      directiveElement,
      editDirectiveType,
    );
  } else {
    api.floatingDirective.show("insert", editor.id, null, directiveType);
  }
};
