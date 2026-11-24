import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
const styles: Record<Variant, string> = {
  primary: 'bg-gold text-black hover:brightness-110 font-semibold',
  secondary: 'border border-gold text-gold hover:bg-gold/10',
  ghost: 'text-text-muted hover:text-text hover:bg-surface-2',
};

export function Button({ variant = 'primary', className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    />
  );
}
