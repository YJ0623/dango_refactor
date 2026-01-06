// src/types/store.ts
export interface Menu {
  id: number;
  name: string;
  price: number;
  content: string;
  menu_image_url: string | null;
}

export interface StoreDetail {
  id: number;
  name: string;
  category: string;
  address: string;
  phone: string;
  store_url?: string;
  sns_url?: string;
  store_image_url?: string;
  stamp_image_url?: string;
  reward: string;
  max_count: number;
  store_menus: Menu[]; 
}