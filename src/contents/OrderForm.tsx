import { useEffect, useMemo, useState } from "react";
import Box from "../components/Box";
import Qrcode from "../components/Qrcode";
import CSelect, { type IOption } from "../components/Select";
import Timer from "../components/Timer";
import {
  findPricing,
  formatCountdown,
  formatToken,
  formatUsd,
  getUsdBreakdown,
  receiptEndpoint,
  type OrderData,
  type OrderPhase,
} from "../lib/order";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const OrderFailed = ({ amount }: { amount: string }) => {
  return (
    <div className="lg:my-0 lg:mx-6 my-8 mx-6 lg:mb-0 mb-18">
      <div className="flex justify-center">
        <img src="/assets/failed.svg" />
      </div>

      <p className="text-2xl font-bold text-center pt-6">Payment Expired!</p>

      <p className="text-lg text-[#636363] text-center pt-4">
        Your payment of ${amount} has expired!
      </p>
    </div>
  );
};

/**
 * Shown while the payment window has elapsed but the backend hasn't resolved the
 * order yet. We deliberately do NOT say "expired" here — a deposit made near the
 * deadline can still be confirming/settling on-chain. The page keeps polling and
 * flips to success or expired only once the backend says so.
 */
const OrderVerifying = () => {
  return (
    <div className="bg-[#F7F7FF] rounded-xl lg:mt-8 m-4 mt-6 flex flex-col justify-center items-center min-h-[280px] px-6 py-10 text-center">
      <div className="w-12 h-12 rounded-full border-4 border-[#E5DFFF] border-t-[#6449FF] animate-spin" />

      <p className="lg:text-2xl text-[18px] pt-6 font-semibold">
        Checking for your payment…
      </p>

      <p className="text-[#636363] text-sm lg:text-base pt-3 max-w-[420px]">
        The payment window has ended. If you&apos;ve already sent the payment,
        hang tight — we&apos;re confirming it on-chain. This page updates
        automatically.
      </p>
    </div>
  );
};

const OrderSuccess = ({ id, amount }: { id: string; amount: string }) => {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isValid = EMAIL_REGEX.test(email.trim());
  const showError = touched && email.length > 0 && !isValid;
  const canSubmit = isValid && !submitting;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid) {
      setTouched(true);
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Ask the API to email the receipt for this finished order. The backend
      // replies 202 immediately and sends the mail out of band.
      const res = await fetch(receiptEndpoint(id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const body = (await res.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
      } | null;

      if (!res.ok || !body?.success) {
        // Keep the input so the payer can fix the address or retry; surface the
        // backend's reason (already requested, mailer unavailable, …) when given.
        setSubmitError(
          body?.message ?? "We couldn't send your receipt. Please try again.",
        );
        return;
      }

      // Accepted — the receipt is on its way. Hide the input now.
      setSubmitted(true);
    } catch {
      setSubmitError("We couldn't reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center flex-col lg:mt-0 mt-15 lg:mx-0 mx-6 lg:mb-0 mb-10">
      <div className="flex justify-center">
        <img src="/assets/success.svg" className="w-[143px] h-24" />
      </div>

      <p className="text-2xl font-bold text-center pt-6">Payment successful!</p>

      <p className="text-lg text-[#636363] text-center pt-4">
        Your payment of ${amount} has been sent successfully.
      </p>

      <div className="bg-[#F7F7FF] rounded-[24px] px-6 sm:px-8 py-6 lg:mx-[63px] mt-6">
        {submitted ? (
          <div className="flex items-center gap-3">
            <img src="/assets/done.svg" className="w-7 h-7 shrink-0" />

            <div>
              <p className="text-lg font-bold">Receipt on its way!</p>
              <p className="text-sm text-[#636363] break-all">
                We&apos;ve sent your payment receipt to{" "}
                <span className="font-semibold">{email.trim()}</span>.
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-lg font-bold">
              Want a receipt?{" "}
              <span className="text-xs text-[#636363]">(optional)</span>
            </p>

            <p className="text-sm text-[#636363]">
              enter your email to receive your payment receipt
            </p>

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <input
                  className={`bg-white rounded-xl border-2 text-base px-4 py-[10px] text-black placeholder:text-[#636363] w-full sm:flex-1 outline-none transition-colors disabled:opacity-60 ${showError
                      ? "border-[#FF4D4D] focus:border-[#FF4D4D]"
                      : "border-[#CBBEFF] focus:border-[#6449FF]"
                    }`}
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (submitError) setSubmitError(null);
                  }}
                  onBlur={() => setTouched(true)}
                  disabled={submitting}
                  aria-invalid={showError}
                  placeholder="you.awesome@gmail.com"
                />

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`rounded-xl text-base font-bold px-4 py-3 transition-colors ${canSubmit
                      ? "cursor-pointer bg-[#6449FF] hover:bg-[#5238e6] text-white"
                      : "cursor-not-allowed bg-[#CBBEFF] text-white"
                    }`}
                >
                  {submitting ? "Sending…" : "Get Receipt"}
                </button>
              </div>

              {showError ? (
                <p className="text-[#FF4D4D] text-sm mt-2">
                  Please enter a valid email address.
                </p>
              ) : submitError ? (
                <p className="text-[#FF4D4D] text-sm mt-2">{submitError}</p>
              ) : null}
            </form>
          </>
        )}
      </div>
    </div>
  );
};

// EVM-only: every network below collects to the order's `smartAccount`.
const TOKEN_OPTIONS: IOption[] = [
  {
    value: "usdt",
    name: "Tether",
    symbol: "USDT",
    label: "Tether (USDT)",
    logo: "/assets/usdt.svg",
  },
  {
    value: "usdc",
    name: "USD Coin",
    symbol: "USDC",
    label: "USD Coin (USDC)",
    logo: "/assets/usdc.svg",
  },
  {
    value: "eth",
    name: "Ethereum",
    symbol: "ETH",
    label: "Ethereum (ETH)",
    logo: "/assets/eth.svg",
  },
];

const NETWORK_OPTIONS: IOption[] = [
  {
    value: "ethereum",
    name: "Ethereum",
    symbol: "ERC20",
    label: "Ethereum (ERC20)",
    logo: "/assets/eth.svg",
    tokens: ["usdt", "usdc", "eth"],
  },
  {
    value: "bsc",
    name: "Binance",
    symbol: "BEP20",
    label: "Binance (BEP20)",
    logo: "/assets/bsc.svg",
    tokens: ["usdt", "usdc"],
  },
  {
    value: "polygon",
    name: "Polygon",
    label: "Polygon",
    logo: "/assets/polygon.svg",
    tokens: ["usdt", "usdc"],
  },
  {
    value: "arbitrum",
    name: "Arbitrum",
    label: "Arbitrum",
    logo: "/assets/arbitrum.svg",
    tokens: ["usdt", "usdc", "eth"],
  },
  {
    value: "base",
    name: "Base",
    label: "Base",
    logo: "/assets/base.svg",
    tokens: ["usdc", "eth"],
  },
  {
    value: "optimism",
    name: "Optimism",
    label: "Optimism",
    logo: "/assets/optimism.svg",
    tokens: ["usdt", "usdc", "eth"],
  },
];

// The network selection is owned by OrderForm rather than here: the summary
// box's fee breakdown re-prices on every network change, so the choice has to
// live above both columns.
const OrderPending = ({
  order,
  network,
  onNetworkChange,
}: {
  order: OrderData;
  network: IOption | null;
  onNetworkChange: (network: IOption | null) => void;
}) => {
  const [token, setToken] = useState<IOption | null>(null);
  const [copied, setCopied] = useState(false);

  const address = order.smartAccount;

  // Networks limited to those supporting the chosen token (and vice versa).
  const availableNetworks = useMemo(
    () =>
      token
        ? NETWORK_OPTIONS.filter((n) => n.tokens?.includes(token.value))
        : NETWORK_OPTIONS,
    [token],
  );

  const availableTokens = useMemo(
    () =>
      network
        ? TOKEN_OPTIONS.filter((t) => network.tokens?.includes(t.value))
        : TOKEN_OPTIONS,
    [network],
  );

  const handleTokenChange = (next: IOption | null) => {
    setToken(next);
    // Drop an incompatible network so the user must reselect a supported one.
    if (next && network && !network.tokens?.includes(next.value)) {
      onNetworkChange(null);
    }
  };

  const handleNetworkChange = (next: IOption | null) => {
    onNetworkChange(next);
    // Drop an incompatible token so the user must reselect a supported one.
    if (next && token && !next.tokens?.includes(token.value)) {
      setToken(null);
    }
  };

  const isComplete =
    !!token && !!network && !!network.tokens?.includes(token.value);

  // Crypto amount to send = the chosen network/token's `total` from the order's
  // pricing matrix (the authoritative, fee-inclusive figure the backend settles
  // against). NEVER recompute it from the USD amount: that omits the service +
  // network fee the payer must cover, so the order would be underpaid and stick.
  const pricingEntry = useMemo(
    () =>
      isComplete
        ? findPricing(order.pricing, network?.value, token?.symbol)
        : undefined,
    [isComplete, order.pricing, network, token],
  );

  const cryptoAmount = useMemo(() => {
    if (!pricingEntry) return null;
    const total = Number(pricingEntry.total);
    return Number.isFinite(total) ? total : null;
  }, [pricingEntry]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      // Clipboard may be unavailable (e.g. insecure context); ignore silently.
    }
    setCopied(true);
  };

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <>
      <p className="lg:text-[24px] text-[18px] font-bold m-4 lg:m-0 mb-0 lg:text-left text-center">
        Select an asset and network you want to pay
      </p>

      <div className="flex lg:mt-3 m-4 flex-col xl:flex-row gap-4 xl:gap-6">
        <CSelect
          title="Asset Type"
          placeholder="Choose asset"
          options={availableTokens}
          value={token}
          onChange={handleTokenChange}
          compactValue
        />

        <CSelect
          title="Network"
          placeholder="Choose network"
          options={availableNetworks}
          value={network}
          onChange={handleNetworkChange}
        />
      </div>

      <div className="bg-[#F7F7FF] rounded-xl lg:mt-8 m-4 mt-6 flex flex-col justify-center items-center min-h-[280px]">
        {isComplete ? (
          <>
            <p className="lg:text-2xl text-[18px] lg:pt-6 pt-4 font-medium text-center px-4">
              Please send{" "}
              <span className="text-[#4D35DB] font-semibold">
                {cryptoAmount != null
                  ? `${formatToken(cryptoAmount)} ${token.symbol}`
                  : `$${order.amount}`}
              </span>{" "}
              to the address below
            </p>

            <div className="flex lg:justify-between justify-center items-center lg:p-6 p-4 xl:flex-row flex-col w-full gap-5">
              <div className="min-w-[210px] h-[210px] border-2 border-[#E5DFFF] bg-white flex justify-center items-center rounded-xl">
                <Qrcode
                  content={address}
                  logo={token.logo}
                  width={180}
                  height={180}
                />
              </div>

              <div className="flex flex-col items-center justify-center lg:mx-0 w-[90%]">
                <div className="relative bg-white lg:rounded-[12px] rounded-[8px] font-medium text-[14px] border-2 border-[#E5DFFF] lg:px-3 lg:py-[10px] lg:pl-4 p-3 flex justify-between items-center break-all leading-[22px] gap-[10px] w-full">
                  <p>{address}</p>

                  <button
                    type="button"
                    onClick={handleCopy}
                    aria-label="Copy address"
                    className="relative cursor-pointer shrink-0 flex items-center justify-center"
                  >
                    <img src="/assets/copy.svg" className="w-6 h-6" />

                    <span
                      className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#6449FF] px-2 py-1 text-xs font-semibold text-white transition-all duration-200 ${copied
                          ? "opacity-100 -translate-y-0"
                          : "opacity-0 translate-y-1 pointer-events-none"
                        }`}
                    >
                      Copied!
                    </span>
                  </button>
                </div>

                <div className="w-full lg:mt-6 mt-2 bg-[#FFF4EA] border-2 border-[#ECDAC9] lg:rounded-[12px] rounded-[8px] lg:px-4 px-3 lg:py-2 py-2 text-[12px] lg:text-[14px] lg:text-left text-center">
                  Send only{" "}
                  <img
                    src={token.logo}
                    className="inline w-4 h-4 align-text-bottom"
                  />{" "}
                  <span className="font-semibold">{token.symbol}</span> on{" "}
                  <span className="font-semibold">{network.name}</span> network
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-[#9CA3AF] text-center px-6 text-sm lg:text-base">
            Select an asset and a network to see the payment address.
          </p>
        )}
      </div>
    </>
  );
};

type OrderFormProps = {
  order: OrderData;
  phase: OrderPhase;
  /** Time left until expiry, in ms (null outside the pending phase). */
  remainingMs: number | null;
  /** Timer elapsed but the backend hasn't resolved yet — show the verifying hold. */
  awaitingConfirmation?: boolean;
};

const OrderForm = ({
  order,
  phase,
  remainingMs,
  awaitingConfirmation = false,
}: OrderFormProps) => {
  // The chosen network lives up here so both columns see it: OrderPending
  // renders the pickers, while the summary box's fee breakdown below tracks
  // the network's fee live.
  const [network, setNetwork] = useState<IOption | null>(null);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const userName = order.user?.username || order.user?.name || "USER";

  // USD fee breakdown; only offered while the order is still payable.
  const breakdown =
    phase === "pending" ? getUsdBreakdown(order, network?.value) : null;

  return (
    <div className="flex flex-col min-h-screen">
      <div>
        <div className="lg:mt-[60px] lg:mb-[35px] hidden lg:flex">
          <img src="/assets/payli_medium.svg" />
          <img src="/assets/payli_logotype.svg" className="ml-[14px]" />
        </div>

        <div className="flex lg:flex-row flex-col-reverse w-full">
          <Box
            style={{
              background:
                "linear-gradient(#fff, #fff) padding-box, linear-gradient(to right, #E9E9FE, white) border-box",
            }}
            className="lg:w-2/3 min-w-0 lg:p-10 border-2 border-transparent mt-[12px] lg:mt-[0px] lg:ml-[0] ml-[18px] lg:mr-[0px] mr-[18px]"
          >
            {phase === "pending" &&
              (awaitingConfirmation ? (
                <OrderVerifying />
              ) : (
                <OrderPending
                  order={order}
                  network={network}
                  onNetworkChange={setNetwork}
                />
              ))}

            {phase === "success" && (
              <OrderSuccess id={order.id} amount={order.amount} />
            )}

            {phase === "failed" && <OrderFailed amount={order.amount} />}
          </Box>

          <Box
            className="lg:w-1/3 min-w-0 lg:ml-[32px] ml-[18px] lg:mr-[0px] mr-[18px] lg:px-8 px-4 lg:py-10 py-[16px] h-fit lg:mt-[0px] mt-[56px]"
            style={{
              borderTop: "5px solid #6449FF",
            }}
          >
            <div className="flex gap-[10px] items-center lg:justify-start justify-center">
              <Timer startDate={order.createdAt} endDate={order.expiresAt} />

              <div>
                <p className="font-bold lg:text-lg text-[18px]">
                  {formatCountdown(remainingMs ?? 0)}
                </p>
                <p className="text-[#636363] text-sm hidden lg:block">
                  Expiration time
                </p>
              </div>
            </div>

            <div className="flex justify-between lg:mt-8 mt-4">
              <p className="text-[#636363] lg:text-base text-[14px]">ID</p>
              <p className="font-bold lg:text-base text-[16px]">{order.id}</p>
            </div>

            <div className="flex justify-between lg:mt-[23px] mt-3">
              <p className="text-[#636363]  lg:text-base text-[14px]">To</p>
              <p className="font-bold gap-2 flex items-center lg:text-base text-[16px]">
                {/* Donation orders show the donation page's handle, which isn't
                    a telegram account — so no telegram icon for them. */}
                {!order.isDonation && (
                  <img
                    src="/assets/telegram.svg"
                    className="inline w-[22px] h-[22px]"
                  />
                )}
                {userName}
              </p>
            </div>

            <div
              className="w-full h-[1px] lg:mt-[23px] mt-3"
              style={{
                background:
                  "repeating-linear-gradient(to right, #C7C7C7 0 6px, transparent 6px 12px)",
              }}
            />

            <div className="lg:mt-[23px] mt-3 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-[6px]">
                  <p className="text-[#636363] lg:text-base text-[14px]">
                    Order amount
                  </p>

                  {breakdown && (
                    <button
                      type="button"
                      onClick={() => setBreakdownOpen((open) => !open)}
                      title="See how your total is calculated"
                      aria-label="See how your total is calculated"
                      aria-expanded={breakdownOpen}
                      className="cursor-pointer flex items-center justify-center"
                    >
                      <img
                        src="/assets/arrow_down.svg"
                        className={`w-5 h-5 transition-transform duration-200 ${breakdownOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                  )}
                </div>

                <p className="text-[40px] font-bold lg:block hidden">
                  ${order.amount}
                </p>
              </div>

              <div className="flex gap-2 items-center">
                <img
                  src="/assets/receipt.svg"
                  className="lg:w-10 w-6 lg:h-10 h-6"
                />

                <p className="lg:hidden block font-bold text-[22px]">
                  ${order.amount}
                </p>
              </div>
            </div>

            {/* What the payer is actually charged: the order itself, our
                service fee, and the chosen network's fee. The network fee (and
                with it the total) re-prices whenever the network changes. */}
            {breakdown && breakdownOpen && (
              <div className="bg-[#F7F7FF] rounded-[12px] lg:mt-4 mt-3 px-4 py-3 text-[14px]">
                <div className="flex justify-between items-center">
                  <p className="text-[#636363]">Order amount</p>
                  <p className="font-semibold">
                    {formatUsd(breakdown.amountUsd)}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <p className="text-[#636363]">Service fee</p>
                  <p className="font-semibold">
                    {formatUsd(breakdown.serviceFeeUsd)}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <p className="text-[#636363]">
                    Network fee{network ? ` · ${network.name}` : ""}
                  </p>
                  <p className="font-semibold">
                    {breakdown.networkFeeUsd !== null
                      ? formatUsd(breakdown.networkFeeUsd)
                      : "—"}
                  </p>
                </div>

                <div
                  className="w-full h-[1px] my-3"
                  style={{
                    background:
                      "repeating-linear-gradient(to right, #C7C7C7 0 6px, transparent 6px 12px)",
                  }}
                />

                <div className="flex justify-between items-center">
                  <p className="font-semibold">Total</p>
                  <p className="font-bold">
                    {breakdown.totalUsd !== null
                      ? formatUsd(breakdown.totalUsd)
                      : "—"}
                  </p>
                </div>

                {!network && (
                  <p className="text-[#9CA3AF] text-[12px] mt-2">
                    Choose a network to see its fee and your final total.
                  </p>
                )}
              </div>
            )}
          </Box>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
