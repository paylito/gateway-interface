// Central place for the order API contract + small pure helpers shared by the
// data hook, the page, and the preview routes.

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:3030";

/** GET endpoint for a single order. */
export const orderEndpoint = (id: string) => `${API_BASE}/orders/${id}`;

/** POST endpoint that emails a one-time receipt for a finished order. */
export const receiptEndpoint = (id: string) => `${API_BASE}/orders/${id}/receipt`;

/** USD price per 1 unit of each token, returned (populated) on the order. */
export interface Rates {
  BTC: number;
  ETH: number;
  BNB: number;
  XLM: number;
  TRX: number;
  USDC: number;
  SOL: number;
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
/** One token's pricing row in an order's pricing matrix. All values are decimal
 *  strings. The PAYER sends `total` (amount + service fee + network fee); the
 *  merchant ultimately receives `amount`. The backend settles against `total`. */
export interface TokenPricing {
  symbol: string;
  priceUsd: string;
  amountUsd: string;
  amount: string;
  serviceFeeUsd: string;
  serviceFee: string;
  networkFeeUsd: string;
  networkFee: string;
  totalUsd: string;
  total: string;
}

export interface NetworkPricing {
  network: string;
  networkFeeUsd: string;
  tokens: TokenPricing[];
}

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
  /** Authoritative per-network/token pricing from the API. The payer must send
   *  the chosen row's `total` (amount + service + network fee) — not `amount`. */
  pricing?: NetworkPricing[];
  user?: {
    username?: string;
    name?: string;
  };
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

/** Backend words that mean the payment resolved successfully. */
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

/** Backend words that mean the order is permanently closed *without* payment. */
const FAILED_STATUSES = [
  "expired",
  "cancelled",
  "canceled",
  "failed",
  "rejected",
  "voided",
];

/**
 * Map a backend status word to a resolved outcome for the active payer.
 *
 * Only an explicit success or failure word resolves the order. Pending and every
 * in-progress state (processing, detected, confirming, settling, manual_review,
 * …) — plus anything unrecognised — fall through to "pending" so the UI keeps
 * waiting for the backend's final word. The backend is the single source of
 * truth for the outcome; the local countdown must never decide it, otherwise a
 * deposit that's still confirming gets shown as expired.
 */
export function classifyStatus(
  status: string,
): "success" | "failed" | "pending" {
  const s = status.trim().toLowerCase();
  if (SUCCESS_STATUSES.some((word) => s.includes(word))) return "success";
  if (FAILED_STATUSES.some((word) => s.includes(word))) return "failed";
  return "pending"; // processing / confirming / settling / manual_review / unknown
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

/**
 * Find the pricing row for a network/token pair in an order's pricing matrix.
 * This matrix is the single source of truth the backend settles against, so the
 * UI must read the amount to charge from here (`total`) rather than recomputing
 * it from the USD amount — which omits the service + network fee the payer covers.
 */
export function findPricing(
  pricing: NetworkPricing[] | undefined,
  network: string | undefined,
  symbol: string | undefined,
): TokenPricing | undefined {
  if (!pricing || !network || !symbol) return undefined;
  return pricing
    .find((p) => p.network === network)
    ?.tokens.find((t) => t.symbol === symbol);
}

/** Compact token amount: up to 6 decimals with trailing zeros trimmed. */
export function formatToken(value: number): string {
  return parseFloat(value.toFixed(6)).toString();
}

/** Tab <title> + <meta description> for each screen of the order flow.
 *
 *  The id comes straight from the URL, so every screen can show it — even the
 *  loading / not-found / closed ones that never load the order body. */
export function orderMeta(
  phase: OrderPhase,
  id: string | undefined,
): { title: string; description: string } {
  // "Order #299190" for titles, "order #299190" for mid-sentence descriptions.
  const ref = id ? `Order #${id}` : "Order";
  const subject = id ? `order #${id}` : "this order";

  switch (phase) {
    case "loading":
      return { title: `${ref} · Loading`, description: `Loading ${subject}…` };
    case "pending":
      return {
        title: `${ref} · Complete your payment`,
        description: `Choose an asset and network to pay ${subject} before it expires.`,
      };
    case "success":
      return {
        title: `${ref} · Payment successful`,
        description: `Payment for ${subject} was sent successfully.`,
      };
    case "failed":
      return {
        title: `${ref} · Payment expired`,
        description: `The payment window for ${subject} has expired.`,
      };
    case "closed":
      return {
        title: `${ref} · No longer active`,
        description: `This payment link for ${subject} is no longer active.`,
      };
    case "error":
      return {
        title: `${ref} · Something went wrong`,
        description: `We couldn't load ${subject}. Please try again.`,
      };
    case "notfound":
    default:
      return {
        title: `${ref} · Not found`,
        description: `We couldn't find ${subject}.`,
      };
  }
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
    CELO: 0.7,
    POL: 0.55,
    USDT: 1,
  },
};
