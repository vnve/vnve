import { Flex, Input } from "@chakra-ui/react";
import { useRef } from "react";
import { db } from "../../lib/db";

export default function UploadVoice({
  onChangeVoiceUrl,
}: {
  onChangeVoiceUrl: (url: string) => void;
}) {
  const voiceFileRef = useRef(null);

  async function onSelectVoiceFile(file: File) {
    await db.draftAssets
      .add({
        source: file as Blob,
      })
      .then((id) => {
        const url = `${URL.createObjectURL(file)}#draftId=${id}`;

        onChangeVoiceUrl(url);
      });
  }

  return (
    <Flex>
      <Input
        ref={voiceFileRef}
        type="file"
        accept={".mp3, .wav"}
        p={0.5}
        onChange={(event) => onSelectVoiceFile(event.target.files[0])}
      ></Input>
    </Flex>
  );
}
