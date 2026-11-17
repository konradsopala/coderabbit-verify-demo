interface Props {
  value: number;
  count?: number;
}

export function Rating({ value, count }: Props) {
  const rounded = Math.round(value);
  return (
    <span className="rating" aria-label={`Rated ${value.toFixed(1)} out of 5${count != null ? ` from ${count} reviews` : ''}`}>
      <span className="rating__stars" aria-hidden="true">
        {'★'.repeat(rounded)}
        <span className="rating__empty">{'★'.repeat(5 - rounded)}</span>
      </span>
      <span className="rating__value">{value.toFixed(1)}</span>
      {count != null && <span className="rating__count">({count})</span>}
    </span>
  );
}
