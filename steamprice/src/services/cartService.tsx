
import type { CartItem, ShoppingCart } from "../types/cart";

const CART_STORAGE_KEY = "steamprice_cart_v1";

const extensionApi = (
  globalThis as typeof globalThis & {
    chrome: {
      storage: {
        local: {
          get(key: string): Promise<Record<string, unknown>>;
          set(items: Record<string, unknown>): Promise<void>;
        };
      };
    };
  }
).chrome;

const EMPTY_CART: ShoppingCart = {
  items: [],
  updatedAt: Date.now(),
};

export async function getCart(): Promise<ShoppingCart> {
  const stored = await extensionApi.storage.local.get(
    CART_STORAGE_KEY
  );

  const cart = stored[CART_STORAGE_KEY] as
    ShoppingCart | undefined;

  return cart ?? EMPTY_CART;
}

export async function addToCart(
  appId: string,
  name: string
): Promise<ShoppingCart> {
  const cart = await getCart();

  // Don't add the same game twice.
  const alreadyAdded = cart.items.some(
    (item) => item.appId === appId
  );

  if (alreadyAdded) {
    return cart;
  }

  const newItem: CartItem = {
    appId,
    name,
    addedAt: Date.now(),
  };

  const updatedCart: ShoppingCart = {
    items: [...cart.items, newItem],
    updatedAt: Date.now(),
  };

  await extensionApi.storage.local.set({
    [CART_STORAGE_KEY]: updatedCart,
  });

  return updatedCart;
}

export async function removeFromCart(
  appId: string
): Promise<ShoppingCart> {
  const cart = await getCart();

  const updatedCart: ShoppingCart = {
    items: cart.items.filter(
      (item) => item.appId !== appId
    ),
    updatedAt: Date.now(),
  };

  await extensionApi.storage.local.set({
    [CART_STORAGE_KEY]: updatedCart,
  });

  return updatedCart;
}

export async function clearCart(): Promise<void> {
  const emptyCart: ShoppingCart = {
    items: [],
    updatedAt: Date.now(),
  };

  await extensionApi.storage.local.set({
    [CART_STORAGE_KEY]: emptyCart,
  });
}
