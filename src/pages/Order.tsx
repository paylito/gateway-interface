import { useParams } from "react-router-dom";
import Footer from "../components/Footer";
import OrderForm from "../contents/OrderForm";
import OrderLoading from "../contents/OrderLoading";
import { OrderClosed, OrderError } from "../contents/OrderClosed";
import NotFound from "./NotFound";
import { useOrder } from "../hooks/useOrder";

const Order = () => {
  const { id } = useParams<{ id: string }>();
  const { phase, order, closedStatus, remainingMs, reload } = useOrder(id);

  if (phase === "loading") return <OrderLoading />;
  if (phase === "notfound") return <NotFound />;
  if (phase === "error") return <OrderError onRetry={reload} />;
  if (phase === "closed")
    return <OrderClosed status={closedStatus ?? "closed"} />;

  if (!order) return <OrderLoading />;

  return (
    <div className="w-full max-w-[1440px] lg:mx-[10%]">
      <div className="flex flex-col">
        <OrderForm order={order} phase={phase} remainingMs={remainingMs} />

        <Footer />
      </div>
    </div>
  );
};

export default Order;
