import Footer from "../components/Footer";
import OrderForm, { type IOrderStatus } from "../contents/OrderForm";

type OrderProps = {
  status?: IOrderStatus;
};

const Order = ({ status = "pending" }: OrderProps) => {
  return (
    <div className="w-full max-w-[1440px] lg:mx-[10%]">
      <div className="flex flex-col">
        <OrderForm status={status} />

        <Footer />
      </div>
    </div>
  );
};

export default Order;
