
export interface CartItem {
  appId: string;
  name: string;
  addedAt: number;
}

export interface ShoppingCart {
  items: CartItem[];
  updatedAt: number;
}
