import React, { useLayoutEffect, useRef } from "react";
import type { InputState } from "../core";
import { NumericPointOh as NumericPointOhClass, NumericPointOhOptions } from "../numeric";

export interface NumericPointOhProps {
  options?: NumericPointOhOptions;
  onChange?: (value: number) => void;
  value?: number;
}

export default function NumericPointOh({ options, onChange, value }: NumericPointOhProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pointOh = useRef<NumericPointOhClass>();
  useLayoutEffect(() => {
    const input = inputRef.current!;
    pointOh.current = new NumericPointOhClass(input, options);
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
