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
import { DirectiveVoiceController } from "@/components/plate-ui/directive-voice-controller";

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
    // TODO: placeholder对拼音输入支持性不好，暂时不使用
    override: {
      components: {
        [DirectivePlugin.key]: DirectiveElement,
      },
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
    <div className="flex flex-col">
      <Plate editor={editor} onValueChange={handleChangeLines}>
        <div
          className="relative rounded-md rounded-b-none border bg-background border-border"
          onFocus={handleFocus}
        >
          <FixedToolbar>
            <FixedToolbarButtons
              speak={value.speak}
              lines={value.lines}
              onChangeSpeak={handleChangeSpeak}
            >
              {children}
            </FixedToolbarButtons>
          </FixedToolbar>
          <Editor focusRing={false} variant="ghost" size="sm" />
        </div>
      </Plate>
      <DirectiveVoiceController
        speak={value.speak}
        lines={value.lines}
        onChangeSpeak={handleChangeSpeak}
      ></DirectiveVoiceController>
    </div>
  );
}
