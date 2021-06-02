import { InputState, PointOh, PointOhHandler, TransitionHandler } from "./core";
import { NumericPointOhOptions, numericTransition } from "./numeric";

export interface CurrencyPointOhOptions extends NumericPointOhOptions {
  currencySymbol?: string;
}

export function currencyTransition(
  options: Required<CurrencyPointOhOptions>,
  initialState: InputState<number>
): TransitionHandler<number> {
  const numeric = numericTransition(options);
  const { currencySymbol = "€" } = options ?? {};
  const suffix = " " + currencySymbol;
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
    return newState;
  };
}

export class CurrencyPointOh extends PointOh<number> {
  constructor(input: HTMLInputElement, options: CurrencyPointOhOptions = {}) {
    const {
      decimals = 2,
      thousandSeparator = ".",
      shownDecimalSeparator = ",",
      acceptedDecimalSeparators = [",", "."],
      maxValue = Number.POSITIVE_INFINITY,
      currencySymbol = "€",
    } = options;
    function stateFor(value: number): InputState<number> {
      value = Math.min(value, maxValue);
      const [integer, decimal] = value.toString().split(".");
      let rawValue = "";
      for (let i = integer.length; i > 0; i = i - 3) {
        if (i !== integer.length) rawValue = thousandSeparator + rawValue;
        rawValue = integer.slice(Math.max(i - 3, 0), i) + rawValue;
      }
      if (decimal !== undefined) {
        rawValue = rawValue + shownDecimalSeparator + decimal.slice(0, decimals);
      }
      rawValue = rawValue + " " + currencySymbol;
      const cursor = rawValue.length - 2;
      return { rawValue, value, selectionStart: cursor, selectionEnd: cursor };
    }
    const initialState = stateFor(0);
    const handler: PointOhHandler<number> = {
      transitionHandler: currencyTransition(
        {
          decimals,
          thousandSeparator,
          shownDecimalSeparator,
          acceptedDecimalSeparators,
          maxValue,
          currencySymbol,
        },
        initialState
      ),
      stateFor,
    };
    super(input, handler, initialState);
  }
}
