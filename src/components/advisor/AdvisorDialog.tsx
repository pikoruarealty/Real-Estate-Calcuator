'use client';

import { CloseIcon } from '@/components/ui/Icons';
import { useEffect, useId, useRef, useState } from 'react';
import { BRAND } from '@/config/brand';
import { PREFERRED_TIMES, leadSchema } from '@/lib/lead';
import { track } from '@/lib/analytics';
import { useApp } from '@/state/CalculatorContext';
import { Button } from '@/components/ui/Button';

type Status = 'idle' | 'sending' | 'done' | 'error';

export function AdvisorDialog() {
  const { advisorOpen, setAdvisorOpen, shareUrl, input, result } = useApp();
  const ref = useRef<HTMLDialogElement>(null);
  const uid = useId();
  const [form, setForm] = useState({ name: '', phone: '', email: '', preferredTime: 'Any', message: '', attach: true, company: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverMsg, setServerMsg] = useState('');

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (advisorOpen && !d.open) d.showModal();
    if (!advisorOpen && d.open) d.close();
  }, [advisorOpen]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      preferredTime: form.preferredTime,
      message: form.message,
      shareUrl: form.attach ? shareUrl : '',
      summary: form.attach
        ? {
            allInCost: result.cost?.allInCost ?? 0,
            carpetSqft: Math.round(result.area.carpetSqft ?? 0),
            projectName: input.cost.projectName,
          }
        : undefined,
      company: form.company,
    };
    const parsed = leadSchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[String(i.path[0])] ??= i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus('sending');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parsed.data }),
      });
      if (res.ok) {
        track('lead_submit');
        setStatus('done');
      } else if (res.status === 400) {
        const j = await res.json().catch(() => ({}));
        const errs: Record<string, string> = {};
        for (const [k, v] of Object.entries((j.errors ?? {}) as Record<string, string[]>)) errs[k] = v[0];
        setErrors(errs);
        setStatus('idle');
      } else {
        setServerMsg(res.status === 429 ? 'Too many requests. Please try again in a few minutes.' : 'We could not send your request. Please try again.');
        setStatus('error');
      }
    } catch {
      setServerMsg('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  }

  const close = () => {
    setAdvisorOpen(false);
    if (status === 'done') setStatus('idle');
  };

  const waText = encodeURIComponent(`Hi, I'm ${form.name.trim() || 'a visitor'}. Please help me with my property calculation: ${shareUrl}`);
  const inputCls = 'h-12 w-full rounded-2xl bg-surface-2 px-4 text-base text-text ring-1 placeholder:text-text-muted/40 focus:outline-none focus-visible:ring-gold/70 sm:text-[15px]';

  return (
    <dialog
      ref={ref}
      onClose={() => setAdvisorOpen(false)}
      onClick={(e) => e.target === ref.current && close()}
      aria-labelledby={`${uid}-t`}
      className="m-auto w-[min(32rem,calc(100vw-1.5rem))] rounded-3xl bg-surface p-0 text-text ring-1 ring-white/10 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-7">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div><h2 id={`${uid}-t`} className="text-2xl font-semibold tracking-tight">Talk to an expert</h2><p className="mt-1 text-sm text-text-muted">Free. We’ll call you back, usually the same day.</p></div>
          <button type="button" aria-label="Close" onClick={close} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-text-muted hover:text-text"><CloseIcon size={16} /></button>
        </div>

        {status === 'done' ? (
          <div className="space-y-4" role="status">
            <p className="text-lg text-gold">Thanks! Our advisor will call you soon.</p>
            {BRAND.advisorWhatsApp && (
              <a
                href={`https://wa.me/${BRAND.advisorWhatsApp}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-full bg-gold px-5 text-sm font-semibold text-black"
              >
                Chat on WhatsApp
              </a>
            )}
            <div><Button variant="ghost" onClick={close}>Close</Button></div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4">
            {/* honeypot */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>Company<input tabIndex={-1} autoComplete="off" value={form.company} onChange={(e) => set('company', e.target.value)} /></label>
            </div>

            <Field id={`${uid}-n`} label="Name *" error={errors.name}>
              <input id={`${uid}-n`} className={`${inputCls} ${errors.name ? 'ring-error' : 'ring-transparent'}`} value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
            </Field>
            <Field id={`${uid}-p`} label="Mobile number *" error={errors.phone}>
              <input id={`${uid}-p`} inputMode="tel" className={`${inputCls} ${errors.phone ? 'ring-error' : 'ring-transparent'}`} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="98XXXXXXXX" autoComplete="tel" />
            </Field>
            <Field id={`${uid}-e`} label="Email (optional)" error={errors.email}>
              <input id={`${uid}-e`} type="email" className={`${inputCls} ${errors.email ? 'ring-error' : 'ring-transparent'}`} value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
            </Field>
            <Field id={`${uid}-t2`} label="Preferred time to call">
              <select id={`${uid}-t2`} className={`${inputCls} ring-transparent`} value={form.preferredTime} onChange={(e) => set('preferredTime', e.target.value)}>
                {PREFERRED_TIMES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field id={`${uid}-m`} label="Message (optional)" error={errors.message}>
              <textarea id={`${uid}-m`} rows={3} maxLength={500} className={`${inputCls} h-auto py-3 ${errors.message ? 'ring-error' : 'ring-transparent'}`} value={form.message} onChange={(e) => set('message', e.target.value)} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.attach} onChange={(e) => set('attach', e.target.checked)} className="h-4 w-4 accent-[#D4AF37]" />
              Attach my calculation
            </label>

            {status === 'error' && <p role="alert" className="text-sm text-error">{serverMsg}</p>}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Request a call'}</Button>
              <Button variant="ghost" onClick={close}>Cancel</Button>
            </div>
            <p className="text-xs text-text-muted">We only use your details to contact you about this enquiry. No login needed to use the calculator.</p>
          </form>
        )}
      </div>
    </dialog>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[13px] text-text-muted">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
