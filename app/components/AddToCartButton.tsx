"use client";

type Product = {
  id: number;
  name: string;
  price: number;
  image_url?: string | null;
};

export default function AddToCartButton({
  product,
}: {
  product: Product;
}) {
  function addToCart() {
    const existingCart = localStorage.getItem("cart");

    const cart = existingCart
      ? JSON.parse(existingCart)
      : [];

    const existingProduct = cart.find(
      (item: Product & { quantity: number }) =>
        item.id === product.id
    );

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1,
      });
    }

    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );

    alert("محصول به سبد خرید اضافه شد 🛒");
  }

  return (
    <button
      onClick={addToCart}
      className="mt-8 w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white transition hover:bg-blue-700"
    >
      🛒 افزودن به سبد خرید
    </button>
  );
}