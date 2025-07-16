"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number, variant?: string) => void
  clearCart: () => void;
  total: number;
  isOpen: boolean;
  toggleSidebar: (val: boolean) => void;
  justCompletedPurchase: boolean;
  setJustCompletedPurchase: (val: boolean) => void;
  cartLoaded: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [justCompletedPurchase, setJustCompletedPurchase] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(storedCart);
    } catch (e) {
      console.error("Error al parsear carrito:", e);
    } finally {
      setCartLoaded(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(
        i => i.id === item.id && i.variant === item.variant
      )
      if (existing) {
        return prev.map(i =>
          i.id === item.id && i.variant === item.variant
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      return [...prev, item]
    })
    setIsOpen(true)
  }

  const removeFromCart = (id: number, variant?: string) => {
    setCart(prev =>
      prev.filter(i => !(i.id === id && i.variant === variant))
    )
  }

  const clearCart = () => setCart([]);

  const toggleSidebar = (val: boolean) => setIsOpen(val);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        total,
        isOpen,
        toggleSidebar,
        justCompletedPurchase,
        setJustCompletedPurchase,
        cartLoaded
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context)
    throw new Error("useCart must be used within a CartProvider");
  return context;
}
