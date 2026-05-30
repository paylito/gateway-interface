import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Order from "./pages/Order";
import NotFound from "./pages/NotFound";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="w-screen flex justify-center items-center">
      <img
        src="/public/assets/background.svg"
        className="hidden lg:block fixed bottom-0 left-0 -z-[1]"
      />
      <BrowserRouter>
        <Routes>
          <Route path="/success" element={<Order status="success" />} />
          <Route path="/failed" element={<Order status="failed" />} />
          <Route path="/:id" element={<Order status="pending" />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  </StrictMode>,
);
