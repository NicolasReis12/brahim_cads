import "server-only";
import { isSupabaseConfigured } from "../supabase/clients";
import { localRepository } from "./local";
import type { Repository } from "./repository";
import { supabaseRepository } from "./supabase";

export const repo: Repository = isSupabaseConfigured ? supabaseRepository : localRepository;

export { StockError } from "./repository";
