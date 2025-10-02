export interface Category {
  id: number;
  name: string;
  imageUrl: string;
  _count?: { products: number };
}
