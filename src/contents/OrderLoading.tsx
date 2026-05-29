const OrderLoading = () => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src="/public/assets/loading.svg"
        className="spinner"
        style={{
          width: "64px",
          height: "64px",
        }}
      />
    </div>
  );
};

export default OrderLoading;
