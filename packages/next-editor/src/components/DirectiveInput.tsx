import { withProps } from "@udecode/cn";
import {
  createPlateEditor,
  Plate,
  ParagraphPlugin,
  PlateLeaf,
} from "@udecode/plate-common/react";
import {
  MentionPlugin,
  MentionInputPlugin,
} from "@udecode/plate-mention/react";
import { LinkPlugin } from "@udecode/plate-link/react";
// import { BoldPlugin, ItalicPlugin } from "@udecode/plate-basic-marks/react";
// import {
//   FontColorPlugin,
//   FontBackgroundColorPlugin,
//   FontSizePlugin,
// } from "@udecode/plate-font";
import { NodeIdPlugin } from "@udecode/plate-node-id";
import { DeletePlugin } from "@udecode/plate-select";

import { MentionElement } from "@/components/plate-ui/mention-element";
import { MentionInputElement } from "@/components/plate-ui/mention-input-element";
import { ParagraphElement } from "@/components/plate-ui/paragraph-element";
import { Editor } from "@/components/plate-ui/editor";
import { FixedToolbar } from "@/components/plate-ui/fixed-toolbar";
import { FixedToolbarButtons } from "@/components/plate-ui/fixed-toolbar-buttons";
import { withPlaceholders } from "@/components/plate-ui/placeholder";
import { LinkFloatingToolbar } from "@/components/plate-ui/link-floating-toolbar";
import { LinkElement } from "@/components/plate-ui/link-element";

const editor = createPlateEditor({
  plugins: [
    ParagraphPlugin,
    MentionPlugin,
    LinkPlugin.configure({
      render: { afterEditable: () => <LinkFloatingToolbar /> },
    }),
    // BoldPlugin,
    // ItalicPlugin,
    // FontColorPlugin,
    // FontBackgroundColorPlugin,
    // FontSizePlugin,
    NodeIdPlugin,
    DeletePlugin,
  ],
  override: {
    components: withPlaceholders({
      [MentionPlugin.key]: MentionElement,
      [MentionInputPlugin.key]: MentionInputElement,
      [ParagraphPlugin.key]: ParagraphElement,
      [LinkPlugin.key]: LinkElement,
      // [BoldPlugin.key]: withProps(PlateLeaf, { as: "strong" }),
      // [ItalicPlugin.key]: withProps(PlateLeaf, { as: "em" }),
    }),
  },
  value: [],
});

export default function DirectiveInput() {
  return (
    <Plate
      editor={editor}
      onChange={(value) => {
        console.log(value);
      }}
    >
      <FixedToolbar>
        <FixedToolbarButtons></FixedToolbarButtons>
      </FixedToolbar>
      <Editor />
    </Plate>
  );
}
