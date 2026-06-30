import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";

interface Rates {
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

interface OrderData {
  _id: string;
  amount: string;
  status: string;
  createdAt: string;
  smartAccount: string;
  id: string;
  evmAddress: string;
  tronAddress: string;
  solanaAddress: string;
  stellarAddress: string;
  bitcoinLegacyAddress: string;
  bitcoinSegwitAddress: string;
  user: string;
  rates: Rates;
  expiresAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  success: boolean;
  data: OrderData;
}

type NetworkType = (typeof NETWORKS)[number];
type TokenType = (typeof TOKENS)[number];

const NETWORKS = [
  {
    value: "ethereum",
    label: "Ethereum",
    addressKey: "evmAddress",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
    networkFee: 2.3,
  },
  {
    value: "arbitrum",
    label: "Arbitrum",
    addressKey: "evmAddress",
    logo: "https://cryptologos.cc/logos/arbitrum-arb-logo.svg",
    networkFee: 0.1,
  },
  {
    value: "tron",
    label: "Tron",
    addressKey: "tronAddress",
    logo: "https://cryptologos.cc/logos/tron-trx-logo.svg",
    networkFee: 0.5,
  },
  {
    value: "solana",
    label: "Solana",
    addressKey: "solanaAddress",
    logo: "https://cryptologos.cc/logos/solana-sol-logo.svg",
    networkFee: 0.02,
  },
  {
    value: "stellar",
    label: "Stellar",
    addressKey: "stellarAddress",
    logo: "https://cryptologos.cc/logos/stellar-xlm-logo.svg",
    networkFee: 0.01,
  },
  {
    value: "bitcoin-legacy",
    label: "Bitcoin (Legacy)",
    addressKey: "bitcoinLegacyAddress",
    logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg",
    networkFee: 3.5,
  },
  {
    value: "bitcoin-segwit",
    label: "Bitcoin (SegWit)",
    addressKey: "bitcoinSegwitAddress",
    logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg",
    networkFee: 1.8,
  },
] as const;

const TOKENS = [
  {
    value: "USDC",
    label: "USDC",
    logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.svg",
  },
  {
    value: "USDT",
    label: "USDT",
    logo: "https://cryptologos.cc/logos/tether-usdt-logo.svg",
  },
  {
    value: "ETH",
    label: "ETH",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
  },
] as const;

const SERVICE_FEE_PERCENT = 0.02;
const ORDER_EXPIRY_MINUTES = 20;

function SelectDropdown<
  T extends { value: string; label: string; logo: string },
>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: string;
  onChange: (value: T["value"]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white flex items-center justify-between gap-2 hover:border-purple-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <div className="flex items-center gap-2">
          <img src={selected?.logo} alt={selected?.label} className="w-5 h-5" />
          <span>{selected?.label}</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        className={`absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden transition-all duration-200 origin-top ${isOpen
            ? "opacity-100 scale-y-100"
            : "opacity-0 scale-y-0 pointer-events-none"
          }`}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-purple-50 transition-colors ${value === option.value
                ? "bg-purple-50 text-purple-700"
                : "text-gray-900"
              }`}
          >
            <img src={option.logo} alt={option.label} className="w-5 h-5" />
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CountdownTimer({ createdAt }: { createdAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const created = new Date(createdAt).getTime();
    const expiresAt = created + ORDER_EXPIRY_MINUTES * 60 * 1000;

    const update = () => {
      const now = Date.now();
      const diff = expiresAt - now;
      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft("00:00");
        return;
      }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const progress = (() => {
    const created = new Date(createdAt).getTime();
    const expiresAt = created + ORDER_EXPIRY_MINUTES * 60 * 1000;
    const elapsed = Date.now() - created;
    const total = expiresAt - created;
    return Math.max(0, Math.min(100, 100 - (elapsed / total) * 100));
  })();

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Time remaining
        </span>
        <span
          className={`text-lg font-mono font-semibold ${isExpired ? "text-red-500" : progress < 25 ? "text-orange-500" : "text-gray-900"}`}
        >
          {timeLeft}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${isExpired
              ? "bg-red-500"
              : progress < 25
                ? "bg-orange-500"
                : "bg-purple-500"
            }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType["value"]>(
    NETWORKS[0].value,
  );
  const [selectedToken, setSelectedToken] = useState<TokenType["value"]>(
    TOKENS[0].value,
  );
  const [paymentState, setPaymentState] = useState<
    "idle" | "detected" | "confirming" | "success"
  >("idle");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`http://localhost:3030/orders/${id}`);
        if (response.status === 404) {
          setError("Order not found");
          return;
        }
        if (!response.ok) {
          setError("Failed to fetch order");
          return;
        }
        const result: ApiResponse = await response.json();
        setOrderData(result.data);
      } catch {
        setError("Failed to fetch order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return null;
  }

  if (orderData.status === "completed") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-green-500 text-xl font-semibold">
            Payment is finished
          </p>
        </div>
      </div>
    );
  }

  if (orderData.status === "expired") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-yellow-500 text-xl font-semibold">
            Payment is expired
          </p>
        </div>
      </div>
    );
  }

  const simulatePayment = () => {
    setPaymentState("detected");
    setTimeout(() => setPaymentState("confirming"), 1500);
    setTimeout(() => setPaymentState("success"), 4000);
  };

  const selectedNetworkData = NETWORKS.find((n) => n.value === selectedNetwork);
  const selectedTokenData = TOKENS.find((t) => t.value === selectedToken);
  const address = selectedNetworkData
    ? (orderData[selectedNetworkData.addressKey as keyof OrderData] as string)
    : "";
  const rate = orderData.rates[selectedToken as keyof Rates];
  const tokenAmount = rate
    ? (parseFloat(orderData.amount) / rate).toFixed(6)
    : "0";
  const amountUsd = parseFloat(orderData.amount);
  const networkFee = selectedNetworkData?.networkFee ?? 0;
  const serviceFee = amountUsd * SERVICE_FEE_PERCENT;
  const total = amountUsd + networkFee + serviceFee;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Complete Your Payment
        </h1>

        <CountdownTimer createdAt={orderData.createdAt} />

        <div className="mb-4">
          <SelectDropdown
            label="Select Network"
            options={NETWORKS}
            value={selectedNetwork}
            onChange={setSelectedNetwork}
          />
        </div>

        <div className="mb-6">
          <SelectDropdown
            label="Select Token"
            options={TOKENS}
            value={selectedToken}
            onChange={setSelectedToken}
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">Amount to pay</p>
            <div className="flex items-center gap-2">
              {selectedTokenData && (
                <img
                  src={selectedTokenData.logo}
                  alt={selectedTokenData.label}
                  className="w-5 h-5"
                />
              )}
              <p className="text-2xl font-bold text-gray-900">
                {tokenAmount} {selectedToken}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Send to this address</p>
            <div className="bg-gray-100 rounded-md p-3 break-all text-sm font-mono text-gray-800">
              {address}
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Breakdown
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {selectedNetworkData && (
                  <img
                    src={selectedNetworkData.logo}
                    alt={selectedNetworkData.label}
                    className="w-4 h-4"
                  />
                )}
                <span className="text-sm text-gray-600">Payment amount</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                ${amountUsd.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {selectedNetworkData && (
                  <img
                    src={selectedNetworkData.logo}
                    alt={selectedNetworkData.label}
                    className="w-4 h-4"
                  />
                )}
                <span className="text-sm text-gray-600">
                  Network fee ({selectedNetworkData?.label})
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                ${networkFee.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Service fee (2%)</span>
              <span className="text-sm font-medium text-gray-900">
                ${serviceFee.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
              <span className="text-base font-semibold text-gray-900">
                Total
              </span>
              <span className="text-lg font-bold text-gray-900">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={simulatePayment}
            disabled={paymentState !== "idle"}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-300 ${paymentState === "idle"
                ? "bg-purple-600 hover:bg-purple-700 active:scale-[0.98]"
                : "bg-purple-400 cursor-not-allowed"
              }`}
          >
            {paymentState === "idle" && "Simulate Payment"}
            {paymentState === "detected" && "Payment detected..."}
            {paymentState === "confirming" && "Confirming transaction..."}
          </button>
        </div>
      </div>

      {paymentState === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center animate-scaleIn">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-500">
              Your payment has been confirmed and processed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderPage;
