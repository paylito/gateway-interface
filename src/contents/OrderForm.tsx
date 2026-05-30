import { useState } from "react";
import Box from "../components/Box";
import Qrcode from "../components/Qrcode";
import CSelect from "../components/Select";
import Timer from "../components/Timer";

type IOrderStatus = "pending" | "success" | "failed";

const OrderFailed = () => {
  return (
    <div className="lg:my-0 lg:mx-6 my-8 mx-6 lg:mb-0 mb-18">
      <div className="flex justify-center">
        <img src="/public/assets/failed.svg" />
      </div>

      <p className="text-2xl font-bold text-center pt-6">Payment Expired!</p>

      <p className="text-lg text-[#636363] text-center pt-4">
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
    <div className="flex justify-center flex-col lg:mt-0 mt-15 lg:mx-0 mx-6 lg:mb-0 mb-10">
      <div className="flex justify-center">
        <img src="/public/assets/success.svg" className="w-[143px] h-24" />
      </div>

      <p className="text-2xl font-bold text-center pt-6">Payment successful!</p>

      <p className="text-lg text-[#636363] text-center pt-4">
        Your payment of $320 has been sent successfully.
      </p>

      <div className="bg-[#F7F7FF] rounded-[24px] px-8 py-6 mx-[63px] mt-6 lg:block hidden">
        <p className="text-lg font-bold">
          Want a receipt?{" "}
          <span className="text-xs text-[#636363]">(optional)</span>
        </p>

        <p className="text-sm text-[#636363]">
          enter your email to receive your payment receipt
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex mt-4">
            <input
              className="bg-white rounded-xl border-2 border-[#CBBEFF] text-base px-4 py-[10px] text-[#636363] w-[340px]"
              type="email"
              name="email"
              placeholder="you.awesome@gmail.com"
            />

            <button
              type="submit"
              className="cursor-pointer bg-[#6449FF] text-white rounded-xl text-base font-bold px-4 py-3"
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
  const tokenOptions = [
    {
      value: "usdt",
      label: "USDT",
      logo: "/public/assets/usdt.svg",
    },
    {
      value: "usdc",
      label: "USDC",
      logo: "/public/assets/usdc.svg",
    },
    {
      value: "eth",
      label: "ETH",
      logo: "/public/assets/eth.svg",
    },
    {
      value: "bitcoin",
      label: "Bitcoin",
      logo: "/public/assets/bitcoin.svg",
    },
    {
      value: "xlm",
      label: "XLM",
      logo: "/public/assets/xlm.svg",
    },
  ];

  const networkOptions = [
    {
      value: "ethereum",
      label: "Ethereum (ERC20)",
      logo: "/public/assets/eth.svg",
    },
    {
      label: "Binance",
      value: "bsc",
      logo: "/public/assets/bsc.svg",
    },
    {
      value: "arbitrum",
      label: "Arbitrum",
      logo: "/public/assets/arbitrum.svg",
    },
    {
      value: "base",
      label: "Base",
      logo: "/public/assets/base.svg",
    },
    {
      value: "optimism",
      label: "Optimism",
      logo: "/public/assets/optimism.svg",
    },
  ];

  const handleTokenChange = (e) => {
    console.log(e);
  };

  const handleNetworkChange = () => { };

  return (
    <>
      <p className="lg:text-[24px] text-[18px] font-bold m-4 lg:m-0 mb-0 lg:text-left text-center">
        Select an asset and network you want to pay
      </p>

      <div className="flex lg:justify-between lg:mt-3 m-4 flex-col xl:flex-row">
        <CSelect
          title="Asset Type"
          placeholder="Choose asset"
          options={tokenOptions}
          onChange={handleTokenChange}
        />

        <CSelect
          title="Network"
          placeholder="Choose network"
          options={networkOptions}
          onChange={handleNetworkChange}
        />
      </div>

      <div className="bg-[#F7F7FF] rounded-xl lg:mt-8 m-4 mt-6 flex flex-col justify-center items-center">
        <p className="lg:text-2xl test-[18px] lg:pt-6 pt-3 font-medium">
          Please send <span className="text-[#4D35DB] font-semibold">$320</span>{" "}
          to the address below
        </p>

        <div className="flex lg:justify-between justify-center items-center lg:p-6 xl:flex-row flex-col w-[100%] gap-5">
          <div className="min-w-[210px] h-[210px] border-2 border-[#E5DFFF] bg-white flex justify-center items-center rounded-xl lg:mt-0 mt-4">
            <Qrcode
              content="https://example.com2917439826439436239"
              logo="/public/assets/usdt.svg"
              width={180}
              height={180}
            />
          </div>

          <div className="flex flex-col items-center justify-center lg:mt-[0px] mt-3 lg:mx-0 w-[90%] max-w-[400px]">
            <div className="bg-white lg:rounded-[12px] rounded-[8px] font-bold text-lg border-2 border-[#E5DFFF] lg:px-3 lg:py-[10px] lg:pl-4 p-3 flex justify-between items-end break-all leading-[22px] gap-[10px] w-[100%]">
              <p>0x4093753409r3abcxd23979307abcdn1235abcdefg</p>

              <img src="/public/assets/copy.svg" className="w-6 h-6" />
            </div>

            <div className="w-[100%] lg:mt-6 mt-2 bg-[#FFF4EA] border-2 border-[#ECDAC9] lg:rounded-[12px] rounded-[8px] lg:px-4 px-3 lg:py-2 py-2 text-[12px] lg:text-left text-center">
              Send only <img src="/public/assets/usdc.svg" className="inline" />{" "}
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
    <div className="flex flex-col h-screen">
      <div>
        <div className="lg:mt-[60px] lg:mb-[35px] hidden lg:flex">
          <img src="/public/assets/payli_medium.svg" />
          <img src="/public/assets/payli_logotype.svg" className="ml-[14px]" />
        </div>

        <div className="flex lg:flex-row flex-col-reverse w-full">
          <Box
            style={{
              background:
                "linear-gradient(#fff, #fff) padding-box, linear-gradient(to right, #E9E9FE, white) border-box",
            }}
            className="lg:w-2/3 min-w-[350px] lg:p-10 border-2 border-transparent mt-[12px] lg:mt-[0px] lg:ml-[0] ml-[18px] lg:mr-[0px] mr-[18px]"
          >
            {status === "pending" ? <OrderPending /> : <p />}

            {status === "success" ? <OrderSuccess /> : <p />}

            {status === "failed" ? <OrderFailed /> : <p />}
          </Box>

          <Box
            className="lg:w-1/3 min-w-[350px] lg:ml-[32px] ml-[18px] lg:mr-[0px] mr-[18px] lg:px-8 px-4 lg:py-10 py-[16px] max-h-[362px] lg:mt-[0px] mt-[56px]"
            style={{
              borderTop: "5px solid #6449FF",
            }}
          >
            <div className="flex gap-[10px] items-center lg:justify-start justify-center">
              <Timer startDate={Date.now()} endDate={Date.now() + 40000} />

              <div>
                <p className="font-bold lg:text-lg text-[18px]">14:30</p>
                <p className="text-[#636363] text-sm hidden lg:block">
                  Expiration time
                </p>
              </div>
            </div>

            <div className="flex justify-between lg:mt-8 mt-4">
              <p className="text-[#636363] lg:text-base text-[14px]">ID</p>
              <p className="font-bold lg:text-base text-[16px]">299190</p>
            </div>

            <div className="flex justify-between lg:mt-[23px] mt-3">
              <p className="text-[#636363]  lg:text-base text-[14px]">To</p>
              <p className="font-bold gap-2 flex items-center lg:text-base text-[16px]">
                <img
                  src="/public/assets/telegram.svg"
                  className="inline w-[22px] h-[22px]"
                />
                @heyamir
              </p>
            </div>

            <div
              className="w-full h-[1px] lg:mt-[23px] mt-3"
              style={{
                background:
                  "repeating-linear-gradient(to right, #C7C7C7 0 6px, transparent 6px 12px)",
              }}
            />

            <div className="lg:mt-[23px] mt-3 flex justify-between items-center">
              <div>
                <p className="text-[#636363] lg:text-base text-[14px]">
                  You have to pay
                </p>

                <p className="text-[40px] font-bold lg:block hidden">$320</p>
              </div>

              <div className="flex gap-2 items-center">
                <img
                  src="/public/assets/receipt.svg"
                  className="lg:w-10 w-6 lg:h-10 h-6"
                />

                <p className="lg:hidden block font-bold text-[22px]">$320</p>
              </div>
            </div>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
