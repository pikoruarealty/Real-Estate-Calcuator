import { DISCLAIMER } from '@/content/copy';

export function Disclaimer({ className = '' }: { className?: string }) {
  return <p className={`text-xs leading-relaxed text-text-muted ${className}`}>{DISCLAIMER}</p>;
}
