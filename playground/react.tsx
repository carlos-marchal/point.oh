import React, { useState } from "react";
import CurrencyPointOh from "../src/react/currency";
import NumericPointOh from "../src/react/numeric";
import PercentagePointOh from "../src/react/percentage";

export default () => {
  const [value, setValue] = useState(0);
  return (
    <>
      React Version
      <NumericPointOh value={value} onChange={setValue} />
      <CurrencyPointOh value={value} onChange={setValue} />
      <PercentagePointOh value={value} onChange={setValue} />
      Value: {value}
    </>
  );
};
