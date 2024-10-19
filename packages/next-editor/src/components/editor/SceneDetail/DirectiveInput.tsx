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
import { useEffect, useState } from "react";

export function DirectiveInput({ value, onChange, children }) {
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
  const [editorValue, setEditorValue] = useState([]); // 记录editor value进行比对, 避免重复渲染

  const handleChangeLines = ({ value: newValue }) => {
    onChange({
      ...value,
      lines: newValue,
    });
    setEditorValue(newValue);
  };

  const handleChangeSpeaker = (speaker) => {
    onChange({
      ...value,
      speaker,
    });
  };

  useEffect(() => {
    if (editorValue !== value.lines) {
      editor.tf.setValue(value.lines);
      setEditorValue(value.lines);
    }
  }, [editor, value.lines, editorValue]);

  return (
    <Plate editor={editor} onChange={handleChangeLines}>
      <div className="relative rounded-md border bg-background border-border">
        <FixedToolbar>
          <FixedToolbarButtons
            speaker={value.speaker}
            onChangeSpeaker={handleChangeSpeaker}
          >
            {children}
          </FixedToolbarButtons>
        </FixedToolbar>
        <Editor focusRing={false} variant="ghost" size="md" />
      </div>
    </Plate>
  );
}
