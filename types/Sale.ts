export interface SaleWithUserAndProducts {
  id: number;
  total: number;
  createdAt: string;
  user: {
    email: string;
    phone: string | null;
  };
  products: {
    name: string;
    price: number;
  }[];
}
