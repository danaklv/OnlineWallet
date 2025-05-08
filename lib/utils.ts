import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CurrencyCode } from "@/components/providers/online-wallet-provider"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: CurrencyCode = "USD"): string {
  const currencyMap: Record<CurrencyCode, { locale: string; currency: string }> = {
    USD: { locale: "en-US", currency: "USD" },
    KZT: { locale: "kk-KZ", currency: "KZT" },
    RUB: { locale: "ru-RU", currency: "RUB" },
  }

  const { locale, currency: currencyCode } = currencyMap[currency]

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}
