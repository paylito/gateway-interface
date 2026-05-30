import OrderForm from "../contents/OrderForm";

const Footer = () => {
  return (
    <div className="xl:flex hidden justify-center items-center fixed bottom-[34px] left-1/2 -translate-x-1/2 gap-1">
      <img src="/public/assets/shield.svg" className="w-5 h-5" />
      Secured by
      <div className="flex items-center justify-center">
        <img
          src="/public/assets/payli_medium.svg"
          className="w-[18.5px] h-[22px]"
        />
        <img
          src="/public/assets/payli_logotype.svg"
          className="w-[60px] h-[22px]"
        />
      </div>
    </div>
  );
};

const Order = () => {
  return (
    <div className="max-w-[1440px]">
      <div className="flex flex-col">
        <OrderForm />

        <Footer />
      </div>
    </div>
  );
};

export default Order;
