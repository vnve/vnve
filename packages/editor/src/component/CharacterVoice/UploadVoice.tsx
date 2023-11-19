import { Flex, Input } from "@chakra-ui/react";
import { useRef } from "react";

export default function UploadVoice({
  onChangeVoiceUrl,
}: {
  onChangeVoiceUrl: (url: string) => void;
}) {
  const voiceFileRef = useRef(null);

  function onSelectVoiceFile(file: File) {
    const url = URL.createObjectURL(file);

    onChangeVoiceUrl(url);
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
