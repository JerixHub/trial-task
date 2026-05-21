import type { Channel, Store } from './types';

export const CHANNELS: Channel[] = [
  { id: 'ch_pixelforge',    name: 'PixelForge',    niche: 'gaming',    color: '#8b5cf6' },
  { id: 'ch_bytedepot',     name: 'ByteDepot',     niche: 'tech',      color: '#3b82f6' },
  { id: 'ch_slowsundays',   name: 'SlowSundays',   niche: 'lifestyle', color: '#f97316' },
  { id: 'ch_moneymechanic', name: 'MoneyMechanic', niche: 'finance',   color: '#10b981' },
];

export const STORES: Store[] = [
  { id: 'st_northline',  name: 'Northline Apparel',    category: 'apparel',     color: '#ec4899' },
  { id: 'st_voltcase',   name: 'Voltcase Electronics', category: 'electronics', color: '#06b6d4' },
  { id: 'st_hearthwood', name: 'Hearthwood Home',      category: 'home',        color: '#eab308' },
];

export const DATE_RANGES = [7, 30, 90] as const;
export const SEED = 20260521;
export const TODAY = '2026-05-21';
export const SERIES_DAYS = 90;
