import React, { useLayoutEffect, useRef } from "react";
import { InputState } from "../core";
import { CurrencyPointOh as CurrencyPointOhClass, CurrencyPointOhOptions } from "../currency";

export interface CurrencyPointOhProps {
  options?: CurrencyPointOhOptions;
  onChange?: (value: number) => void;
  value?: number;
}

export default function CurrencyPointOh({ options, onChange, value }: CurrencyPointOhProps) {
  const input = useRef<HTMLInputElement | null>();
  const pointOh = useRef<CurrencyPointOhClass>();
  useLayoutEffect(() => {
    pointOh.current = new CurrencyPointOhClass(input.current, options);
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
