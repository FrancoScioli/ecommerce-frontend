export async function secureCreateSale(token: string, body: {
  userId: number;
  productIds: number[];
  deliveryMethod: "pickup" | "shipping";
  shippingAddress?: string;
  postalCode?: string;
}) {
  const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales/secure-create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) throw new Error("No se pudo crear la venta");
  return resp.json(); // contiene totalFinal, shippingCost, etc.
}
