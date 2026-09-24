"use client";

import { useState, useTransition } from "react";
import { updateOrderStatusAction } from "@/app/admin/actions";
import { Select } from "@/components/ui/form";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";

const LABEL: Record<OrderStatus, string> = {
  pendente: "Pendente (aguardando pagamento)",
  pago: "Pago — separar",
  enviado: "Enviado",
  entregue: "Entregue / retirado",
  cancelado: "Cancelado",
};

export function OrderStatusSelect({ id, status }: { id: string; status: OrderStatus }) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={`st-${id}`} className="meta shrink-0">Status</label>
      <Select
        id={`st-${id}`}
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as OrderStatus;
          setValue(next);
          startTransition(() => updateOrderStatusAction(id, next));
        }}
        className="h-9 text-sm"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>{LABEL[s]}</option>
        ))}
      </Select>
    </div>
  );
}
