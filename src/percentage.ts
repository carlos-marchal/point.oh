import { InputState, PointOh, PointOhHandler, TransitionHandler } from "./core";
import { NumericPointOhOptions, numericTransition } from "./numeric";

export interface PercentagePointOhOptions extends NumericPointOhOptions {}

export function percentageTransition(
  options: Required<PercentagePointOhOptions>,
  initialState: InputState<number>
): TransitionHandler<number> {
  const numeric = numericTransition(options);
  const suffix = " %";
  return function transitionHandler(transition) {
    if (transition.removedData === transition.previousState.rawValue) {
      return initialState;
    }
    const oldLength = transition.previousState.rawValue.length;
    const oldAnchor = oldLength - transition.rightData.length;
    if (oldAnchor > oldLength - 2) {
      transition.previousState.selectionStart = oldLength - 2;
      transition.previousState.selectionEnd = oldLength - 2;
      return transition.previousState;
    }
    transition.previousState.rawValue = transition.previousState.rawValue.slice(0, -2);
    transition.rightData = transition.rightData.slice(0, -2);
    transition.fullData = transition.fullData.slice(0, -2);
    const newState = numeric(transition);
    newState.rawValue = newState.rawValue + suffix;
    newState.value = newState.value / 100;
    return newState;
  };
}

export class PercentagePointOh extends PointOh<number> {
  constructor(input: HTMLInputElement, options: PercentagePointOhOptions = {}) {
    const {
      decimals = 2,
      thousandSeparator = ".",
      shownDecimalSeparator = ",",
      acceptedDecimalSeparators = [",", "."],
      maxValue = 1000,
    } = options;
    function stateFor(value: number): InputState<number> {
      value = Math.min(value, maxValue / 100);
      const fraction = value * 100;
      const [integer, decimal] = fraction.toString().split(".");
      let rawValue = "";
      for (let i = integer.length; i > 0; i = i - 3) {
        if (i !== integer.length) rawValue = thousandSeparator + rawValue;
        rawValue = integer.slice(Math.max(i - 3, 0), i) + rawValue;
      }
      if (decimal !== undefined) {
        rawValue = rawValue + shownDecimalSeparator + decimal.slice(0, decimals);
      }
      rawValue = rawValue + " %";
      const cursor = rawValue.length - 2;
      return { rawValue, value: fraction, selectionStart: cursor, selectionEnd: cursor };
    }
    const initialState = stateFor(0);
    const handler: PointOhHandler<number> = {
      transitionHandler: percentageTransition(
        {
          decimals,
          thousandSeparator,
          shownDecimalSeparator,
          acceptedDecimalSeparators,
          maxValue,
        },
        initialState
      ),
      stateFor,
    };
    super(input, handler, initialState);
  }
}
