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
import { useEffect } from "react";

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

  const handleChangeLines = ({ value: newValue }) => {
    onChange({
      ...value,
      lines: newValue,
    });
  };

  const handleChangeSpeak = (speak) => {
    onChange({
      ...value,
      speak,
    });
  };

  useEffect(() => {
    if (editor.children !== value.lines) {
      editor.tf.setValue(value.lines);
    }
  }, [value.lines, editor]);

  return (
    <Plate editor={editor} onChange={handleChangeLines}>
      <div className="relative rounded-md border bg-background border-border">
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
