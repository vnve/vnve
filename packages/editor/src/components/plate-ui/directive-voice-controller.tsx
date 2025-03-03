"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  FileAudio,
  AudioLinesIcon,
  Pause,
  Play,
  Trash2,
  Volume2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAssetLibrary } from "../hooks/useAssetLibrary";
import { useEditorStore } from "@/store";
import { useSettingsStore } from "@/store/settings";
import { useToast } from "../hooks/use-toast";
import { createSound } from "@/lib/core";
import {
  DBAssetType,
  getAssetById,
  getAssetSourceURLByAsset,
  importAssetToProjectTmp,
  NARRATOR_ASSET_ID,
} from "@/db";
import { longTextSynthesis } from "@/lib/tts";
import { fetchAudioFile, linesToText } from "@/lib/utils";
import { Sound, Sprite } from "@vnve/core";
import { Loader } from "../ui/loader";

export function DirectiveVoiceController({ speak, lines, onChangeSpeak }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1); // 添加音量状态
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const { selectAsset } = useAssetLibrary();
  const editor = useEditorStore((state) => state.editor);
  const project = useEditorStore((state) => state.project);
  const ttsSettings = useSettingsStore((state) => state.tts);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const changeVoice = useCallback(
    (voice) => {
      onChangeSpeak({
        ...speak,
        voice: {
          ...(speak.voice || {}),
          ...voice,
        },
      });
    },
    [onChangeSpeak, speak],
  );

  const handleGenerateTTS = async () => {
    if (!ttsSettings || !ttsSettings.appid || !ttsSettings.token) {
      toast({
        title: "配音生成失败",
        description: "请检查语音合成设置",
        variant: "destructive",
      });
      return;
    }

    const speakerTargetName = speak.speaker.speakerTargetName;
    let speakerAssetID;

    if (speakerTargetName === "Narrator") {
      speakerAssetID = NARRATOR_ASSET_ID;
    } else {
      const speakerSprite = editor.activeScene.getChildByName(
        speakerTargetName,
      ) as Sprite;
      speakerAssetID = speakerSprite.assetID;
    }

    const speakerAsset = await getAssetById(speakerAssetID);
    const voice = speakerAsset.voice;

    if (!voice) {
      toast({
        title: "配音生成失败",
        description: "当前角色没有配置音色, 请在素材库中先配置音色",
        variant: "destructive",
      });
      return;
    }

    // 更新前，假如已经有配音，先从场景中删除
    if (speak.voice?.targetName) {
      editor.removeSoundByName(speak.voice.targetName);
    }

    setIsGenerating(true);

    try {
      const text = linesToText(lines);
      const result = await longTextSynthesis({
        token: ttsSettings.token,
        appid: ttsSettings.appid,
        text,
        voiceType: voice,
      });
      const file = await fetchAudioFile(result.audio_url, text.slice(0, 6));
      const soundAsset = await importAssetToProjectTmp(
        project.id,
        DBAssetType.Audio,
        file,
      );
      const sound = createSound(soundAsset);

      editor.addSound(sound);
      changeVoice({
        label: sound.label,
        targetName: sound.name,
      });
      const audioUrl = getAssetSourceURLByAsset(soundAsset);
      setAudioUrl(audioUrl);
      toast({
        title: "配音生成成功!",
        duration: 1500,
      });
    } catch (error) {
      console.error("TTS generation failed:", error);
      toast({
        title: "配音生成失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = useCallback(async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        if (audioUrl) {
          audioRef.current.play();
        } else {
          const sound = editor.activeScene.getSoundByName(
            speak.voice.targetName,
          ) as Sound;
          const asset = await getAssetById(sound.assetID, sound.label);
          const url = getAssetSourceURLByAsset(asset);

          setAudioUrl(url);
        }
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, audioUrl, speak, editor]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleSliderChange = useCallback((value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  }, []);

  const handleVolumeChange = useCallback(
    (value: number[]) => {
      if (audioRef.current) {
        const newVolume = value[0];
        audioRef.current.volume = newVolume;
        setVolume(newVolume);
        changeVoice({
          volume: newVolume,
        });
      }
    },
    [changeVoice],
  );

  const handleSelectAsset = useCallback(async () => {
    const asset = await selectAsset(DBAssetType.Audio);
    if (asset) {
      // 更新前，假如已经有配音，先从场景中删除
      if (speak.voice?.targetName) {
        editor.removeSoundByName(speak.voice.targetName);
      }

      const sound = createSound(asset);

      editor.addSound(sound);

      changeVoice({
        label: sound.label,
        targetName: sound.name,
      });
    }
  }, [speak, editor, changeVoice, selectAsset]);

  const handleDelete = useCallback(() => {
    setAudioUrl("");
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    editor.removeSoundByName(speak.voice.targetName);
    changeVoice({
      label: "",
      targetName: "",
    });
  }, [editor, changeVoice, speak]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // 添加音量初始化的 effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, audioUrl]);

  // 当音频地址变化时，如果处于播放状态，自动播放
  useEffect(() => {
    if (audioUrl && isPlaying && audioRef.current) {
      audioRef.current.play();
    }
  }, [audioUrl, isPlaying]);

  return (
    <div className="flex items-center w-full gap-2 p-1 border border-t-0 rounded-md rounded-t-none bg-background h-[32px]">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      {speak.voice?.targetName ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="w-3 h-3" />
            ) : (
              <Play className="w-3 h-3" />
            )}
          </Button>

          <div className="flex items-center flex-1 gap-2">
            {isPlaying ? (
              <>
                <span className="text-xs text-muted-foreground min-w-[35px]">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={0.1}
                  className="w-full"
                  onValueChange={handleSliderChange}
                />
                <span className="text-xs text-muted-foreground min-w-[35px]">
                  {formatTime(duration)}
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                {speak.voice.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="w-6 h-6">
                  <Volume2 className="w-3 h-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[260px] p-2" side="top">
                <Slider
                  value={[volume]}
                  max={1}
                  step={0.1}
                  className="w-full"
                  onValueChange={handleVolumeChange}
                  showPercentage={true}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-around w-full h-full px-1">
          <Button
            variant="ghost"
            size="icon"
            className="flex-1 h-6 mx-1 text-xs"
            disabled={isGenerating}
            onClick={handleSelectAsset}
          >
            <FileAudio className="w-3 h-3 mr-1" />
            选择配音
          </Button>

          <Button
            variant="ghost"
            size="icon"
            disabled={isGenerating}
            className="flex-1 h-6 mx-1 text-xs"
            onClick={handleGenerateTTS}
          >
            {isGenerating ? (
              <>
                <Loader className="w-3 h-3 mr-1"></Loader>生成中...
              </>
            ) : (
              <>
                <AudioLinesIcon className="w-3 h-3 mr-1" />
                生成配音
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
