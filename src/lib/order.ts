// Central place for the order API contract + small pure helpers shared by the
// data hook, the page, and the preview routes.

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:3030";

/** GET endpoint for a single order. */
export const orderEndpoint = (id: string) => `${API_BASE}/orders/${id}`;

/** USD price per 1 unit of each token, returned (populated) on the order. */
export interface Rates {
  BTC: number;
  ETH: number;
  BNB: number;
  XLM: number;
  TRX: number;
  USDC: number;
  SOL: number;
  DAI: number;
  CELO: number;
  POL: number;
  USDT: number;
}

/**
 * The order payload returned by GET /orders/:id when the order is still
 * pending. Only the fields the UI actually uses are typed; the API returns a
 * few more (per-chain addresses) that we ignore because we only support EVM
 * chains and always collect to `smartAccount`.
 */
export interface OrderData {
  _id: string;
  id: string;
  /** Fiat amount owed, in USD, as a string (e.g. "320"). */
  amount: string;
  status: string;
  /** EVM smart-account address the payer sends funds to. */
  smartAccount: string;
  createdAt: string;
  expiresAt: string;
  rates: Rates;
}

/** What the API returns: `data` is the order object while pending, otherwise a
 *  short string like "Order is expired" / "Order is completed". */
export interface OrderApiResponse {
  success: boolean;
  data?: OrderData | string;
  message?: string;
}

/** UI phases derived from the API response + the local countdown. */
export type OrderPhase =
  | "loading"
  | "notfound"
  | "error"
  | "closed"
  | "pending"
  | "success"
  | "failed";

const SUCCESS_STATUSES = [
  "completed",
  "complete",
  "paid",
  "success",
  "succeeded",
  "finished",
  "confirmed",
  "settled",
  "done",
];

/** Map a backend status word to a resolved outcome for the active payer. */
export function classifyStatus(
  status: string,
): "success" | "failed" | "pending" {
  const s = status.trim().toLowerCase();
  if (s === "pending") return "pending";
  if (SUCCESS_STATUSES.includes(s)) return "success";
  return "failed"; // expired / cancelled / failed / rejected / unknown
}

/** Non-pending orders come back as `data: "Order is <status>"`; pull the word. */
export function parseClosedStatus(data: string): string {
  return data.replace(/^order\s+is\s+/i, "").trim() || "closed";
}

/** Milliseconds → "MM:SS" (never negative). */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Crypto amount to send = USD owed / (USD price per token). null if unknown. */
export function getTokenAmount(
  amountUsd: string,
  rates: Rates,
  symbol: string | undefined,
): number | null {
  if (!symbol) return null;
  const rate = rates[symbol as keyof Rates];
  if (!rate || rate <= 0) return null;
  const usd = parseFloat(amountUsd);
  if (!Number.isFinite(usd)) return null;
  return usd / rate;
}

/** Compact token amount: up to 6 decimals with trailing zeros trimmed. */
export function formatToken(value: number): string {
  return parseFloat(value.toFixed(6)).toString();
}

// Module-load timestamps, used only by the static preview routes (not render).
const previewCreated = new Date(Date.now()).toISOString();
const previewExpires = new Date(Date.now() + 20 * 60 * 1000).toISOString();

/** Sample order so /success and /failed can be eyeballed without a backend. */
export const MOCK_ORDER: OrderData = {
  _id: "mock",
  id: "299190",
  amount: "320",
  status: "pending",
  smartAccount: "0x9aE3f8C2b71D4F6a0E2c5B8d1A4F7e9C3b6D0a2F",
  createdAt: previewCreated,
  expiresAt: previewExpires,
  rates: {
    BTC: 64000,
    ETH: 3000,
    BNB: 580,
    XLM: 0.11,
    TRX: 0.12,
    USDC: 1,
    SOL: 145,
    DAI: 1,
    CELO: 0.7,
    POL: 0.55,
    USDT: 1,
  },
};
