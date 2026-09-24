"use client";

import { useEffect } from "react";
import { cart } from "./cart-store";

export function ClearCartOnPaid() {
  useEffect(() => cart.clear(), []);
  return null;
}
