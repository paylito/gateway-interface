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
  reload: () => void;
}

/**
 * Loads an order by id and drives the whole order lifecycle:
 *
 *  - 404                         -> "notfound"
 *  - non-pending on first load   -> "closed" (a late/other visitor; details hidden)
 *  - pending                     -> "pending", then we poll + run the countdown:
 *      * status becomes paid     -> "success"   (the payer paid)
 *      * status becomes expired,
 *        or the countdown ends   -> "failed"    (the payer didn't pay in time)
 */
export function useOrder(id: string | undefined): OrderState {
  const [phase, setPhase] = useState<OrderPhase>(() =>
    id ? "loading" : "notfound",
  );
  const [order, setOrder] = useState<OrderData | null>(null);
  const [closedStatus, setClosedStatus] = useState<string | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
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

  // Countdown + local expiry, only while pending.
  useEffect(() => {
    if (phase !== "pending" || !order) return;

    const end = new Date(order.expiresAt).getTime();

    const tick = () => {
      const remaining = end - Date.now();
      setRemainingMs(Math.max(0, remaining));
      if (remaining <= 0) setPhase("failed");
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
        if (!body.success || typeof body.data !== "string") return;

        const resolved = classifyStatus(parseClosedStatus(body.data));
        if (resolved === "success") setPhase("success");
        else if (resolved === "failed") setPhase("failed");
      } catch {
        // Ignore transient poll failures; the countdown still protects the payer.
      }
    };

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [phase, id]);

  return { phase, order, closedStatus, remainingMs, reload };
}
