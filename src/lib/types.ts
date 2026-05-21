export type ISODate = string;

export type Niche = 'gaming' | 'tech' | 'lifestyle' | 'finance';
export type Category = 'apparel' | 'electronics' | 'home';

export interface Channel {
  id: string;
  name: string;
  niche: Niche;
  color: string;
}

export interface Store {
  id: string;
  name: string;
  category: Category;
  color: string;
}

export interface YouTubeDaily {
  date: ISODate;
  channelId: string;
  views: number;
  revenue: number;
}

export interface StoreDaily {
  date: ISODate;
  storeId: string;
  units: number;
  revenue: number;
  visitors: number;
}

export type DateRangeDays = 7 | 30 | 90;
