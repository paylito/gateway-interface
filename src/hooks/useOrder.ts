import { useCallback, useEffect, useState } from "react";
import {
  classifyStatus,
  orderEndpoint,
  parseClosedStatus,
  type OrderApiResponse,
  type OrderData,
  type OrderPhase,
} from "../lib/order";

const POLL_INTERVAL_MS = 3000;

interface OrderState {
  phase: OrderPhase;
  order: OrderData | null;
  closedStatus: string | null;
  /** Time left until expiry, in ms (only meaningful while pending). */
  remainingMs: number | null;
  /**
   * The local countdown has elapsed but the backend hasn't resolved the order
   * yet — a deposit may still be confirming/settling. While true the UI shows a
   * "verifying" hold instead of declaring the payment expired.
   */
  awaitingConfirmation: boolean;
  reload: () => void;
}

/**
 * Loads an order by id and drives the whole order lifecycle:
 *
 *  - 404                         -> "notfound"
 *  - non-pending on first load   -> "closed" (a late/other visitor; details hidden)
 *  - pending                     -> "pending", then we poll + run the countdown:
 *      * backend status paid     -> "success"   (the payer paid)
 *      * backend status expired  -> "failed"    (the payer didn't pay in time)
 *      * countdown hits zero     -> stays pending with `awaitingConfirmation`,
 *                                   a "verifying" hold; the backend — not the
 *                                   local clock — then resolves it either way.
 */
export function useOrder(id: string | undefined): OrderState {
  const [phase, setPhase] = useState<OrderPhase>(() =>
    id ? "loading" : "notfound",
  );
  const [order, setOrder] = useState<OrderData | null>(null);
  const [closedStatus, setClosedStatus] = useState<string | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setPhase("loading");
    setReloadKey((k) => k + 1);
  }, []);

  // Initial load.
  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    (async () => {
      setAwaitingConfirmation(false); // fresh load / reload starts a clean lifecycle
      try {
        const res = await fetch(orderEndpoint(id), { signal: controller.signal });

        if (res.status === 404) {
          setPhase("notfound");
          return;
        }
        if (!res.ok) {
          setPhase("error");
          return;
        }

        const body: OrderApiResponse = await res.json();

        if (!body.success) {
          setPhase("error");
          return;
        }

        if (typeof body.data === "string") {
          // Opened after the order already resolved -> show the closed box only,
          // so people who didn't make the payment never see the order details.
          setClosedStatus(parseClosedStatus(body.data));
          setPhase("closed");
          return;
        }

        if (body.data) {
          setOrder(body.data);
          setPhase("pending");
        } else {
          setPhase("error");
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") setPhase("error");
      }
    })();

    return () => controller.abort();
  }, [id, reloadKey]);

  // Countdown, only while pending. This is DISPLAY ONLY: an elapsed timer does
  // NOT mean the payment failed — the deposit may still be confirming/settling
  // on-chain. We flip into a "verifying" hold and let the backend status (via
  // the poll below) be the single source of truth for success vs expiry. The
  // client clock never resolves the order, so a payment made near the deadline
  // is no longer shown as expired after it actually settles.
  useEffect(() => {
    if (phase !== "pending" || !order) return;

    const end = new Date(order.expiresAt).getTime();

    const tick = () => {
      const remaining = end - Date.now();
      setRemainingMs(Math.max(0, remaining));
      if (remaining <= 0) setAwaitingConfirmation(true);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [phase, order]);

  // Poll for the payer's outcome, only while pending.
  useEffect(() => {
    if (phase !== "pending" || !id) return;

    const controller = new AbortController();

    const poll = async () => {
      try {
        const res = await fetch(orderEndpoint(id), { signal: controller.signal });
        if (!res.ok) return;

        const body: OrderApiResponse = await res.json();
        if (!body.success) return;

        // A resolved order comes back as a string ("Order is <status>"); a still
        // -live one comes back as the order object. Read the status from whichever
        // we get and only resolve on an explicit success/failure — every pending,
        // in-progress, or unknown state means "keep waiting", so a confirming
        // deposit is never shown as expired.
        const statusWord =
          typeof body.data === "string"
            ? parseClosedStatus(body.data)
            : body.data?.status ?? "";

        const resolved = classifyStatus(statusWord);
        if (resolved === "success") setPhase("success");
        else if (resolved === "failed") setPhase("failed");
      } catch {
        // Ignore transient poll failures; we keep polling until the backend
        // gives a terminal status (it always resolves the order shortly after
        // expiry), so a blip can't strand the payer on a wrong screen.
      }
    };

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [phase, id]);

  return { phase, order, closedStatus, remainingMs, awaitingConfirmation, reload };
}
