import { withProps } from "@udecode/cn";
import {
  usePlateEditor,
  Plate,
  ParagraphPlugin,
  PlateLeaf,
  PlateEditor,
} from "@udecode/plate-common/react";
// import { BoldPlugin, ItalicPlugin } from "@udecode/plate-basic-marks/react";
// import {
//   FontColorPlugin,
//   FontBackgroundColorPlugin,
//   FontSizePlugin,
// } from "@udecode/plate-font";
import { NodeIdPlugin } from "@udecode/plate-node-id";
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

export function DirectiveInput({ value, onChange }) {
  const editor: PlateEditor = usePlateEditor({
    plugins: [
      ParagraphPlugin,
      DirectivePlugin.extend({
        render: {
          afterEditable: () => <DirectiveFloatingToolbar />,
        },
      }),
      // BoldPlugin,
      // ItalicPlugin,
      // FontColorPlugin,
      // FontBackgroundColorPlugin,
      // FontSizePlugin,
      // NodeIdPlugin,
      DeletePlugin,
    ],
    override: {
      components: withPlaceholders({
        [DirectivePlugin.key]: DirectiveElement,
        [ParagraphPlugin.key]: ParagraphElement,
        // [BoldPlugin.key]: withProps(PlateLeaf, { as: "strong" }),
        // [ItalicPlugin.key]: withProps(PlateLeaf, { as: "em" }),
      }),
    },
    value: value.lines,
  });
  const [editorValue, setEditorValue] = useState([]); // 记录editor value进行比对, 避免重复渲染

  useEffect(() => {
    if (editorValue !== value.lines) {
      editor.tf.setValue(value.lines);
      setEditorValue(value.lines);
    }
  }, [editor, value.lines, editorValue]);

  return (
    <>
      <Plate
        editor={editor}
        onChange={({ value: newValue }) => {
          onChange({
            ...value,
            lines: newValue,
          });
          setEditorValue(newValue);
        }}
      >
        <FixedToolbar>
          <FixedToolbarButtons
            speaker={value.speaker}
            onChangeSpeaker={(speaker) => {
              onChange({
                ...value,
                speaker: {
                  label: speaker.label,
                  name: speaker.name,
                },
              });
            }}
          ></FixedToolbarButtons>
        </FixedToolbar>
        <Editor />
      </Plate>
    </>
  );
}
