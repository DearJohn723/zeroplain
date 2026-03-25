export type Language = 'en' | 'zh' | 'tw';

export interface ProductColor {
  name: { en: string; zh: string };
  images: string[];
}

export interface Product {
  id: string;
  name: { en: string; zh: string };
  description: { en: string; zh: string };
  details: { en: string; zh: string };
  price: number;
  salePrice?: number;
  images: string[];
  youtubeId?: string;
  category: { en: string; zh: string };
  weight?: string;
  type?: { en: string; zh: string };
  dimensions?: string;
  parts?: number;
  colors?: ProductColor[];
  createdAt?: string;
}

export interface NewsItem {
  id: string;
  date: string;
  title: { en: string; zh: string };
  content: { en: string; zh: string };
  type: 'news' | 'event';
}

export interface SiteContent {
  nav: {
    home: { en: string; zh: string };
    products: { en: string; zh: string };
    about: { en: string; zh: string };
    news: { en: string; zh: string };
    contact: { en: string; zh: string };
    globalAgents: { en: string; zh: string };
  };
  hero: {
    title: { en: string; zh: string };
    subtitle: { en: string; zh: string };
    cta: { en: string; zh: string };
    image?: string;
  };
  globalAgents: {
    title: { en: string; zh: string };
    benefits: { en: string; zh: string };
    requirements: { en: string; zh: string };
  };
  about: {
    title: { en: string; zh: string };
    content: { en: string; zh: string };
    image?: string;
  };
  logo?: string;
  contactInfo?: { en: string; zh: string };
  homepageProducts?: {
    ids: string[];
    limit: number;
  };
  theme?: 'red' | 'gold' | 'blue';
}
