import Footer from "../components/Footer";
import OrderForm from "../contents/OrderForm";
import { MOCK_ORDER, type OrderPhase } from "../lib/order";

// Static design preview for the success / failed screens (no backend needed).
const OrderPreview = ({ phase }: { phase: OrderPhase }) => {
  return (
    <div className="w-full max-w-[1440px] lg:mx-[10%]">
      <div className="flex flex-col">
        <OrderForm order={MOCK_ORDER} phase={phase} remainingMs={14 * 60 * 1000 + 30 * 1000} />

        <Footer />
      </div>
    </div>
  );
};

export default OrderPreview;
