// lib/utils.ts

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine des classes conditionnelles avec clsx et merge avec tailwind-merge.
 * Utile pour le design dynamique dans Shadcn UI.
 */
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}
