export interface Category {
  id: number;
  name: string;
  imageUrl: string;
  lockName?: boolean;
  lockImage?: boolean;
  _count?: { products: number };
}
