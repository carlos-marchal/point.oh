import React, { useLayoutEffect, useRef } from "react";
import { InputState } from "../core";
import { NumericPointOh as NumericPointOhClass, NumericPointOhOptions } from "../numeric";

export interface NumericPointOhProps {
  options?: NumericPointOhOptions;
  onChange?: (value: number) => void;
  value?: number;
}

export default function NumericPointOh({ options, onChange, value }: NumericPointOhProps) {
  const input = useRef<HTMLInputElement | null>();
  const pointOh = useRef<NumericPointOhClass>();
  useLayoutEffect(() => {
    pointOh.current = new NumericPointOhClass(input.current, options);
    function listener(event: Event): void {
      const customEvent = event as CustomEvent<InputState<number>>;
      onChange(customEvent.detail.value);
    }
    input.current.addEventListener("point.oh/update", listener);
    return () => {
      input.current.removeEventListener("point.oh/update", listener);
      pointOh.current.unregister();
    };
  }, [options, onChange]);
  useLayoutEffect(() => {
    pointOh.current.setValue(value);
  }, [value]);
  return React.createElement("input", { ref: input });
}
