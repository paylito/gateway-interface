import { useParams } from "react-router-dom";
import Footer from "../components/Footer";
import OrderForm from "../contents/OrderForm";
import OrderLoading from "../contents/OrderLoading";
import { OrderClosed, OrderError } from "../contents/OrderClosed";
import NotFound from "./NotFound";
import { useOrder } from "../hooks/useOrder";
import { usePageMeta } from "../hooks/usePageMeta";
import { orderMeta } from "../lib/order";

const Order = () => {
  const { id } = useParams<{ id: string }>();
  const { phase, order, closedStatus, remainingMs, awaitingConfirmation, reload } =
    useOrder(id);

  // Keep the tab title + description in sync with the order's current page.
  const { title, description } = orderMeta(phase, id);
  usePageMeta(title, description);

  if (phase === "loading") return <OrderLoading />;
  if (phase === "notfound") return <NotFound />;
  if (phase === "error") return <OrderError onRetry={reload} />;
  if (phase === "closed")
    return <OrderClosed status={closedStatus ?? "closed"} />;

  if (!order) return <OrderLoading />;

  return (
    <div className="w-full max-w-[1440px] lg:mx-[10%]">
      <div className="flex flex-col">
        <OrderForm
          order={order}
          phase={phase}
          remainingMs={remainingMs}
          awaitingConfirmation={awaitingConfirmation}
        />

        <Footer />
      </div>
    </div>
  );
};

export default Order;
