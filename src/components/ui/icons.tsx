import type { SVGProps } from "react";

// Lucide não traz ícones de marca; estes seguem o mesmo traço (24px, stroke 1.75, pontas arredondadas).

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" width={20} height={20} aria-hidden {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

export function WhatsappIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" width={20} height={20} aria-hidden {...props}>
      <path d="M3.5 20.5 4.8 16.4A8.5 8.5 0 1 1 8 19.3Z" />
      <path d="M9 8.6c0 3.3 3 6.4 6.4 6.4l1.1-1.4-2-1-1 .8c-1-.5-2.2-1.6-2.7-2.7l.8-1-1-2Z" />
    </svg>
  );
}
