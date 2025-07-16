export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: {
    id: number;
    name: string;
  };
  images: { url: string }[];
  variants?: {
    id: number;
    name: string;
    options: {
      id: number;
      value: string;
    }[];
  }[];
}


export interface ProductImage {
  id: number
  url: string
  productId: number
}

export interface Category {
  id: number
  name: string
  imageUrl: string
}
