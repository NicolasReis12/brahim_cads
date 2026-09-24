"use client";

import { Plus } from "lucide-react";
import { Accordion } from "radix-ui";

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <Accordion.Root type="multiple" className="border-t border-line">
      {items.map((item, i) => (
        <Accordion.Item key={item.q} value={`q${i}`} className="border-b border-line">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-4 text-left text-ink hover:text-gold">
              <span className="font-medium">{item.q}</span>
              <Plus
                size={18}
                strokeWidth={1.75}
                aria-hidden
                className="shrink-0 text-ink-subtle transition-transform duration-200 group-data-[state=open]:rotate-45 motion-reduce:transition-none"
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden pb-5 pr-8 text-ink-muted">
            <p className="max-w-prose leading-relaxed">{item.a}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
