import React, { useLayoutEffect, useRef } from "react";
import { InputState } from "../core";
import { PercentagePointOh as PercentagePointOhClass, PercentagePointOhOptions } from "../percentage";

export interface PercentagePointOhProps {
  options?: PercentagePointOhOptions;
  onChange?: (value: number) => void;
  value?: number;
}

export default function PercentagePointOh({ options, onChange, value }: PercentagePointOhProps) {
  const input = useRef<HTMLInputElement | null>();
  const pointOh = useRef<PercentagePointOhClass>();
  useLayoutEffect(() => {
    pointOh.current = new PercentagePointOhClass(input.current, options);
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
