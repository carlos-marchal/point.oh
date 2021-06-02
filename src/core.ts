export interface InputState<T> {
  selectionStart: number;
  selectionEnd: number;
  rawValue: string;
  value: T;
}

export interface Transition<T> {
  previousState: InputState<T>;

  leftData: string;
  leftAnchor: number;

  removedData: string;
  addedData: string;

  rightAnchor: number;
  rightData: string;

  fullData: string;
}

export interface TransitionHandler<T> {
  (transition: Transition<T>): InputState<T>;
}

export interface PointOhHandler<T> {
  transitionHandler: TransitionHandler<T>;
  stateFor(value: T): InputState<T>;
}

export class PointOh<T> {
  input: HTMLInputElement;
  state: InputState<T>;
  unregister: () => void;

  private handler: PointOhHandler<T>;
  private lastWasDelete = false;
  private syncState: () => void;

  constructor(input: HTMLInputElement, handler: PointOhHandler<T>, initialState: InputState<T>) {
    this.syncState = (): void => {
      this.input.value = this.state.rawValue;
      this.input.setSelectionRange(this.state.selectionStart, this.state.selectionEnd);
    };

    this.input = input;
    this.handler = handler;
    this.state = { ...initialState };
    this.syncState();

    const updateSelection = (event: KeyboardEvent | MouseEvent): void => {
      this.state.selectionStart = this.input.selectionStart ?? 0;
      this.state.selectionEnd = this.input.selectionEnd ?? 0;

      if (event instanceof KeyboardEvent) {
        this.lastWasDelete = event.key === "Delete";
      }
    };
    input.addEventListener("click", updateSelection);
    input.addEventListener("keydown", updateSelection);

    input.addEventListener("focus", () => setTimeout(this.syncState));

    const handleInput = (): void => {
      const oldValue = this.state.rawValue;
      const newValue = this.input.value;

      let removedStart: number;
      let removedEnd: number;
      if (this.state.selectionStart !== this.state.selectionEnd) {
        removedStart = this.state.selectionStart;
        removedEnd = this.state.selectionEnd;
      } else if (oldValue.length > newValue.length) {
        if (this.lastWasDelete) {
          removedStart = this.state.selectionStart;
          removedEnd = removedStart + 1;
        } else {
          removedEnd = this.state.selectionStart;
          removedStart = removedEnd - 1;
        }
      } else {
        removedStart = 0;
        removedEnd = 0;
      }
      const removedLength = removedEnd - removedStart;
      const removedData = oldValue.slice(removedStart, removedEnd);

      const addedLength = newValue.length - oldValue.length + removedLength;
      const addedEnd = this.input.selectionEnd ?? 0;
      const addedStart = addedEnd - addedLength;
      const addedData = newValue.slice(addedStart, addedEnd);

      const transition: Transition<T> = {
        previousState: { ...this.state },

        leftAnchor: addedStart,
        leftData: newValue.slice(0, addedStart),
        addedData,
        removedData,
        rightAnchor: addedEnd,
        rightData: newValue.slice(addedEnd),

        fullData: newValue,
      };

      const finalState = this.handler.transitionHandler(transition);
      this.state = { ...finalState };
      this.syncState();

      const updateEvent = new CustomEvent("point.oh/update", { detail: this.state });
      this.input.dispatchEvent(updateEvent);
    };
    input.addEventListener("input", handleInput);

    const unregister = (): void => {
      input.removeEventListener("click", updateSelection);
      input.removeEventListener("keydown", updateSelection);
      input.removeEventListener("input", handleInput);
      input.removeEventListener("focus", this.syncState);
    };
    this.unregister = unregister;
  }

  setValue(value: T): void {
    if (value !== this.state.value) {
      this.state = this.handler.stateFor(value);
      this.syncState();
    }
  }
}

export default PointOh;
