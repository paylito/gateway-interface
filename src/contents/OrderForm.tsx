import { useState } from "react";
import Box from "../components/Box";
import Qrcode from "../components/Qrcode";
import CSelect from "../components/Select";
import Timer from "../components/Timer";

type IOrderStatus = "pending" | "success" | "failed";

const OrderFailed = () => {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img src="/public/assets/failed.svg" />
      </div>

      <p
        style={{
          fontSize: 24,
          fontWeight: "bold",
          textAlign: "center",
          paddingTop: 24,
        }}
      >
        Payment Expired!
      </p>

      <p
        style={{
          fontSize: 18,
          color: "#636363",
          textAlign: "center",
          paddingTop: 16,
        }}
      >
        Your payment of $320 has expired!
      </p>
    </div>
  );
};

const OrderSuccess = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img
          src="/public/assets/success.svg"
          style={{
            width: 143,
            height: 96,
          }}
        />
      </div>

      <p
        style={{
          fontSize: 24,
          fontWeight: "bold",
          textAlign: "center",
          paddingTop: 24,
        }}
      >
        Payment successful!
      </p>

      <p
        style={{
          fontSize: 18,
          color: "#636363",
          textAlign: "center",
          paddingTop: 16,
        }}
      >
        Your payment of $320 has been sent successfully.
      </p>

      <div
        style={{
          backgroundColor: "#F7F7FF",
          borderRadius: 24,
          padding: "24px 32px",
          margin: "24px 63px 0px 63px",
        }}
      >
        <p style={{ fontSize: 18, fontWeight: "bold" }}>
          Want a receipt?{" "}
          <span style={{ fontSize: 12, color: "#636363" }}>(optional)</span>
        </p>

        <p style={{ fontSize: 14, color: "#636363" }}>
          enter your email to receive your payment receipt
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", marginTop: 16 }}>
            <input
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                border: "2px solid #CBBEFF",
                fontSize: 16,
                padding: "10px 16px",
                color: "#636363",
                width: 340,
              }}
              type="email"
              name="email"
              placeholder="you.awesome@gmail.com"
            />

            <button
              type="submit"
              style={{
                cursor: "pointer",
                backgroundColor: "#6449FF",
                color: "white",
                borderRadius: "12px",
                fontSize: 16,
                fontWeight: "700",
                padding: "12px 16px",
              }}
            >
              Get Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrderPending = () => {
  return (
    <>
      <p style={{ fontWeight: "bold" }} className="lg:text-[24px] text-[18px]">
        Select an asset and network you want to pay
      </p>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <CSelect title="Asset Type" placeholder="Choose asset" />
        <CSelect title="Network" placeholder="Choose network" />
      </div>

      <div
        style={{
          background: "#F7F7FF",
          borderRadius: "12px",
          marginTop: 32,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p style={{ fontSize: 24, paddingTop: 24 }}>
          Please send{" "}
          <span style={{ color: "#4D35DB", fontWeight: 600 }}>$320</span> to the
          address below
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            padding: 24,
          }}
        >
          <div
            style={{
              width: 210,
              height: 210,
              border: "2px solid #E5DFFF",
              background: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 12,
            }}
          >
            <Qrcode
              content="https://example.com2917439826439436239"
              logo="/public/assets/usdt.svg"
              width={180}
              height={180}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: 12,
                fontWeight: "bold",
                fontSize: 18,
                border: "2px solid #E5DFFF",
                height: 68,
                padding: "10px 12px 10px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                width: 384,
                overflowWrap: "anywhere",
                lineHeight: "22px",
                gap: 10,
              }}
            >
              <p>0x1212121212121212121212121212121212121212</p>

              <img
                src="/public/assets/copy.svg"
                style={{
                  width: 24,
                  height: 24,
                }}
              />
            </div>

            <div
              style={{
                width: 384,
                marginTop: 24,
                background: "#FFF4EA",
                border: "2px solid #ECDAC9",
                borderRadius: "16px",
                padding: "12px 16px",
              }}
            >
              Send only{" "}
              <img
                src="/public/assets/usdc.svg"
                style={{ display: "inline" }}
              />{" "}
              on Binance network
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const OrderForm = () => {
  const [status, setStatus] = useState<IOrderStatus>("pending");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <div className="mx-[300px]">
        <div
          style={{
            display: "flex",
            margin: "60px 0 35px 0",
          }}
        >
          <img src="/public/assets/payli_medium.svg" />
          <img
            src="/public/assets/payli_logotype.svg"
            style={{ marginLeft: 14 }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Box
            style={{
              padding: "40px",
              minHeight: status === "failed" ? "295px" : "500px",
              border: "2px solid transparent",
              background:
                "linear-gradient(#fff, #fff) padding-box, linear-gradient(to right, #E9E9FE, white) border-box",
            }}
            className="w-2/3"
          >
            {status === "pending" ? <OrderPending /> : <p />}

            {status === "success" ? <OrderSuccess /> : <p />}

            {status === "failed" ? <OrderFailed /> : <p />}
          </Box>

          <Box
            className="w-1/3 lg:ml-[32px]"
            style={{
              padding: "40px 32px",
              maxHeight: "362px",
              borderTop: "5px solid #6449FF",
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Timer startDate={Date.now()} endDate={Date.now() + 40000} />

              <div>
                <p style={{ fontWeight: "bold", fontSize: 18 }}>14:30</p>
                <p style={{ color: "#636363", fontSize: 14 }}>
                  Expiration time
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 32,
                fontSize: 16,
              }}
            >
              <p style={{ color: "#636363" }}>ID</p>
              <p style={{ fontWeight: "bold" }}>299190</p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 23,
              }}
            >
              <p style={{ color: "#636363" }}>To</p>
              <p
                style={{
                  fontWeight: "bold",
                  gap: 8,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <img
                  src="/public/assets/telegram.svg"
                  style={{
                    display: "inline",
                    width: 22,
                    height: 22,
                  }}
                />
                @heyamir
              </p>
            </div>

            <div
              style={{
                width: "100%",
                height: 1,
                marginTop: 23,
                background:
                  "repeating-linear-gradient(to right, #C7C7C7 0 6px, transparent 6px 12px)",
              }}
            />

            <div
              style={{
                marginTop: 23,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    color: "#636363",
                    fontSize: 16,
                  }}
                >
                  You have to pay
                </p>

                <p
                  style={{
                    fontSize: 40,
                    fontWeight: "bold",
                  }}
                >
                  $320
                </p>
              </div>

              <img
                src="/public/assets/receipt.svg"
                style={{
                  width: 40,
                  height: 40,
                }}
              />
            </div>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
