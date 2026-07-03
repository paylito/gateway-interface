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
  /** True when the order was created from a donation link. `user` is then the
   *  donation page's public handle — not a telegram account — so the UI must
   *  not show the telegram icon next to it. */
  isDonation?: boolean;
  user?: {
    username?: string | null;
    name?: string | null;
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

/** USD figure for the fee breakdown: always shows cents ("$5.00") and keeps up
 *  to 4 decimals when the fee math produces them ("$0.1665"), so the breakdown
 *  rows visibly add up to the exact total. */
export function formatUsd(value: string): string {
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return `$${value}`;
  return `$${n.toFixed(4).replace(/(\.\d{2}\d*?)0+$/, "$1")}`;
}

/** The USD rows behind the payer's total: the order itself, our service fee on
 *  top, and the chosen network's fee. The last two of these depend on the
 *  selected network, so they're null until one is picked. */
export interface UsdBreakdown {
  amountUsd: string;
  serviceFeeUsd: string;
  networkFeeUsd: string | null;
  totalUsd: string | null;
}

/**
 * Assemble the USD fee breakdown for an order, given the currently selected
 * network (undefined while none is picked). Reads from the order's pricing
 * matrix — the same source the charged `total` comes from — so the breakdown
 * always explains exactly the figure the payer is asked to send.
 */
export function getUsdBreakdown(
  order: OrderData,
  networkId: string | undefined,
): UsdBreakdown | null {
  const pricing = order.pricing;
  if (!pricing?.length) return null;

  // The service fee is a property of the order (a percent of the amount, with
  // a cap), so it's identical on every pricing row — read it off the first.
  const serviceFeeUsd = pricing[0].tokens[0]?.serviceFeeUsd;
  if (serviceFeeUsd === undefined) return null;

  const entry = networkId
    ? pricing.find((p) => p.network === networkId)
    : undefined;

  return {
    amountUsd: order.amount,
    serviceFeeUsd,
    networkFeeUsd: entry?.networkFeeUsd ?? null,
    // totalUsd (= amount + service fee + network fee) is the same for every
    // token on a network, so any row of the chosen network works.
    totalUsd: entry?.tokens[0]?.totalUsd ?? null,
  };
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
