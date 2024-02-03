import { Flex, Button } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { db } from "../../lib/db";

export default function RecordUserVoice({
  onChangeVoiceUrl,
}: {
  onChangeVoiceUrl: (url: string) => void;
}) {
  const [recordState, setRecordState] = useState<
    "recording" | "paused" | "inactive"
  >("inactive");
  const [audioUrl, setAudioUrl] = useState("");
  const mediaRecorder = useRef<MediaRecorder>(null);

  function start() {
    navigator.mediaDevices
      .getUserMedia({ audio: { channelCount: 2, sampleRate: 44100 } })
      .then((stream) => {
        mediaRecorder.current = new MediaRecorder(stream, {
          audioBitsPerSecond: 128000,
        });
        const audioChunks = [];

        mediaRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.current.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/wav" });

          await db.draftAssets
            .add({
              source: audioBlob,
            })
            .then((id) => {
              const url = `${URL.createObjectURL(audioBlob)}#draftId=${id}`;

              setAudioUrl(url);
              onChangeVoiceUrl(url);
            });
        };

        mediaRecorder.current.start();
        setRecordState("recording");
      })
      .catch((error) => {
        setRecordState("inactive");
        console.error("Error accessing microphone:", error);
      });
  }

  function resume() {
    mediaRecorder.current.resume();
    setRecordState("recording");
  }

  function pause() {
    mediaRecorder.current.pause();
    setRecordState("paused");
  }

  function stop() {
    mediaRecorder.current.stop();
    setRecordState("inactive");
  }

  return (
    <Flex flexDirection={"column"} gap={4}>
      <Flex gap={4}>
        {recordState === "inactive" && (
          <Button colorScheme="teal" onClick={start}>
            开始
          </Button>
        )}
        {recordState === "recording" && (
          <Button colorScheme="teal" onClick={pause}>
            暂停
          </Button>
        )}
        {recordState === "paused" && (
          <Button colorScheme="teal" onClick={resume}>
            继续
          </Button>
        )}

        {["recording", "paused"].includes(recordState) && (
          <Button colorScheme="red" onClick={stop}>
            结束
          </Button>
        )}
      </Flex>
      {audioUrl && <audio src={audioUrl} controls></audio>}
    </Flex>
  );
}
