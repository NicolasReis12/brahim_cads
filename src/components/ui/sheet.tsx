"use client";

import dynamic from "next/dynamic";
import { useState, type ComponentProps } from "react";

// Motion + Radix Dialog só descem quando o primeiro painel é aberto (carrinho, menu, filtros),
// tirando ~45 KB do carregamento inicial de toda página.
const SheetImpl = dynamic(() => import("./sheet-impl").then((m) => m.Sheet), { ssr: false });

type Props = ComponentProps<typeof SheetImpl>;

export function Sheet(props: Props) {
  const [armed, setArmed] = useState(props.open);
  if (props.open && !armed) setArmed(true);
  return armed ? <SheetImpl {...props} /> : null;
}
