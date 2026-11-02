export interface ProductColor { name: string; value?: string; }
export interface Product {
  id: string | number;
  title: string;
  desc?: string;
  price: number;
  img: string;
  img2?: string;
  category: number | string;
  sub_category: string;
  type?: string;
  isNew?: boolean;
  sizes?: string[];
  colors?: Array<string | ProductColor>;
  vendor?: string;
  compareAtPrice?: number;
}
export interface CartLine {
  id: string;
  key: string;
  title: string;
  desc: string;
  price: number;
  img: string;
  quantity: number;
  size: string;
  color: string;
}
export interface DemoOrder {
  id: string;
  createdAt: string;
  items: CartLine[];
  total: number;
  quantity: number;
}
