import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Order from "./pages/Order";
import OrderPreview from "./pages/OrderPreview";
import NotFound from "./pages/NotFound";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="w-screen flex justify-center items-center">
      <img
        src="/assets/background.svg"
        className="hidden lg:block fixed bottom-0 left-0 -z-[1]"
      />
      <BrowserRouter>
        <Routes>
          {/* Static design previews (no backend needed). */}
          <Route path="/success" element={<OrderPreview phase="success" />} />
          <Route path="/failed" element={<OrderPreview phase="failed" />} />

          {/* Real order, fetched + polled by id. */}
          <Route path="/:id" element={<Order />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  </StrictMode>,
);
