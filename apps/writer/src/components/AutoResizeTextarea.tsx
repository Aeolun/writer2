import {
  CSSProperties,
  SyntheticEvent,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";

const textAreaStyle: CSSProperties = {
  outline: "none",
  background: "transparent",
  padding: "0.5em",
  overflow: "hidden",
  resize: "none",
};

const resize = (textArea: HTMLTextAreaElement) => {
  textArea.style.height = "auto";
  textArea.style.height = textArea.scrollHeight + "px";
};

export const AutoResizeTextarea = (
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) => {
  const textArea = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const current = textArea.current;
    if (current) {
      current.style.height = "auto";
      current.style.height = current.scrollHeight + "px";
    }
  }, []);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      resize(e.currentTarget);
      props.onChange && props.onChange(e);
    },
    [props.onChange],
  );
  const onFocus = useCallback(
    (e: SyntheticEvent<HTMLTextAreaElement>) => {
      resize(e.currentTarget);
      props.onFocus && props.onFocus(e);
    },
    [props.onFocus],
  );

  return (
    <textarea
      {...props}
      ref={textArea}
      onChange={onChange}
      onFocus={onFocus}
      style={textAreaStyle}
    />
  );
};
