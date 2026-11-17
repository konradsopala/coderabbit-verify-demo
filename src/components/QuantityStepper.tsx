interface Props {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}

export function QuantityStepper({ value, min = 1, max, onChange, label }: Props) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <input
        className="stepper__input"
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        aria-label="Quantity"
        onChange={(e) => {
          const n = Number.parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) onChange(clamp(n));
        }}
      />
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
