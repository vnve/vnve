import FilerobotImageEditor, {
  TABS,
  TOOLS,
} from "react-filerobot-image-editor";
import { imgEditorZhTransitions } from "../../lib/const";
import { Portal, Box } from "@chakra-ui/react";
import { AssetItem } from "../../lib/assets";

export default function ImageEditor({
  editAssetItem,
  onSaveEditAssetItem,
  onCloseImgEditor,
}: {
  editAssetItem: AssetItem;
  onSaveEditAssetItem: (editedImageObject: any) => void;
  onCloseImgEditor: () => void;
}) {
  return (
    <Portal>
      <Box
        zIndex={9999}
        width={"90vw"}
        height={"90vh"}
        position={"absolute"}
        top={0}
        left={0}
        right={0}
        bottom={0}
        margin={"auto"}
      >
        <FilerobotImageEditor
          translations={imgEditorZhTransitions}
          savingPixelRatio={4}
          previewPixelRatio={window.devicePixelRatio}
          source={editAssetItem.source}
          onBeforeSave={() => false}
          onSave={onSaveEditAssetItem}
          onClose={onCloseImgEditor}
          annotationsCommon={{
            fill: "#ff0000",
          }}
          Text={{ text: "请输入..." }}
          Rotate={{ angle: 90, componentType: "slider" }}
          tabsIds={[
            TABS.ADJUST,
            TABS.RESIZE,
            TABS.ANNOTATE,
            TABS.FILTERS,
            TABS.FINETUNE,
          ]}
          defaultTabId={TABS.ADJUST}
          defaultToolId={TOOLS.CROP}
          avoidChangesNotSavedAlertOnLeave={true}
          useBackendTranslations={false}
        />
      </Box>
    </Portal>
  );
}
