import { Flex, Button, useToast } from "@chakra-ui/react";
import { useRef, useState } from "react";

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
  const toast = useToast();

  function start() {
    navigator.mediaDevices
      .getUserMedia({ audio: { channelCount: 2, sampleRate: 44100 } })
      .then((stream) => {
        const track = stream.getAudioTracks()[0];
        const capabilities = track.getCapabilities();
        if (
          capabilities.channelCount.max < 2 ||
          capabilities.sampleRate.max < 44100
        ) {
          toast({
            description:
              "设备录音规格不满足（最低要求双声道，采样率44100），请使用上传配音",
            status: "error",
          });
          return;
        }

        mediaRecorder.current = new MediaRecorder(stream, {
          audioBitsPerSecond: 128000,
        });
        const audioChunks = [];

        mediaRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.current.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
          const url = URL.createObjectURL(audioBlob);

          setAudioUrl(url);
          onChangeVoiceUrl(url);
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
