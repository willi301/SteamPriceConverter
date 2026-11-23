import { useEffect, useState } from "react";

import {
  getCart,
  removeFromCart,
  clearCart
} from "../services/cartService";

import type {
  ShoppingCart
} from "../types/cart";

export default function CartPage() {
  const [cart, setCart] = useState<ShoppingCart>({
    items: [],
    updatedAt: Date.now(),
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCart() {
      try {
        const storedCart = await getCart();
        setCart(storedCart);
      } catch (error) {
        console.error("Failed to load cart:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, []);

  async function handleRemove(appId: string) {
    const updatedCart = await removeFromCart(appId);
    setCart(updatedCart);
  }

  async function handleClearCart() {
    const confirmed = window.confirm(
      "Are you sure you want to clear your cart?"
    );

    if (!confirmed) return;

    await clearCart();

    setCart({
      items: [],
      updatedAt: Date.now(),
    });
  }

  if (loading) {
    return <main className="cart-page">Loading cart...</main>;
  }

  return (
    <main className="cart-page">
      <header className="cart-header">
        <div>
          <h1>SteamPrice</h1>
          <p>Your game shopping list</p>
        </div>

        <span>{cart.items.length} games</span>
      </header>

      <section className="cart-content">
        <div className="cart-title">
          <h2>Your Cart</h2>

          {cart.items.length > 0 && (
            <button onClick={handleClearCart}>
              Clear Cart
            </button>
          )}
        </div>

        {cart.items.length === 0 ? (
          <p>Your cart is empty. Add some games from Steam!</p>
        ) : (
          cart.items.map((item) => (
            <article className="cart-item" key={item.appId}>
              <div>
                <h3>{item.name}</h3>
                <p>Steam App ID: {item.appId}</p>
              </div>

              <button
                onClick={() => handleRemove(item.appId)}
              >
                Remove
              </button>
            </article>
          ))
        )}
      </section>
    </main>
  );
}