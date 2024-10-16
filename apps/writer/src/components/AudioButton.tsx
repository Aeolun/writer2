import { IconButton, type IconButtonProps } from "@chakra-ui/react";
import axios from "axios";
import { Pause, Play } from "iconoir-react";
import React, { useEffect, useRef, useState } from "react";
import { aiSpeech } from "../lib/ai-speech.ts";

export const AudioButton = (props: { text: string } & IconButtonProps) => {
  const [audioFile, setAudioFile] = useState<string | undefined>(undefined);
  const ref = useRef<HTMLAudioElement>(null);
  const { text, ...rest } = props;
  const [audioState, setAudioState] = useState<
    "loading" | "playing" | "stopped"
  >("stopped");

  useEffect(() => {
    if (ref.current) {
      ref.current?.addEventListener("ended", () => {
        setAudioFile(undefined);
        setAudioState("stopped");
      });
    }
  }, [audioFile]);

  return (
    <>
      {audioFile ? (
        <audio
          style={{ display: "none" }}
          ref={ref}
          controls
          autoPlay={true}
          src={audioFile}
        />
      ) : null}
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          if (audioState === "playing") {
            setAudioState("stopped");
            setAudioFile(undefined);
          } else {
            setAudioState("loading");
            aiSpeech(props.text).then((res) => {
              setAudioState("playing");
              console.log(res);
              setAudioFile(res);
            });
          }
        }}
        icon={audioState === "stopped" ? <Play /> : <Pause />}
        isLoading={audioState === "loading"}
        {...rest}
      >
        Speak
      </IconButton>
    </>
  );
};
