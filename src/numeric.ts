import { PointOh, PointOhHandler, TransitionHandler } from "./core";

export interface NumericPointOhOptions {
  decimals?: number;
  thousandSeparator?: string;
  shownDecimalSeparator?: string;
  acceptedDecimalSeparators?: string[];
  maxValue?: number;
}

export function numericTransition(
  options: Required<NumericPointOhOptions>
): TransitionHandler<number> {
  const {
    decimals,
    thousandSeparator,
    shownDecimalSeparator,
    acceptedDecimalSeparators,
    maxValue,
  } = options;
  const validRegexp = new RegExp(`[^0-9${acceptedDecimalSeparators.join("")}]`);
  return function transition(transition) {
    if (validRegexp.test(transition.addedData)) {
      return transition.previousState;
    }
    let rawValue = transition.fullData;
    let cursor = transition.rightAnchor;

    // Ensure any added decimal point is shown as selected
    for (let i = transition.leftAnchor; i < transition.rightAnchor; i++) {
      if (acceptedDecimalSeparators.includes(transition.fullData[i])) {
        rawValue = rawValue.slice(0, i) + shownDecimalSeparator + rawValue.slice(i + 1);
      }
    }

    // Ensure there is only one decimal separator
    let decimalPosition = rawValue.indexOf(shownDecimalSeparator);
    if (rawValue.indexOf(shownDecimalSeparator, decimalPosition + 1) !== -1) {
      return transition.previousState;
    }

    // Remove thousand separators
    for (let i = 0; i < rawValue.length; i++) {
      if (rawValue[i] === thousandSeparator) {
        if (i < cursor) cursor--;
        rawValue = rawValue.slice(0, i) + rawValue.slice(i + 1);
      }
    }

    // Ensure there is at most the specified number of decimals
    if (decimalPosition !== -1) {
      let trailingDecimals = 0;
      while (
        trailingDecimals < rawValue.length &&
        rawValue[rawValue.length - 1 - trailingDecimals] !== shownDecimalSeparator
      ) {
        trailingDecimals++;
      }
      if (trailingDecimals > decimals) {
        if (transition.previousState.rawValue.includes(shownDecimalSeparator)) {
          return transition.previousState;
        } else {
          rawValue = rawValue.slice(0, decimals - trailingDecimals);
        }
      }
    }

    // Ensure leading zero in decimal values
    if (rawValue[0] === shownDecimalSeparator) {
      rawValue = "0" + rawValue;
    }

    // Ensure at most one leading zero, only for values in (1, 0]
    let leadingZeroes = 0;
    while (leadingZeroes < rawValue.length && rawValue[leadingZeroes] === "0") {
      leadingZeroes++;
    }
    if (rawValue[leadingZeroes] === shownDecimalSeparator) {
      leadingZeroes--;
    }
    rawValue = rawValue.slice(leadingZeroes);
    cursor = leadingZeroes > cursor ? 0 : cursor - leadingZeroes;

    // Ensure 0 is shown for empty value
    if (rawValue === "") {
      rawValue = "0";
      cursor++;
    }

    // Calculate value
    const value = Number.parseFloat(rawValue.replace(shownDecimalSeparator, "."));

    // Ensure value is in range
    if (value > maxValue) return transition.previousState;

    // Format thousands
    decimalPosition = rawValue.indexOf(shownDecimalSeparator);
    const formatAnchor = decimalPosition !== -1 ? decimalPosition : rawValue.length;
    let toFormat = rawValue.slice(0, formatAnchor);
    const rest = rawValue.slice(formatAnchor);
    let formatted = "";
    for (let i = toFormat.length; i > 0; i = i - 3) {
      if (i !== toFormat.length) {
        formatted = thousandSeparator + formatted;
        if (i < cursor) cursor++;
      }
      formatted = toFormat.slice(Math.max(i - 3, 0), i) + formatted;
    }
    rawValue = formatted + rest;

    return { rawValue, selectionStart: cursor, selectionEnd: cursor, value };
  };
}

export class NumericPointOh extends PointOh<number> {
  constructor(input: HTMLInputElement, options: NumericPointOhOptions = {}) {
    const {
      decimals = 2,
      thousandSeparator = ".",
      shownDecimalSeparator = ",",
      acceptedDecimalSeparators = [",", "."],
      maxValue = Number.POSITIVE_INFINITY,
    } = options;
    const handler: PointOhHandler<number> = {
      transitionHandler: numericTransition({
        decimals,
        thousandSeparator,
        shownDecimalSeparator,
        acceptedDecimalSeparators,
        maxValue,
      }),
      stateFor(value) {
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
        const cursor = rawValue.length;
        return { rawValue, value, selectionStart: cursor, selectionEnd: cursor };
      },
    };
    super(input, handler, handler.stateFor(0));
  }
}
