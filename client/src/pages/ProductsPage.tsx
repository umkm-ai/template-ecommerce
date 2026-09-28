import { useEffect, useState } from "react";
import { listProducts, type ProductDTO } from "../api/client.js";

function formatIDR(cents: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function ProductsPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listProducts()
      .then((res) => setProducts(res.data))
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "failed to load"),
      );
  }, []);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "1.5rem" }}>
      <h1>Katalog Produk</h1>
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        {products.map((p) => (
          <article
            key={p.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              padding: "1rem",
            }}
          >
            <h3 style={{ margin: "0 0 0.25rem" }}>{p.name}</h3>
            <p style={{ margin: "0 0 0.5rem", color: "#6b7280" }}>{p.sku}</p>
            <strong>{formatIDR(p.priceCents)}</strong>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.875rem" }}>
              Stok: {p.stock}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
