import {
  usePlateEditor,
  Plate,
  ParagraphPlugin,
  PlateEditor,
} from "@udecode/plate-common/react";
import { DeletePlugin } from "@udecode/plate-select";

import { ParagraphElement } from "@/components/plate-ui/paragraph-element";
import { Editor } from "@/components/plate-ui/editor";
import { FixedToolbar } from "@/components/plate-ui/fixed-toolbar";
import { FixedToolbarButtons } from "@/components/plate-ui/fixed-toolbar-buttons";
import { withPlaceholders } from "@/components/plate-ui/placeholder";
import { DirectivePlugin } from "@/components/plugin/directive/DirectivePlugin";
import { DirectiveElement } from "@/components/plate-ui/directive-element";
import { DirectiveFloatingToolbar } from "@/components/plate-ui/directive-floating-toolbar";
import { useEffect, useRef } from "react";

export function DirectiveInput({ value, onChange, onFocus, children }) {
  const editor: PlateEditor = usePlateEditor({
    plugins: [
      ParagraphPlugin,
      DirectivePlugin.extend({
        render: {
          afterEditable: () => <DirectiveFloatingToolbar />,
        },
      }),
      DeletePlugin,
    ],
    override: {
      components: withPlaceholders({
        [DirectivePlugin.key]: DirectiveElement,
        [ParagraphPlugin.key]: ParagraphElement,
      }),
    },
    value: value.lines,
  });
  const isControlledValueChanged = useRef(false);

  const handleChangeLines = ({ value: lines }) => {
    // editor.tf.setValues会触发onValueChange
    // 假如是外部传入Value变化，应该保持和受控组件行为一致，不触发变更事件
    if (isControlledValueChanged.current) {
      isControlledValueChanged.current = false;
      return;
    }

    onChange({
      ...value,
      lines,
    });
  };

  const handleChangeSpeak = (speak) => {
    onChange({
      ...value,
      speak,
    });
  };

  const handleFocus = () => {
    onFocus(value);
  };

  useEffect(() => {
    if (editor.children !== value.lines) {
      isControlledValueChanged.current = true;
      editor.tf.setValue(value.lines);
    }
  }, [value.lines, editor]);

  return (
    <Plate editor={editor} onValueChange={handleChangeLines}>
      <div
        className="relative rounded-md border bg-background border-border"
        onFocus={handleFocus}
      >
        <FixedToolbar>
          <FixedToolbarButtons
            speak={value.speak}
            onChangeSpeak={handleChangeSpeak}
          >
            {children}
          </FixedToolbarButtons>
        </FixedToolbar>
        <Editor focusRing={false} variant="ghost" size="sm" />
      </div>
    </Plate>
  );
}
