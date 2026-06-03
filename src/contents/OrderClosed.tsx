import type { ReactNode } from "react";
import { classifyStatus } from "../lib/order";

// Shared full-page card, matching the NotFound look.
function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-[520px] flex flex-col items-center text-center">
        <div className="flex items-center mb-10">
          <img src="/assets/payli_medium.svg" />
          <img src="/assets/payli_logotype.svg" className="ml-[14px]" />
        </div>

        <div
          className="w-full bg-white rounded-[24px] px-6 sm:px-12 py-12 sm:py-14 border-2 border-transparent"
          style={{
            background:
              "linear-gradient(#fff, #fff) padding-box, linear-gradient(to right, #E9E9FE, white) border-box",
            boxShadow: "0 20px 60px rgba(100, 73, 255, 0.08)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Shown when someone opens an order that is no longer pending. Deliberately
 * minimal: it reveals only the outcome, never the order's payment details.
 */
export const OrderClosed = ({ status }: { status: string }) => {
  const isDone = classifyStatus(status) === "success";

  return (
    <Shell>
      <img
        src={isDone ? "/assets/success.svg" : "/assets/failed.svg"}
        className="w-20 h-20 mx-auto"
      />

      <p className="text-2xl sm:text-3xl font-bold mt-6">
        {isDone ? "Payment completed" : `Order ${titleCase(status)}`}
      </p>

      <p className="text-[#636363] text-base sm:text-lg mt-3 max-w-[380px] mx-auto">
        {isDone
          ? "This payment has already been completed — there's nothing left to do here."
          : "This payment link is no longer active, so the order details aren't available anymore."}
      </p>
    </Shell>
  );
};

/** Shown on network / server errors, with a retry. */
export const OrderError = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <Shell>
      <p className="text-2xl sm:text-3xl font-bold">Something went wrong</p>

      <p className="text-[#636363] text-base sm:text-lg mt-3 max-w-[380px] mx-auto">
        We couldn't load this order. Please check your connection and try again.
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="inline-block mt-8 bg-[#6449FF] hover:bg-[#5238e6] transition-colors text-white font-bold rounded-xl px-7 py-3 cursor-pointer"
      >
        Try again
      </button>
    </Shell>
  );
};
