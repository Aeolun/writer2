import { JSX, createEffect, createSignal } from "solid-js";

const resize = (textArea: HTMLTextAreaElement) => {
  textArea.style.overflow = "hidden";
  textArea.style.height = "auto";
  textArea.style.height = `${textArea.scrollHeight}px`;
};

export const AutoResizeTextarea = (
  props: JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
) => {
  const [textarea, setTextarea] = createSignal<HTMLTextAreaElement>();

  createEffect(() => {
    const ta = textarea();
    if (ta) {
      resize(ta);
    }
  });

  return (
    <textarea
      {...props}
      ref={setTextarea}
      class="w-full py-2 px-2 outline-none resize-none text-justify"
      onInput={(e) => {
        const ta = textarea();
        if (ta) {
          resize(ta);
        }
        props.onInput?.(e);
      }}
    />
  );
};
