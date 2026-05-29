import OrderForm from "../contents/OrderForm";

const Footer = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "fixed",
        bottom: 34,
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      <img
        src="/public/assets/shield.svg"
        style={{
          width: 20,
          height: 20,
        }}
      />
      Secured by
      <img
        src="/public/assets/payli_medium.svg"
        style={{
          width: 18.5,
          height: 22,
        }}
      />
      <img
        src="/public/assets/payli_logotype.svg"
        style={{
          marginLeft: 2,
          width: 60,
          height: 22,
        }}
      />
    </div>
  );
};

const Order = () => {
  return (
    <div>
      <OrderForm />

      <Footer />
    </div>
  );
};

export default Order;
