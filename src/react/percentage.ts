import React, { useLayoutEffect, useRef } from "react";
import type { InputState } from "../core";
import {
  PercentagePointOh as PercentagePointOhClass,
  PercentagePointOhOptions,
} from "../percentage";

export interface PercentagePointOhProps {
  options?: PercentagePointOhOptions;
  onChange?: (value: number) => void;
  value?: number;
}

export default function PercentagePointOh({ options, onChange, value }: PercentagePointOhProps) {
  const inputRef = useRef<HTMLInputElement | null>();
  const pointOh = useRef<PercentagePointOhClass>();
  useLayoutEffect(() => {
    const input = inputRef.current!;
    pointOh.current = new PercentagePointOhClass(input, options);
    function listener(event: Event): void {
      const customEvent = event as CustomEvent<InputState<number>>;
      onChange?.(customEvent.detail.value);
    }
    input.addEventListener("point.oh/update", listener);
    return () => {
      input.removeEventListener("point.oh/update", listener);
      pointOh.current!.unregister();
    };
  }, [options, onChange]);
  useLayoutEffect(() => {
    pointOh.current!.setValue(value ?? 0);
  }, [value]);
  return React.createElement("input", { ref: inputRef });
}
