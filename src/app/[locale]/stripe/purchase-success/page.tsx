"use client";

import { useParams } from "next/navigation";

export default function PurchasePage() {
  const params = useParams();
  const productId = params?.id; // تأكد من استخراج `id`

  if (!productId) {
    return <p>⚠️ Product ID is missing</p>;
  }

  return (
    <div>
      <h1>Purchase Page for Product {productId}</h1>
      {/* يمكنك تمرير productId لأي مكون آخر هنا */}
    </div>
  );
}
