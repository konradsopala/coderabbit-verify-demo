import type { CSSProperties } from 'react';
import type { Product } from '../data/products';

interface Props {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
}

export function ProductImage({ product, size = 'md' }: Props) {
  const style = {
    '--tile-hue': product.hue,
  } as CSSProperties;
  return (
    <div className={`product-image product-image--${size}`} style={style} role="img" aria-label={product.name}>
      <span aria-hidden="true">{product.emoji}</span>
    </div>
  );
}
