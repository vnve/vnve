import React from "react";
import { moveSelection } from "@udecode/plate-common";
import {
  focusEditor,
  useComposedRef,
  useEditorPlugin,
  useHotkeys,
  useOnClickOutside,
} from "@udecode/plate-common/react";
import {
  type UseVirtualFloatingOptions,
  useVirtualFloating,
  getSelectionBoundingClientRect,
} from "@udecode/plate-floating";
import { useFocused } from "slate-react";
import { DirectivePlugin, TDirectiveElementBase } from "./DirectivePlugin";

export function useFloatingDirectiveInsert({
  triggerFloatingLinkHotkeys,
  floatingOptions,
}: {
  triggerFloatingLinkHotkeys: string;
  floatingOptions: UseVirtualFloatingOptions;
}) {
  const { editor, api, tf, useOption, setOption, getOptions } =
    useEditorPlugin(DirectivePlugin);
  const mode = useOption("mode");
  const isOpen = useOption("isOpen", editor.id);
  const floating = useVirtualFloating({
    onOpenChange: (open) => setOption("openEditorId", open ? editor.id : null),
    getBoundingClientRect: getSelectionBoundingClientRect,
    open: isOpen && mode === "insert",
    whileElementsMounted: () => {},
    ...floatingOptions,
  });
  const focused = useFocused();

  const ref = useOnClickOutside(
    () => {
      if (getOptions().mode === "insert") {
        api.floatingDirective.hide();
        focusEditor(editor, editor.selection!);
      }
    },
    {
      disabled: !isOpen,
    },
  );

  // wait for update before focusing input
  React.useEffect(() => {
    if (isOpen) {
      floating.update();
      // setOption("updated", true);
    } else {
      // setOption("updated", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, floating.update]);

  // TODO: hotkeys
  // useHotkeys(
  //   triggerFloatingLinkHotkeys!,
  //   (e) => {
  //     if (triggerFloatingLinkInsert(editor, { focused })) {
  //       e.preventDefault();
  //     }
  //   },
  //   {
  //     enableOnContentEditable: true,
  //   },
  //   [focused],
  // );

  // TODO: do quick escape
  // useFloatingLinkEscape();

  const onInsert = (item: TDirectiveElementBase) => {
    tf.insert.directive({ value: item.value });

    // move the selection after the element
    moveSelection(editor, { unit: "offset" });

    api.floatingDirective.show("hide", editor.id);
    focusEditor(editor, editor.selection!);
  };

  const onCancel = () => {
    api.floatingDirective.show("hide", editor.id);
    focusEditor(editor, editor.selection!);
  };

  return {
    props: {
      style: {
        ...floating.style,
        zIndex: 50,
      },
    },
    ref: useComposedRef<HTMLDivElement>(floating.refs.setFloating, ref),
    onInsert,
    onCancel,
  };
}
