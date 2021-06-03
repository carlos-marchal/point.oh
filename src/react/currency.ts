import React, { useLayoutEffect, useRef } from "react";
import type { InputState } from "../core";
import { CurrencyPointOh as CurrencyPointOhClass, CurrencyPointOhOptions } from "../currency";

export interface CurrencyPointOhProps {
  options?: CurrencyPointOhOptions;
  onChange?: (value: number) => void;
  value?: number;
}

export default function CurrencyPointOh({ options, onChange, value }: CurrencyPointOhProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pointOh = useRef<CurrencyPointOhClass>();
  useLayoutEffect(() => {
    const input = inputRef.current!;
    pointOh.current = new CurrencyPointOhClass(input, options);
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
