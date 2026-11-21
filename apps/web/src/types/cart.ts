export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
}
