const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** Formats an amount in cents as US dollars, e.g. 64900 → "$649.00". */
export function formatPrice(cents: number): string {
  return currency.format(cents / 100);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
