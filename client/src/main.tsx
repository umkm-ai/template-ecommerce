import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ProductsPage } from "./pages/ProductsPage.js";

const el = document.getElementById("root");
if (!el) throw new Error("root element missing");

createRoot(el).render(
  <StrictMode>
    <ProductsPage />
  </StrictMode>,
);
