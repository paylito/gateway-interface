import Footer from "../components/Footer";

const NotFound = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-[520px] flex flex-col items-center text-center">
        <div className="flex items-center mb-10">
          <img src="/assets/payli_medium.svg" />
          <img src="/assets/payli_logotype.svg" className="ml-[14px]" />
        </div>

        <div
          className="w-full bg-white rounded-[24px] px-6 sm:px-12 py-12 sm:py-14 border-2 border-transparent"
          style={{
            background:
              "linear-gradient(#fff, #fff) padding-box, linear-gradient(to right, #E9E9FE, white) border-box",
            boxShadow: "0 20px 60px rgba(100, 73, 255, 0.08)",
          }}
        >
          <p className="font-bold leading-none text-[88px] sm:text-[120px] bg-gradient-to-r from-[#6449FF] to-[#9F8FFF] bg-clip-text text-transparent">
            404
          </p>

          <p className="text-2xl sm:text-3xl font-bold mt-2">Page not found</p>

          <p className="text-[#636363] text-base sm:text-lg mt-3 max-w-[380px] mx-auto">
            The page you're looking for doesn't exist, expired, or has been
            moved.
          </p>

          <a
            href="/"
            className="inline-block mt-8 bg-[#6449FF] hover:bg-[#5238e6] transition-colors text-white font-bold rounded-xl px-7 py-3 cursor-pointer"
          >
            Back to home
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
