/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, Globe, ChevronRight, 
  Play, Info, Calendar, Newspaper, ArrowRight,
  Instagram, Youtube, Facebook, Mail, ExternalLink,
  Settings, LogIn, LogOut, Plus, Trash2, Edit,
  Check, Layout, ArrowUpDown, Filter, ChevronLeft, Users
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Language, Product, ProductColor, NewsItem, SiteContent } from './types';
import { SITE_CONTENT as DEFAULT_SITE_CONTENT, PRODUCTS as DEFAULT_PRODUCTS, NEWS as DEFAULT_NEWS, COUNTRIES } from './constants';
import * as OpenCC from 'opencc-js';

const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });

const EXCHANGE_RATES = {
  en: 1,
  zh: 7.2, // USD to CNY
  tw: 32.0 // USD to TWD
};

const CURRENCY_SYMBOLS = {
  en: '$',
  zh: '¥',
  tw: 'NT$'
};
import { db, auth } from './firebase';
import { 
  collection, onSnapshot, doc, setDoc, deleteDoc, 
  getDoc, getDocs, writeBatch, query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { 
  onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User 
} from 'firebase/auth';
import { 
  Routes, Route, Link, useLocation, useNavigate 
} from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function TechCorner({ className = "" }: { className?: string }) {
  return (
    <div className={`tech-corner ${className}`}>
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyber-red" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyber-red" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyber-red" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyber-red" />
    </div>
  );
}

function GlitchImage({ src, alt, className = "" }: { src: string, alt: string, className?: string }) {
  return (
    <div className={`relative overflow-hidden group ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
        <div className="absolute inset-0 bg-cyber-red/20 mix-blend-overlay animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,212,255,0.1)_50%)] bg-[length:100%_4px] animate-scanline-scroll" />
      </div>
    </div>
  );
}

function HUDOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden opacity-20">
      {/* Corner Brackets */}
      <div className="absolute top-10 left-10 w-20 h-20 border-t border-l border-cyber-red/40" />
      <div className="absolute top-10 right-10 w-20 h-20 border-t border-r border-cyber-red/40" />
      <div className="absolute bottom-10 left-10 w-20 h-20 border-b border-l border-cyber-red/40" />
      <div className="absolute bottom-10 right-10 w-20 h-20 border-b border-r border-cyber-red/40" />
      
      {/* Scanning Line */}
      <motion.div 
        animate={{ top: ['-10%', '110%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-px bg-cyber-red/30 shadow-[0_0_15px_var(--glow-color)]"
      />

      {/* Tech Data */}
      <div className="absolute top-1/2 left-6 -translate-y-1/2 flex flex-col gap-8 font-mono text-[8px] text-cyber-red/60 uppercase tracking-[0.3em] vertical-text">
        <span>LAT: 31.2304° N</span>
        <span>LNG: 121.4737° E</span>
        <span>ALT: 42.0M</span>
      </div>
      
      <div className="absolute top-1/2 right-6 -translate-y-1/2 flex flex-col gap-8 font-mono text-[8px] text-cyber-red/60 uppercase tracking-[0.3em] vertical-text">
        <span>SIGNAL: STABLE</span>
        <span>SYNC: 99.9%</span>
        <span>BUFFER: 0.02MS</span>
      </div>
    </div>
  );
}

function AboutPage({ 
  siteContent, lang, t, isAdmin, setIsEditingAbout 
}: { 
  siteContent: SiteContent; 
  lang: Language; 
  t: (obj: any) => string; 
  isAdmin: boolean;
  setIsEditingAbout: (b: boolean) => void;
}) {
  return (
    <div className="pt-32 pb-24 px-6 min-h-screen relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-cyber-red uppercase">
                {t(siteContent.about.title)}
              </h1>
              {isAdmin && (
                <button 
                  onClick={() => setIsEditingAbout(true)}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-cyber-red transition-all"
                  title="Edit About Section"
                >
                  <Edit size={20} />
                </button>
              )}
            </div>
            <div className="h-1 w-24 bg-cyber-red mb-8" />
            <p className="text-xl text-white/70 leading-relaxed mb-8 font-light">
              {t(siteContent.about.content)}
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-cyber-pink font-display text-4xl mb-2">100%</div>
                <div className="text-xs uppercase tracking-widest text-white/50">Stainless Steel</div>
              </div>
              <div>
                <div className="text-cyber-yellow font-display text-4xl mb-2">50+</div>
                <div className="text-xs uppercase tracking-widest text-white/50">Unique Designs</div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative cyber-border p-2"
          >
            <GlitchImage 
              src={siteContent.about.image || "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80&w=1000"} 
              alt="Workshop"
              className="w-full h-[600px]"
            />
            {isAdmin && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button 
                  onClick={() => setIsEditingAbout(true)}
                  className="p-3 bg-cyber-red text-white rounded-full shadow-lg hover:bg-white hover:text-cyber-red transition-all z-20"
                  title="Edit About Section"
                >
                  <Edit size={20} />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function NewsPage({ 
  news, lang, t, isAdmin, setIsAddingNews, setEditingNews, deleteNews, siteContent 
}: { 
  news: NewsItem[]; 
  lang: Language; 
  t: (obj: any) => string; 
  isAdmin: boolean;
  setIsAddingNews: (b: boolean) => void;
  setEditingNews: (n: NewsItem) => void;
  deleteNews: (id: string) => void;
  siteContent: SiteContent;
}) {
  return (
    <div className="pt-32 pb-24 px-6 min-h-screen relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase">
              {t(siteContent.nav.news)}
            </h1>
            <div className="h-1 w-24 bg-cyber-red mt-4" />
          </div>
          {isAdmin && (
            <button 
              onClick={() => setIsAddingNews(true)}
              className="cyber-button flex items-center gap-2"
            >
              <Plus size={16} /> {lang === 'en' ? 'Add News' : '新增消息'}
            </button>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-4 mb-8">
              <Newspaper className="text-cyber-pink" />
              <h3 className="text-2xl">{lang === 'en' ? 'Latest News' : '最新消息'}</h3>
            </div>
            <div className="space-y-6">
              {news.filter(n => n.type === 'news').map(item => (
                <div key={item.id} className="cyber-terminal group relative p-6 border-l-2 border-cyber-pink transition-colors">
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingNews(item)} className="text-cyber-yellow"><Edit size={14} /></button>
                      <button onClick={() => deleteNews(item.id)} className="text-cyber-red"><Trash2 size={14} /></button>
                    </div>
                  )}
                  <div className="text-cyber-pink/60 font-mono text-xs mb-2">{item.date}</div>
                  <h4 className="text-lg mb-2">{t(item.title)}</h4>
                  <p className="text-white/60 text-sm">{t(item.content)}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-4 mb-8">
              <Calendar className="text-cyber-yellow" />
              <h3 className="text-2xl">{lang === 'en' ? 'Upcoming Events' : '近期活動'}</h3>
            </div>
            <div className="space-y-6">
              {news.filter(n => n.type === 'event').map(item => (
                <div key={item.id} className="cyber-terminal group relative p-6 border-l-2 border-cyber-yellow transition-colors">
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingNews(item)} className="text-cyber-yellow"><Edit size={14} /></button>
                      <button onClick={() => deleteNews(item.id)} className="text-cyber-red"><Trash2 size={14} /></button>
                    </div>
                  )}
                  <div className="text-cyber-yellow/60 font-mono text-xs mb-2">{item.date}</div>
                  <h4 className="text-lg mb-2">{t(item.title)}</h4>
                  <p className="text-white/60 text-sm">{t(item.content)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsPage({ 
  products, lang, t, formatPrice, isAdmin, 
  setEditingProduct, deleteProduct, setSelectedProduct, 
  setIsAddingProduct, siteContent 
}: { 
  products: Product[]; 
  lang: Language; 
  t: (obj: any) => string; 
  formatPrice: (p: number) => string;
  isAdmin: boolean;
  setEditingProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  setSelectedProduct: (p: Product) => void;
  setIsAddingProduct: (b: boolean) => void;
  siteContent: SiteContent;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'name'>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const itemsPerPage = 9;

  const categories = Array.from(new Set(products.map(p => t(p.category))));

  const filteredProducts = products
    .filter(p => !selectedCategory || t(p.category) === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = a.createdAt || '1970-01-01T00:00:00.000Z';
        const dateB = b.createdAt || '1970-01-01T00:00:00.000Z';
        return dateB.localeCompare(dateA);
      }
      if (sortBy === 'oldest') {
        const dateA = a.createdAt || '1970-01-01T00:00:00.000Z';
        const dateB = b.createdAt || '1970-01-01T00:00:00.000Z';
        return dateA.localeCompare(dateB);
      }
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return t(a.name).localeCompare(t(b.name));
      return 0;
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortBy]);

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div>
            <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter text-white uppercase">
              {t(siteContent.nav.products)}
            </h1>
            <div className="h-1 w-24 bg-cyber-red mb-4" />
            <p className="text-xs text-white/30 uppercase tracking-widest">
              {lang === 'en' ? `Showing ${filteredProducts.length} products` : `顯示 ${filteredProducts.length} 個商品`}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative group flex-1 md:flex-none">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-cyber-gray border border-white/10 p-3 text-xs uppercase tracking-widest outline-none focus:border-cyber-red appearance-none pr-10"
              >
                <option value="newest">{lang === 'en' ? 'Newest First' : '最新上架'}</option>
                <option value="oldest">{lang === 'en' ? 'Oldest First' : '最早上架'}</option>
                <option value="price-asc">{lang === 'en' ? 'Price: Low to High' : '價格：低到高'}</option>
                <option value="price-desc">{lang === 'en' ? 'Price: High to Low' : '價格：高到低'}</option>
                <option value="name">{lang === 'en' ? 'Name: A-Z' : '名稱：A-Z'}</option>
              </select>
              <ArrowUpDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            </div>

            <div className="relative group flex-1 md:flex-none">
              <select 
                value={selectedCategory || ''} 
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full bg-cyber-gray border border-white/10 p-3 text-xs uppercase tracking-widest outline-none focus:border-cyber-red appearance-none pr-10"
              >
                <option value="">{lang === 'en' ? 'All Categories' : '所有分類'}</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            </div>

              {isAdmin && (
                <button 
                  onClick={() => {
                    console.log('ProductsPage: Adding product...');
                    setIsAddingProduct(true);
                  }}
                  className="cyber-button flex items-center gap-2 px-6"
                >
                  <Plus size={16} /> {lang === 'en' ? 'Add' : '新增'}
                </button>
              )}
          </div>
        </div>

        {paginatedProducts.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {paginatedProducts.map((product) => (
                <motion.div 
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="cyber-card group cursor-pointer relative"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="cyber-card-glow" />
                  <TechCorner className="opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {isAdmin && (
                    <div className="absolute top-2 left-2 z-20 flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingProduct(product); }}
                        className="p-2 bg-black/50 text-cyber-yellow hover:bg-cyber-yellow hover:text-black transition-all"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteProduct(product.id); }}
                        className="p-2 bg-black/50 text-cyber-red hover:bg-cyber-red hover:text-white transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                  <div className="relative aspect-square mb-6 overflow-hidden">
                    <GlitchImage 
                      src={product.images?.[0] || 'https://picsum.photos/seed/product/800/800'} 
                      alt={t(product.name)}
                      className="w-full h-full"
                    />
                    <div className="absolute top-4 right-4 bg-cyber-red text-white px-3 py-1 font-display text-xs font-bold z-10">
                      {t(product.category)}
                    </div>
                    <div className="absolute bottom-2 left-2 font-mono text-[8px] text-white/40 uppercase tracking-widest z-10 bg-black/40 px-1">
                      ID: {product.id.substring(0, 8)}
                    </div>
                  </div>
                  <h3 className="text-xl mb-2 group-hover:text-cyber-red transition-colors">{t(product.name)}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-cyber-red font-display font-bold">{formatPrice(product.price)}</span>
                    <span className="text-[10px] uppercase tracking-widest text-white/30">{product.id}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-3 border border-white/10 hover:border-cyber-red disabled:opacity-30 disabled:hover:border-white/10 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 border font-display text-xs transition-all ${currentPage === i + 1 ? 'bg-cyber-red border-cyber-red text-white' : 'border-white/10 hover:border-white/30 text-white/50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-3 border border-white/10 hover:border-cyber-red disabled:opacity-30 disabled:hover:border-white/10 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-24 text-center border border-dashed border-white/10">
            <p className="text-white/30 uppercase tracking-[0.3em]">No products found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState<Language>('en');

  function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    toast.error(lang === 'en' ? 'Database error occurred' : '資料庫發生錯誤');
    throw new Error(JSON.stringify(errInfo));
  }

  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isManagingAdmins, setIsManagingAdmins] = useState(false);
  const [allUsers, setAllUsers] = useState<{id: string, email: string, role: string}[]>([]);

  // Editing States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingNews, setIsAddingNews] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [isEditingLogo, setIsEditingLogo] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingGlobalAgents, setIsEditingGlobalAgents] = useState(false);
  const [isEditingHomepageProducts, setIsEditingHomepageProducts] = useState(false);
  const [isQuickInquiryModalOpen, setIsQuickInquiryModalOpen] = useState(false);
  const [quickInquiryProduct, setQuickInquiryProduct] = useState<Product | null>(null);
  const [selectedHomepageIds, setSelectedHomepageIds] = useState<string[]>([]);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Firestore Data
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [news, setNews] = useState<NewsItem[]>(DEFAULT_NEWS);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [tempColors, setTempColors] = useState<ProductColor[]>([]);

  useEffect(() => {
    if (editingProduct) {
      setTempColors(editingProduct.colors || []);
    } else if (isAddingProduct) {
      setTempColors([]);
    }
  }, [editingProduct, isAddingProduct]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle hash scrolling on route change
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500); // Wait for content to load
    } else if (sessionStorage.getItem('scrollToContact') === 'true') {
      sessionStorage.removeItem('scrollToContact');
      setTimeout(() => {
        const element = document.getElementById('contact');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!auth || !db) return;
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      console.log('Auth state changed:', u?.email);
      setUser(u);
      if (u) {
        try {
          const userDoc = await getDoc(doc(db, 'users', u.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.role === 'admin');
          } else {
            // Bootstrap first admin
            const isDefaultAdmin = u.email?.toLowerCase() === 'john@greatidea.tw' || u.email?.toLowerCase().endsWith('@greatidea.tw');
            const role = isDefaultAdmin ? 'admin' : 'user';
            await setDoc(doc(db, 'users', u.uid), {
              email: u.email,
              role: role,
              createdAt: serverTimestamp()
            });
            setIsAdmin(role === 'admin');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          const isDefaultAdmin = u.email?.toLowerCase() === 'john@greatidea.tw' || u.email?.toLowerCase().endsWith('@greatidea.tw');
          setIsAdmin(isDefaultAdmin);
        }
      } else {
        setIsAdmin(false);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, [db]);

  const dataLoadedFromProxy = useRef(false);
  const firestoreConnected = useRef(false);
  const firestoreHasData = useRef(false);

  // Real-time Firestore Sync
  useEffect(() => {
    if (!db) {
      console.warn('Firestore database not initialized. Using local defaults.');
      setIsInitialLoading(false);
      return;
    }

    const unsubSite = onSnapshot(doc(db, 'siteConfig', 'main'), (docSnap: any) => {
      firestoreConnected.current = true;
      if (docSnap.exists()) {
        firestoreHasData.current = true;
        const data = docSnap.data() as SiteContent;
        setSiteContent(prev => ({
          ...prev,
          ...data,
          nav: { ...prev.nav, ...data.nav },
          hero: { ...prev.hero, ...data.hero },
          globalAgents: data.globalAgents || prev.globalAgents,
          homepageProducts: data.homepageProducts || prev.homepageProducts
        }));
        setIsInitialLoading(false);
      } else if (!docSnap.metadata?.fromCache && isAuthReady && isAdmin && !hasInitialized) {
        setDoc(doc(db, 'siteConfig', 'main'), DEFAULT_SITE_CONTENT).catch(e => handleFirestoreError(e, OperationType.WRITE, 'siteConfig/main'));
        setHasInitialized(true);
        setIsInitialLoading(false);
      }
    }, (error) => {
      if (!dataLoadedFromProxy.current && !firestoreConnected.current) {
        handleFirestoreError(error, OperationType.GET, 'siteConfig/main');
      }
    });

    const unsubProducts = onSnapshot(query(collection(db, 'products')), (snapshot: any) => {
      firestoreConnected.current = true;
      if (!snapshot.empty) {
        firestoreHasData.current = true;
        setProducts(snapshot.docs.map((d: any) => d.data() as Product));
      } else if (!snapshot.metadata?.fromCache && isAuthReady) {
        // Only clear if we're sure the server says it's empty
        // and we're not an admin about to seed it, and we haven't loaded from proxy
        if (!isAdmin && !dataLoadedFromProxy.current) {
          setProducts([]);
        }
        
        if (isAdmin && !hasInitialized) {
          const batch = writeBatch(db);
          DEFAULT_PRODUCTS.forEach(p => {
            batch.set(doc(db, 'products', p.id), p);
          });
          batch.commit().then(() => setHasInitialized(true)).catch(e => handleFirestoreError(e, OperationType.WRITE, 'products-batch'));
        }
      }
    }, (error) => {
      if (!dataLoadedFromProxy.current && !firestoreConnected.current) {
        handleFirestoreError(error, OperationType.GET, 'products');
      }
    });

    const unsubNews = onSnapshot(query(collection(db, 'news')), (snapshot: any) => {
      firestoreConnected.current = true;
      if (!snapshot.empty) {
        firestoreHasData.current = true;
        setNews(snapshot.docs.map((d: any) => d.data() as NewsItem).sort((a, b) => b.date.localeCompare(a.date)));
      } else if (!snapshot.metadata?.fromCache && isAuthReady) {
        if (!isAdmin && !dataLoadedFromProxy.current) {
          setNews([]);
        }
        
        if (isAdmin) {
          const batch = writeBatch(db);
          DEFAULT_NEWS.forEach(n => {
            batch.set(doc(db, 'news', n.id), n);
          });
          batch.commit().catch(e => handleFirestoreError(e, OperationType.WRITE, 'news-batch'));
        }
      }
    }, (error) => {
      if (!dataLoadedFromProxy.current && !firestoreConnected.current) {
        handleFirestoreError(error, OperationType.GET, 'news');
      }
    });

    // 1. Immediate Proxy Fetch (for China/unstable connections)
    const fetchProxyData = async () => {
      if (firestoreHasData.current) return;
      
      console.log('Attempting to fetch data via server proxy...');
      try {
        const response = await fetch('/api/data');
        if (response.ok && !firestoreHasData.current) {
          const data = await response.json();
          if (data.products && data.products.length > 0 && !firestoreHasData.current) setProducts(data.products);
          if (data.news && data.news.length > 0 && !firestoreHasData.current) setNews(data.news.sort((a: any, b: any) => b.date.localeCompare(a.date)));
          if (data.siteConfig && !firestoreHasData.current) {
            setSiteContent(prev => ({
              ...prev,
              ...data.siteConfig,
              nav: { ...prev.nav, ...data.siteConfig.nav },
              hero: { ...prev.hero, ...data.siteConfig.hero },
              globalAgents: data.siteConfig.globalAgents || prev.globalAgents,
              homepageProducts: data.siteConfig.homepageProducts || prev.homepageProducts
            }));
          }
          dataLoadedFromProxy.current = true;
          setIsInitialLoading(false);
          console.log('Data successfully loaded via proxy');
        }
      } catch (e) {
        console.warn('Proxy fetch failed:', e);
      }
    };

    fetchProxyData();

    // 2. Fallback timeout to ensure loading finishes
    const timeout = setTimeout(() => {
      if (isInitialLoading && !dataLoadedFromProxy.current && !firestoreConnected.current) {
        console.warn('All data connection attempts timed out. Using local defaults.');
        setIsInitialLoading(false);
        toast.info(lang === 'en' ? 'Connection slow. Using local data.' : '連線較慢，正使用本地預設資料。');
      }
    }, 8000);

    return () => {
      clearTimeout(timeout);
      unsubSite();
      unsubProducts();
      unsubNews();
    };
  }, [isAdmin, isAuthReady, lang, db]);

  useEffect(() => {
    console.log('Products state updated:', products.length, 'products found.');
    if (products.length > 0) {
      console.log('Product IDs:', products.map(p => p.id).join(', '));
    }
  }, [products]);

  useEffect(() => {
    if (selectedProduct) {
      setSelectedColorIndex(null);
    }
  }, [selectedProduct]);

  const t = (obj: { en: string; zh: string }) => {
    if (!obj) return '';
    if (lang === 'tw') {
      return converter(obj.zh);
    }
    return obj[lang as 'en' | 'zh'];
  };

  const formatPrice = (price: number) => {
    const rate = EXCHANGE_RATES[lang];
    const symbol = CURRENCY_SYMBOLS[lang];
    const convertedPrice = Math.round(price * rate);
    return `${symbol}${convertedPrice.toLocaleString()}`;
  };

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'zh', label: '简体中文', short: '简体' },
    { code: 'tw', label: '繁體中文', short: '繁體' }
  ];

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.code === 'auth/unauthorized-domain') {
        toast.error(lang === 'en' 
          ? 'This domain (zeroplain.com) is not authorized in Firebase. Please add it to "Authorized domains" in the Firebase Console.' 
          : '此網域 (zeroplain.com) 尚未在 Firebase 中獲得授權。請在 Firebase 控制台的「授權網域」中加入此網域。');
      } else {
        toast.error(lang === 'en' ? `Login failed: ${error.message}` : `登入失敗：${error.message}`);
      }
    }
  };

  const handleLogout = () => signOut(auth);

  // Admin Actions
  const seedDatabase = async () => {
    if (!isAdmin) return;
    if (!confirm(lang === 'en' ? 'WARNING: This will delete ALL your uploaded products and news items and reset the database to default values. Are you sure?' : '警告：這將刪除所有您上傳的商品和新聞，並將資料庫重置為預設值。您確定嗎？')) return;
    
    try {
      // 1. Clear existing products
      const productSnap = await getDocs(collection(db, 'products'));
      const productBatch = writeBatch(db);
      productSnap.docs.forEach(d => productBatch.delete(d.ref));
      await productBatch.commit();

      // 2. Clear existing news
      const newsSnap = await getDocs(collection(db, 'news'));
      const newsBatch = writeBatch(db);
      newsSnap.docs.forEach(d => newsBatch.delete(d.ref));
      await newsBatch.commit();

      // 3. Seed new content
      const seedBatch = writeBatch(db);
      
      // Seed Site Content
      seedBatch.set(doc(db, 'siteConfig', 'main'), DEFAULT_SITE_CONTENT);
      
      // Seed Products
      DEFAULT_PRODUCTS.forEach(p => {
        seedBatch.set(doc(db, 'products', p.id), p);
      });
      
      // Seed News
      DEFAULT_NEWS.forEach(n => {
        seedBatch.set(doc(db, 'news', n.id), n);
      });

      await seedBatch.commit();
      toast.success('Database fully reset to default constants!');
    } catch (error) {
      console.error('Seed error:', error);
      toast.error('Failed to reset database.');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm(lang === 'en' ? 'Are you sure you want to delete this product?' : '確定要刪除此商品嗎？')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success(lang === 'en' ? 'Product deleted' : '商品已刪除');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const deleteNews = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm(lang === 'en' ? 'Are you sure you want to delete this news item?' : '確定要刪除此新聞嗎？')) return;
    try {
      await deleteDoc(doc(db, 'news', id));
      toast.success(lang === 'en' ? 'News item deleted' : '新聞已刪除');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `news/${id}`);
    }
  };

  const saveProduct = async (product: Product, oldId?: string) => {
    if (!isAdmin) return;
    try {
      // Clean undefined fields for Firestore
      const data = JSON.parse(JSON.stringify(product));
      
      await setDoc(doc(db, 'products', product.id), data);
      
      // If ID changed, delete the old document
      if (oldId && oldId !== product.id) {
        await deleteDoc(doc(db, 'products', oldId));
      }
      
      setEditingProduct(null);
      setIsAddingProduct(false);
      toast.success(lang === 'en' ? 'Product saved successfully!' : '商品已儲存成功！');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${product.id}`);
    }
  };

  const saveNews = async (item: NewsItem) => {
    if (!isAdmin) return;
    try {
      // Clean undefined fields for Firestore
      const data = JSON.parse(JSON.stringify(item));
      
      await setDoc(doc(db, 'news', item.id), data);
      setEditingNews(null);
      setIsAddingNews(false);
      toast.success(lang === 'en' ? 'News item saved successfully!' : '新聞已儲存成功！');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `news/${item.id}`);
    }
  };

  const saveAbout = async (about: { title: { en: string; zh: string }; content: { en: string; zh: string }; image?: string }) => {
    if (!isAdmin) return;
    const newContent = {
      ...siteContent,
      about: {
        ...siteContent.about,
        title: about.title,
        content: about.content,
        image: about.image || siteContent.about.image
      }
    };
    await setDoc(doc(db, 'siteConfig', 'main'), newContent);
    setIsEditingAbout(false);
    toast.success('關於我們已更新');
  };

  const saveHero = async (hero: { tagline: { en: string; zh: string }; title: { en: string; zh: string }; subtitle: { en: string; zh: string }; image?: string }) => {
    if (!isAdmin) return;
    const newContent = {
      ...siteContent,
      hero: {
        ...siteContent.hero,
        tagline: hero.tagline,
        title: hero.title,
        subtitle: hero.subtitle,
        image: hero.image || siteContent.hero.image
      }
    };
    await setDoc(doc(db, 'siteConfig', 'main'), newContent);
    setIsEditingHero(false);
    toast.success('首頁封面已更新');
  };

  const saveGlobalAgents = async (globalAgents: { title: { en: string; zh: string }; benefits: { en: string; zh: string }; requirements: { en: string; zh: string } }) => {
    if (!isAdmin) return;
    const newContent = {
      ...siteContent,
      globalAgents: {
        ...siteContent.globalAgents,
        title: globalAgents.title,
        benefits: globalAgents.benefits,
        requirements: globalAgents.requirements
      }
    };
    await setDoc(doc(db, 'siteConfig', 'main'), newContent);
    setIsEditingGlobalAgents(false);
    toast.success('全球代理內容已更新');
  };

  const saveLogo = async (logoUrl: string) => {
    if (!isAdmin) return;
    const newContent = {
      ...siteContent,
      logo: logoUrl
    };
    await setDoc(doc(db, 'siteConfig', 'main'), newContent);
    setIsEditingLogo(false);
    toast.success('Logo 已更新');
  };

  const saveContact = async (contactInfo: { en: string; zh: string }, contact?: SiteContent['contact']) => {
    if (!isAdmin) return;
    const newContent = {
      ...siteContent,
      contactInfo,
      contact
    };
    await setDoc(doc(db, 'siteConfig', 'main'), newContent);
    setIsEditingContact(false);
    toast.success('聯絡資訊已更新');
  };

  const saveHomepageProducts = async (ids: string[], limit: number) => {
    if (!isAdmin) return;
    const newContent = {
      ...siteContent,
      homepageProducts: { ids, limit }
    };
    await setDoc(doc(db, 'siteConfig', 'main'), newContent);
    setIsEditingHomepageProducts(false);
    toast.success('首頁商品配置已更新');
  };

  const updateTheme = async (theme: 'red' | 'orange' | 'blue' | 'tron' | 'black') => {
    console.log('Updating theme to:', theme);
    const newContent = { ...siteContent, theme };
    
    // If admin, save to database
    if (isAdmin) {
      try {
        await setDoc(doc(db, 'siteConfig', 'main'), newContent);
        toast.success(lang === 'en' ? 'Global theme updated' : '全域主題已更新');
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, 'siteConfig/main');
      }
    } else {
      // For visitors, just update local state (it will be overridden by Firestore sync if not careful)
      // But since siteContent is synced, we should probably use a separate local state if we want persistence
      // For now, let's just update the state directly so it feels responsive
      setSiteContent(newContent);
      toast.success(lang === 'en' ? 'Theme changed' : '主題已切換');
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    if (!isAdmin || !db) return;
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await setDoc(doc(db, 'users', userId), { role: newRole }, { merge: true });
      toast.success(`User role updated to ${newRole}`);
      // Refresh user list
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersList = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setAllUsers(usersList);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    }
  };

  useEffect(() => {
    if (isManagingAdmins && db) {
      getDocs(collection(db, 'users')).then(snap => {
        const usersList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setAllUsers(usersList);
      }).catch(e => handleFirestoreError(e, OperationType.GET, 'users'));
    }
  }, [isManagingAdmins, db]);

  useEffect(() => {
    console.log('SiteContent updated, current theme:', siteContent.theme);
    const themeClass = siteContent.theme === 'orange' ? 'theme-orange' : 
                       siteContent.theme === 'blue' ? 'theme-blue' : 
                       siteContent.theme === 'black' ? 'theme-black' : 
                       siteContent.theme === 'red' ? 'theme-red' : '';
    document.body.classList.remove('theme-gold', 'theme-orange', 'theme-blue', 'theme-red', 'theme-black');
    if (themeClass) {
      document.body.classList.add(themeClass);
    }
  }, [siteContent.theme]);

  if (isInitialLoading) {
    return (
      <div className="fixed inset-0 bg-cyber-dark flex items-center justify-center z-[10000] overflow-hidden">
        <div className="hexagon-grid absolute inset-0 opacity-10" />
        <div className="scanline" />
        <div className="flex flex-col items-center gap-8 relative z-10">
          <div className="relative">
            <div className="w-32 h-32 border border-cyber-red/20 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-2 border border-cyber-red/40 rounded-full animate-[spin_6s_linear_infinite_reverse]" />
            <div className="absolute inset-4 border-2 border-cyber-red border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center font-display text-cyber-red text-xl font-bold">
              ZP
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="font-display text-cyber-red animate-pulse tracking-[0.5em] uppercase text-sm">
              Initializing System...
            </div>
            <div className="w-64 h-1 bg-white/5 relative overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-0 left-0 h-full bg-cyber-red shadow-[0_0_10px_var(--glow-color)]"
              />
            </div>
            <div className="flex gap-4 mt-4 font-mono text-[8px] text-white/20 uppercase tracking-widest">
              <span>CORE_LOAD: OK</span>
              <span>MEM_SYNC: OK</span>
              <span>NET_LINK: OK</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-cyber-dark selection:bg-cyber-red selection:text-white overflow-x-hidden relative">
      <div className="noise-bg pointer-events-none" />
      <div className="hexagon-grid fixed inset-0 opacity-10 pointer-events-none" />
      <HUDOverlay />
      <Toaster position="top-right" theme="dark" richColors />
      <div className="scanline pointer-events-none" />

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled ? 'bg-cyber-dark/90 backdrop-blur-md border-b border-cyber-red/20 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="hidden md:flex items-center gap-2 relative group">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {siteContent.logo ? (
                <img 
                  src={siteContent.logo} 
                  alt="Logo" 
                  className="h-10 w-auto object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent && !parent.querySelector('.fallback-logo')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'fallback-logo w-10 h-10 border-2 border-cyber-red flex items-center justify-center font-display font-bold text-xl text-cyber-red';
                      fallback.innerText = 'ZP';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <div className="w-10 h-10 border-2 border-cyber-red flex items-center justify-center font-display font-bold text-xl text-cyber-red">
                  ZP
                </div>
              )}
              <span className="font-display font-bold text-2xl tracking-tighter hidden sm:block">
                {t(siteContent.hero.title)}
              </span>
            </Link>
            {isAdmin && (
              <button 
                onClick={() => setIsEditingLogo(true)}
                className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 bg-cyber-red text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit size={12} />
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-8">
              {Object.entries(siteContent.nav).map(([key, value]) => {
                const label = t(value as { en: string; zh: string });
                
                // Handle special routes
                if (key === 'products') {
                  return (
                    <Link 
                      key={key} 
                      to="/products"
                      className="font-display text-xs uppercase tracking-widest text-white/70 hover:text-cyber-red transition-colors"
                    >
                      {label}
                    </Link>
                  );
                }
                if (key === 'globalAgents') {
                  return (
                    <Link 
                      key={key} 
                      to="/global-agents"
                      className="font-display text-xs uppercase tracking-widest text-white/70 hover:text-cyber-red transition-colors"
                    >
                      {label}
                    </Link>
                  );
                }
                
                // Handle homepage sections (home, about, news, contact)
                const routeMap: Record<string, string> = {
                  home: '/',
                  products: '/products',
                  about: '/about',
                  news: '/news',
                  globalAgents: '/global-agents'
                };

                return (
                  <Link 
                    key={key} 
                    to={routeMap[key] || `/#${key}`}
                    className="font-display text-xs uppercase tracking-widest text-white/70 hover:text-cyber-red transition-colors"
                    onClick={(e) => {
                      if (key === 'contact') {
                        if (location.pathname === '/') {
                          e.preventDefault();
                          const element = document.getElementById('contact');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        } else {
                          sessionStorage.setItem('scrollToContact', 'true');
                        }
                      } else if (location.pathname === '/' && key === 'home') {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            <div className="relative">
              <button 
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                onBlur={() => setTimeout(() => setIsLangDropdownOpen(false), 200)}
                className="flex items-center gap-2 text-xs font-display text-cyber-red border border-cyber-red/30 px-3 py-1 hover:bg-cyber-red/10 transition-colors"
              >
                <Globe size={14} />
                {languages.find(l => l.code === lang)?.short}
              </button>
              <AnimatePresence>
                {isLangDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 bg-cyber-gray border border-cyber-red/30 shadow-2xl min-w-[120px] z-50"
                  >
                    {languages.map(l => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l.code as Language);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-display uppercase tracking-widest hover:bg-cyber-red hover:text-white transition-colors ${lang === l.code ? 'text-cyber-red' : 'text-white/70'}`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {isAdmin && (
              <button 
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="text-cyber-yellow hover:text-white transition-colors"
              >
                <Settings size={18} />
              </button>
            )}

            {!user ? (
              <button onClick={handleLogin} className="text-white/50 hover:text-cyber-red transition-colors">
                <LogIn size={18} />
              </button>
            ) : (
              <button onClick={handleLogout} className="text-white/50 hover:text-cyber-red transition-colors">
                <LogOut size={18} />
              </button>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-3 ml-8 pl-8 border-l border-white/10">
            <div className="flex flex-col items-end mr-2">
              <span className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-mono">Style</span>
              <span className="text-[8px] uppercase tracking-[0.2em] text-cyber-red font-mono leading-none">Select</span>
            </div>
            <div className="flex gap-1.5">
              {[
                { id: 'red', color: 'bg-cyber-red', label: 'R-01' },
                { id: 'orange', color: 'bg-[#ff8c00]', label: 'O-02' },
                { id: 'blue', color: 'bg-[#06b6d4]', label: 'B-03' },
                { id: 'black', color: 'bg-white', label: 'D-04' }
              ].map((t) => (
                <button 
                  key={t.id}
                  onClick={() => updateTheme(t.id as any)}
                  className={`group relative w-10 h-6 transition-all duration-300 overflow-hidden ${siteContent.theme === t.id || (!siteContent.theme && t.id === 'red') ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                  title={`Cyber ${t.id}`}
                >
                  {/* Background with clip-path feel */}
                  <div className={`absolute inset-0 ${t.color} opacity-20 group-hover:opacity-30 transition-opacity`} style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)' }} />
                  {/* Bottom bar */}
                  <div className={`absolute bottom-0 left-0 h-[2px] transition-all duration-300 ${t.color} ${siteContent.theme === t.id || (!siteContent.theme && t.id === 'red') ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  {/* Label */}
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold tracking-tighter">
                    {t.label}
                  </span>
                  {/* Selection indicator dot */}
                  {(siteContent.theme === t.id || (!siteContent.theme && t.id === 'red')) && (
                    <div className={`absolute top-0 right-0 w-1 h-1 ${t.color} animate-pulse`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="md:hidden text-cyber-red"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Admin Panel Overlay */}
      <AnimatePresence>
        {showAdminPanel && isAdmin && (
          <motion.div 
            key="admin-panel"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-[70] bg-cyber-gray border border-cyber-yellow p-6 w-80 shadow-2xl"
          >
            <h3 className="font-display text-cyber-yellow mb-4 flex items-center gap-2">
              <Settings size={16} /> ADMIN CONTROL
            </h3>
            <div className="space-y-4">
              <button 
                onClick={() => { 
                  console.log('AdminPanel: Adding product...');
                  setIsAddingProduct(true); 
                  setShowAdminPanel(false); 
                }}
                className="w-full py-2 bg-cyber-yellow text-black text-xs uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Add New Product
              </button>
              <button 
                onClick={() => { setIsAddingNews(true); setShowAdminPanel(false); }}
                className="w-full py-2 bg-cyber-pink text-black text-xs uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Add New News
              </button>
              <button 
                onClick={() => { 
                  setSelectedHomepageIds(siteContent.homepageProducts?.ids || []);
                  setIsEditingHomepageProducts(true); 
                  setShowAdminPanel(false); 
                }}
                className="w-full py-2 bg-cyber-red text-white text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
              >
                <Layout size={14} /> Configure Homepage
              </button>
              <button 
                onClick={() => { setIsManagingAdmins(true); setShowAdminPanel(false); }}
                className="w-full py-2 bg-white text-black text-xs uppercase tracking-widest hover:bg-cyber-yellow transition-all flex items-center justify-center gap-2"
              >
                <Users size={14} /> Manage Admins
              </button>
              <button 
                onClick={seedDatabase}
                className="w-full py-2 border border-white/10 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Reset Database to Defaults
              </button>
              
              <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Site Theme (Global)</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => updateTheme('tron')}
                    className={`py-1 text-[10px] border font-display transition-all ${siteContent.theme === 'tron' || !siteContent.theme ? 'border-cyber-red text-cyber-red bg-cyber-red/10' : 'border-white/10 text-white/50 hover:border-white/30'}`}
                  >
                    TRON (CYAN)
                  </button>
                  <button 
                    onClick={() => updateTheme('red')}
                    className={`py-1 text-[10px] border font-display transition-all ${siteContent.theme === 'red' ? 'border-cyber-red text-cyber-red bg-cyber-red/10' : 'border-white/10 text-white/50 hover:border-white/30'}`}
                  >
                    RED-PURPLE
                  </button>
                  <button 
                    onClick={() => updateTheme('orange')}
                    className={`py-1 text-[10px] border font-display transition-all ${siteContent.theme === 'orange' ? 'border-cyber-red text-cyber-red bg-cyber-red/10' : 'border-white/10 text-white/50 hover:border-white/30'}`}
                  >
                    ORANGE
                  </button>
                  <button 
                    onClick={() => updateTheme('blue')}
                    className={`py-1 text-[10px] border font-display transition-all ${siteContent.theme === 'blue' ? 'border-cyber-red text-cyber-red bg-cyber-red/10' : 'border-white/10 text-white/50 hover:border-white/30'}`}
                  >
                    BLUE
                  </button>
                  <button 
                    onClick={() => updateTheme('black')}
                    className={`py-1 text-[10px] border font-display transition-all ${siteContent.theme === 'black' ? 'border-cyber-red text-cyber-red bg-cyber-red/10' : 'border-white/10 text-white/50 hover:border-white/30'}`}
                  >
                    BLACK
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-white/40 font-mono">
                Logged in as: {user?.email}
              </p>
              <button 
                onClick={() => setShowAdminPanel(false)}
                className="w-full py-2 text-xs text-white/50 hover:text-white"
              >
                Close Panel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            key="mobile-menu"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-30 bg-cyber-dark flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {Object.entries(siteContent.nav).map(([key, value]) => {
              const label = t(value as { en: string; zh: string });
              
              // Handle special routes
              if (key === 'products') {
                return (
                  <Link 
                    key={key} 
                    to="/products"
                    onClick={() => setIsMenuOpen(false)}
                    className="font-display text-2xl uppercase tracking-widest text-white hover:text-cyber-red"
                  >
                    {label}
                  </Link>
                );
              }
              if (key === 'globalAgents') {
                return (
                  <Link 
                    key={key} 
                    to="/global-agents"
                    onClick={() => setIsMenuOpen(false)}
                    className="font-display text-2xl uppercase tracking-widest text-white hover:text-cyber-red"
                  >
                    {label}
                  </Link>
                );
              }
              
              // Handle homepage sections (home, about, news, contact)
              const routeMap: Record<string, string> = {
                home: '/',
                products: '/products',
                about: '/about',
                news: '/news',
                globalAgents: '/global-agents'
              };

              return (
                <Link 
                  key={key} 
                  to={routeMap[key] || `/#${key}`}
                  className="font-display text-2xl uppercase tracking-widest text-white hover:text-cyber-red"
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    if (window.location.pathname === '/' && !routeMap[key] && key !== 'home') {
                      e.preventDefault();
                      const element = document.getElementById(key);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                >
                  {label}
                </Link>
              );
            })}
            <div className="flex flex-col items-center gap-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{lang === 'en' ? 'Select Language' : lang === 'zh' ? '选择语言' : '選擇語言'}</p>
              <div className="flex gap-4">
                {languages.map(l => (
                  <button 
                    key={l.code}
                    onClick={() => { setLang(l.code as Language); setIsMenuOpen(false); }}
                    className={`flex items-center gap-2 text-sm font-display border px-4 py-2 transition-all ${lang === l.code ? 'text-cyber-red border-cyber-red bg-cyber-red/10' : 'text-white/50 border-white/10'}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{lang === 'en' ? 'Select Theme' : '選擇主題'}</p>
              <div className="flex gap-4">
                {[
                  { id: 'red', color: 'bg-cyber-red', label: 'RED-01' },
                  { id: 'orange', color: 'bg-[#ff8c00]', label: 'ORANGE-02' },
                  { id: 'blue', color: 'bg-[#06b6d4]', label: 'BLUE-03' },
                  { id: 'black', color: 'bg-white', label: 'BLACK-04' }
                ].map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => { updateTheme(t.id as any); setIsMenuOpen(false); }}
                    className={`group relative w-20 h-10 transition-all duration-300 ${siteContent.theme === t.id || (!siteContent.theme && t.id === 'red') ? 'scale-110' : 'opacity-60'}`}
                  >
                    <div className={`absolute inset-0 ${t.color} opacity-10 border border-white/10`} style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }} />
                    <div className={`absolute bottom-0 left-0 h-0.5 ${t.color} transition-all duration-300 ${siteContent.theme === t.id || (!siteContent.theme && t.id === 'red') ? 'w-full' : 'w-0'}`} />
                    <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-display tracking-widest ${siteContent.theme === t.id || (!siteContent.theme && t.id === 'red') ? 'text-white' : 'text-white/50'}`}>
                      {t.label.split('-')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {isAdmin && (
              <button 
                onClick={() => { setShowAdminPanel(true); setIsMenuOpen(false); }}
                className="flex items-center gap-2 text-lg font-display text-cyber-yellow border border-cyber-yellow/30 px-6 py-2"
              >
                <Settings size={20} />
                ADMIN PANEL
              </button>
            )}

            {!user ? (
              <button onClick={() => { handleLogin(); setIsMenuOpen(false); }} className="text-white/50 hover:text-cyber-red flex items-center gap-2 text-lg font-display">
                <LogIn size={20} /> LOGIN
              </button>
            ) : (
              <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-white/50 hover:text-cyber-red flex items-center gap-2 text-lg font-display">
                <LogOut size={20} /> LOGOUT
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed top-0 left-0 right-0 z-0 pointer-events-none tron-grid" />
      <div className="fixed bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-cyber-red/20 to-transparent pointer-events-none z-0 blur-3xl" />

        <Routes>
          <Route path="/about" element={
            <AboutPage 
              siteContent={siteContent} 
              lang={lang} 
              t={t} 
              isAdmin={isAdmin}
              setIsEditingAbout={setIsEditingAbout}
            />
          } />
          <Route path="/news" element={
            <NewsPage 
              news={news} 
              lang={lang} 
              t={t} 
              isAdmin={isAdmin}
              setIsAddingNews={setIsAddingNews}
              setEditingNews={setEditingNews}
              deleteNews={deleteNews}
              siteContent={siteContent}
            />
          } />
          <Route path="/products" element={
            <ProductsPage 
              products={products} 
              lang={lang} 
              t={t} 
              formatPrice={formatPrice}
              isAdmin={isAdmin}
              setEditingProduct={setEditingProduct}
              deleteProduct={deleteProduct}
              setSelectedProduct={setSelectedProduct}
              setIsAddingProduct={setIsAddingProduct}
              siteContent={siteContent}
            />
          } />
          <Route path="/" element={
            <>
              {/* Hero Section */}
              <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden z-10">
        {/* Animated Grid Background - Removed in favor of global Tron grid */}
        <div className="absolute inset-0 z-0 opacity-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>
        
        {/* Decorative Floating Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-10 font-mono text-[10px] text-cyber-red vertical-text tracking-[0.5em] hidden lg:block"
          >
            SYSTEM_STATUS: OPTIMAL // CORE_TEMP: 32C // VOLTAGE: 220V
          </motion.div>
          <motion.div 
            animate={{ y: [0, 20, 0], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/4 right-10 font-mono text-[10px] text-cyber-red vertical-text tracking-[0.5em] hidden lg:block"
          >
            ZP_PROTOCOL_v4.2 // ENCRYPTION: ACTIVE // LINK: ESTABLISHED
          </motion.div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyber-red/5 rounded-full blur-[120px] -z-10" />
        </div>

        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cyber-red/30 mix-blend-overlay z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-cyber-dark/80 via-cyber-dark/40 to-cyber-dark z-20" />
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 2 }}
            src={siteContent.hero.image || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1920"} 
            alt="Hero"
            className="w-full h-full object-cover grayscale brightness-50"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1920";
            }}
          />
        </div>

        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-4 px-3 py-1 border border-cyber-red/30 bg-cyber-red/10 text-cyber-red text-[10px] font-mono tracking-[0.3em] uppercase light-trail">
              {t(siteContent.hero.tagline)}
            </div>
            <h1 
              className="text-7xl md:text-[12rem] font-black mb-2 leading-none tron-text"
              data-text={t(siteContent.hero.title)}
            >
              {t(siteContent.hero.title)}
            </h1>
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="h-px w-12 bg-cyber-red/50" />
              <p className="font-mono text-cyber-red text-sm md:text-xl tracking-[0.4em] uppercase cyber-glow-small">
                {t(siteContent.hero.subtitle)}
              </p>
              <div className="h-px w-12 bg-cyber-red/50" />
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/products" className="cyber-button text-lg px-12 py-5 group relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  {t(siteContent.hero.cta)} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <div className="flex gap-2">
                <Link to="/about" className="px-10 py-5 border border-white/10 text-white font-display text-sm uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2">
                  {t(siteContent.nav.about)} <Plus size={16} />
                </Link>
                {isAdmin && (
                  <button 
                    onClick={() => setIsEditingHero(true)}
                    className="p-5 border border-cyber-red/30 text-cyber-red hover:bg-cyber-red/10 transition-all flex items-center gap-2"
                    title="Edit Hero Section"
                  >
                    <Edit size={20} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hero Stats Bar */}
        <div className="absolute bottom-0 left-0 w-full z-20 border-t border-white/5 bg-cyber-dark/50 backdrop-blur-sm hidden lg:block">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center font-mono text-[10px] text-white/40 uppercase tracking-widest">
            <div className="flex gap-12">
              <div className="flex flex-col gap-1">
                <span className="text-cyber-red">Material</span>
                <span className="text-white/80">SUS304 STAINLESS</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-cyber-red">Process</span>
                <span className="text-white/80">LASER_CUT_PRECISION</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-cyber-red">Origin</span>
                <span className="text-white/80">SHANGHAI_CN</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-cyber-red animate-pulse rounded-full" />
              <span>LIVE_SERVER_STATUS: ONLINE</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 animate-bounce text-cyber-red/50 lg:bottom-20">
          <ChevronRight className="rotate-90" size={32} />
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-6xl mb-4">{t(siteContent.nav.products)}</h2>
              <div className="h-1 w-24 bg-cyber-red" />
            </div>
            {isAdmin && (
              <button 
                onClick={() => {
                  console.log('Homepage: Adding product...');
                  setIsAddingProduct(true);
                }}
                className="cyber-button flex items-center gap-2"
              >
                <Plus size={16} /> Add Product
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[...products]
              .sort((a, b) => {
                const dateA = a.createdAt || '1970-01-01T00:00:00.000Z';
                const dateB = b.createdAt || '1970-01-01T00:00:00.000Z';
                return dateB.localeCompare(dateA);
              })
              .filter(p => !siteContent.homepageProducts?.ids?.length || siteContent.homepageProducts.ids.includes(p.id))
              .slice(0, siteContent.homepageProducts?.limit || 6)
              .map((product) => (
              <motion.div 
                key={product.id}
                className="cyber-card group cursor-pointer relative"
                whileHover={{ y: -10 }}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="cyber-card-glow" />
                <TechCorner className="opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {isAdmin && (
                  <div className="absolute top-2 left-2 z-20 flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingProduct(product); }}
                      className="p-2 bg-black/50 text-cyber-yellow hover:bg-cyber-yellow hover:text-black transition-all"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteProduct(product.id); }}
                      className="p-2 bg-black/50 text-cyber-red hover:bg-cyber-red hover:text-white transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
                <div className="relative aspect-square mb-6 overflow-hidden hologram-effect">
                  <GlitchImage 
                    src={product.images?.[0] || 'https://picsum.photos/seed/product/800/800'} 
                    alt={t(product.name)}
                    className="w-full h-full"
                  />
                  <div className="absolute top-4 right-4 bg-cyber-red text-white px-3 py-1 font-display text-xs font-bold z-10">
                    {t(product.category)}
                  </div>
                  <div className="absolute bottom-2 left-2 font-mono text-[8px] text-white/40 uppercase tracking-widest z-10 bg-black/40 px-1">
                    ID: {product.id.substring(0, 8)}
                  </div>
                </div>
                <h3 className="text-xl mb-2 group-hover:text-cyber-red transition-colors">{t(product.name)}</h3>
                <p className="text-white/60 text-sm mb-6 line-clamp-2">{t(product.description)}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-baseline gap-2">
                    {product.salePrice ? (
                      <>
                        <span className="text-cyber-red font-display text-xl">{formatPrice(product.salePrice)}</span>
                        <span className="text-white/30 line-through text-sm">{formatPrice(product.price)}</span>
                      </>
                    ) : (
                      <span className="text-white font-display text-xl">{formatPrice(product.price)}</span>
                    )}
                  </div>
                  <button className="p-2 border border-white/10 hover:border-cyber-red hover:text-cyber-red transition-colors">
                    <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 bg-black relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            <div className="relative group">
              <h2 className="text-4xl md:text-6xl mb-8 flex items-center gap-4">
                {t(siteContent.nav.contact)}
                {isAdmin && (
                  <button 
                    onClick={() => setIsEditingContact(true)}
                    className="p-2 bg-cyber-red text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                  >
                    <Edit size={16} />
                  </button>
                )}
              </h2>
              <div className="space-y-8">
                <p className="text-xl text-white/80 leading-relaxed">
                  {siteContent.contactInfo ? t(siteContent.contactInfo) : (lang === 'en' ? 'Contact us for inquiries, partnerships, or support.' : '如有諮詢、合作或支持需求，請聯繫我們。')}
                </p>
                <div className="space-y-4">
                  <a href={`mailto:${siteContent.contact?.email || 'wesley723@163.com'}`} className="flex items-center gap-4 text-white/60 hover:text-white transition-colors">
                    <Mail className="text-cyber-red" size={20} />
                    <span>{siteContent.contact?.email || 'wesley723@163.com'}</span>
                  </a>
                  <a href={siteContent.contact?.website?.startsWith('http') ? siteContent.contact.website : `https://${siteContent.contact?.website || 'www.zeroplain.com'}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-white/60 hover:text-white transition-colors">
                    <Globe className="text-cyber-red" size={20} />
                    <span>{siteContent.contact?.website || 'www.zeroplain.com'}</span>
                  </a>
                </div>
                <div className="flex gap-6 pt-4">
                  <a href={siteContent.contact?.social?.facebook || '#'} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-cyber-red transition-colors"><Facebook size={24} /></a>
                  <a href={siteContent.contact?.social?.instagram || '#'} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-cyber-red transition-colors"><Instagram size={24} /></a>
                  <a href={siteContent.contact?.social?.youtube || '#'} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-cyber-red transition-colors"><Youtube size={24} /></a>
                </div>
              </div>
            </div>

            <div className="cyber-card p-8 bg-cyber-gray/20 relative z-10">
              <form id="contact-form" onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  country: formData.get('country'),
                  company: formData.get('company'),
                  email: formData.get('email'),
                  name: formData.get('name'),
                  phone: formData.get('phone'),
                  requirement: formData.get('requirement'),
                  remarks: formData.get('remarks')
                };
                
                try {
                  const response = await fetch('/api/inquiry', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                  });
                  
                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.message || errorData.error || `Server Error (${response.status})`;
                    throw new Error(errorMessage);
                  }
                  
                  const result = await response.json();
                  toast.success(lang === 'en' ? 'Inquiry sent successfully!' : '需求單已成功送出！');
                  (e.target as HTMLFormElement).reset();
                } catch (error: any) {
                  console.error('Inquiry error:', error);
                  toast.error(lang === 'en' ? `Failed to send: ${error.message}` : `需求單送出失敗：${error.message}`);
                }
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{lang === 'en' ? 'Country' : '國家'} *</label>
                    <select id="contact-country" name="country" required className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white outline-none focus:border-cyber-red">
                      <option value="">{lang === 'en' ? 'Select Country' : '選擇國家'}</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{lang === 'en' ? 'Company Name' : '公司名稱'}</label>
                    <input id="contact-company" name="company" className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white outline-none focus:border-cyber-red" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{lang === 'en' ? 'Contact Name' : '聯絡人姓名'} *</label>
                    <input id="contact-name" name="name" required className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white outline-none focus:border-cyber-red" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{lang === 'en' ? 'Email' : '信箱'} *</label>
                    <input id="contact-email" name="email" type="email" required className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white outline-none focus:border-cyber-red" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{lang === 'en' ? 'Phone' : '電話'} *</label>
                  <input id="contact-phone" name="phone" required className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white outline-none focus:border-cyber-red" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{lang === 'en' ? 'Requirement' : '需求'} *</label>
                  <select id="contact-requirement" name="requirement" required className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white outline-none focus:border-cyber-red">
                    <option value="">{lang === 'en' ? 'Select Requirement' : '選擇需求'}</option>
                    <option value="Interested in Agency">{lang === 'en' ? 'Interested in Agency' : '對產品代理有興趣'}</option>
                    <option value="Want to buy products">{lang === 'en' ? 'Want to buy products' : '想購買任何商品'}</option>
                    <option value="After-sales service">{lang === 'en' ? 'After-sales service' : '售後服務'}</option>
                    <option value="Cooperation/Promotion">{lang === 'en' ? 'Cooperation/Promotion' : '想合作宣傳'}</option>
                    <option value="Other">{lang === 'en' ? 'Other' : '其他'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{lang === 'en' ? 'Remarks' : '備註'}</label>
                  <textarea id="contact-remarks" name="remarks" className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white outline-none focus:border-cyber-red h-24" />
                </div>
                <button type="submit" className="cyber-button w-full py-4 font-display uppercase tracking-widest">
                  {lang === 'en' ? 'Submit Inquiry' : '提交需求'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
            </>
          } />
          <Route path="/global-agents" element={
            <section id="globalAgents" className="py-24 px-6 bg-black min-h-screen pt-32 relative z-10">
              <div className="max-w-7xl mx-auto">
                <div className="relative group mb-16">
                  <h2 className="text-4xl md:text-6xl mb-4 flex items-center gap-4">
                    {siteContent.globalAgents ? t(siteContent.globalAgents.title) : (lang === 'en' ? 'Global Agents' : '尋求全球代理')}
                    {isAdmin && (
                      <button 
                        onClick={() => setIsEditingGlobalAgents(true)}
                        className="p-2 bg-cyber-red text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                  </h2>
                  <div className="w-24 h-1 bg-cyber-red"></div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 mb-20">
                  <div className="cyber-card p-8 border-l-4 border-cyber-yellow bg-cyber-gray/10">
                    <h3 className="text-2xl font-display text-cyber-yellow mb-6 uppercase tracking-widest flex items-center gap-3">
                      <Plus size={20} /> {lang === 'en' ? 'Benefits' : '代理商好處'}
                    </h3>
                    <div className="text-white/80 leading-relaxed whitespace-pre-line text-lg">
                      {siteContent.globalAgents ? t(siteContent.globalAgents.benefits) : ''}
                    </div>
                  </div>

                  <div className="cyber-card p-8 border-l-4 border-cyber-red bg-cyber-gray/10">
                    <h3 className="text-2xl font-display text-cyber-red mb-6 uppercase tracking-widest flex items-center gap-3">
                      <Info size={20} /> {lang === 'en' ? 'Requirements' : '代理商要求'}
                    </h3>
                    <div className="text-white/80 leading-relaxed whitespace-pre-line text-lg">
                      {siteContent.globalAgents ? t(siteContent.globalAgents.requirements) : ''}
                    </div>
                  </div>
                </div>

                {/* Inquiry Form for Agents */}
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-12">
                    <h3 className="text-3xl font-display mb-4">{lang === 'en' ? 'Apply to be an Agent' : '申請成為代理商'}</h3>
                    <p className="text-white/50">{lang === 'en' ? 'Fill out the form below and our team will contact you shortly.' : '請填寫下方表單，我們的團隊將儘快與您聯繫。'}</p>
                  </div>
                  <div className="cyber-card p-8 bg-cyber-gray/20 relative z-10">
                    <form id="agent-form" onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const data = {
                        country: formData.get('country'),
                        company: formData.get('company'),
                        email: formData.get('email'),
                        name: formData.get('name'),
                        phone: formData.get('phone'),
                        requirement: 'Global Agent Application',
                        remarks: formData.get('remarks')
                      };
                      
                      try {
                        const response = await fetch('/api/inquiry', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(data),
                        });
                        
                        if (!response.ok) {
                          const errorData = await response.json().catch(() => ({}));
                          throw new Error(errorData.details || errorData.error || 'Failed to send');
                        }
                        toast.success(lang === 'en' ? 'Application sent!' : '申請已送出！');
                        (e.target as HTMLFormElement).reset();
                      } catch (error: any) {
                        toast.error(lang === 'en' ? `Failed to send: ${error.message}` : `送出失敗：${error.message}`);
                      }
                    }} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{lang === 'en' ? 'Country' : '國家'} *</label>
                          <select id="agent-country" name="country" required className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white outline-none focus:border-cyber-red">
                            <option value="">{lang === 'en' ? 'Select Country' : '選擇國家'}</option>
                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{lang === 'en' ? 'Company Name' : '公司名稱'}</label>
                          <input id="agent-company" name="company" className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white outline-none focus:border-cyber-red" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{lang === 'en' ? 'Contact Name' : '聯絡人姓名'} *</label>
                          <input id="agent-name" name="name" required className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white outline-none focus:border-cyber-red" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{lang === 'en' ? 'Email' : '信箱'} *</label>
                          <input id="agent-email" name="email" type="email" required className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white outline-none focus:border-cyber-red" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{lang === 'en' ? 'Phone' : '電話'} *</label>
                        <input id="agent-phone" name="phone" required className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white outline-none focus:border-cyber-red" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{lang === 'en' ? 'Remarks / Message' : '備註 / 訊息'}</label>
                        <textarea id="agent-remarks" name="remarks" className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white outline-none focus:border-cyber-red h-24" />
                      </div>
                      <button type="submit" className="cyber-button w-full py-4 font-display uppercase tracking-widest">
                        {lang === 'en' ? 'Send Application' : '發送申請'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          } />
        </Routes>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 bg-black/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            {siteContent.logo ? (
              <img 
                src={siteContent.logo} 
                alt="Logo" 
                className="h-8 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 border-2 border-cyber-red flex items-center justify-center font-display font-bold text-lg text-cyber-red">
                ZP
              </div>
            )}
            <span className="font-display font-bold text-xl tracking-tighter">
              {t(siteContent.hero.title)}
            </span>
          </div>
          <div className="text-white/30 text-[10px] uppercase tracking-[0.2em]">
            © 2026 ZERO PLAIN. ALL RIGHTS RESERVED. FORGED IN CHINA.
          </div>
          <ul className="flex gap-8 text-white/50 text-xs uppercase tracking-widest">
            {Object.entries(siteContent.nav).map(([key, value]) => {
              const label = t(value as { en: string; zh: string });
              if (key === 'globalAgents') {
                return (
                  <li key={key}>
                    <Link to="/global-agents" className="hover:text-cyber-red transition-colors">
                      {label}
                    </Link>
                  </li>
                );
              }
              return (
                <li key={key}>
                  <a href={`/#${key}`} className="hover:text-cyber-red transition-colors">
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            key="product-detail-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-cyber-dark/95 backdrop-blur-xl" onClick={() => setSelectedProduct(null)} />
            <motion.div 
              key={`product-detail-content-${selectedProduct.id}`}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-cyber-gray border border-cyber-red/30 w-full max-w-6xl max-h-[90vh] overflow-y-auto cyber-border"
            >
              <button 
                className="absolute top-6 right-6 text-white/50 hover:text-cyber-red z-10"
                onClick={() => setSelectedProduct(null)}
              >
                <X size={32} />
              </button>

              <div className="grid md:grid-cols-2 gap-12 p-8 md:p-12">
                <div className="space-y-6">
                  <div className="aspect-square overflow-hidden border border-white/10">
                    <img 
                      src={selectedColorIndex !== null && selectedProduct.colors?.[selectedColorIndex] 
                        ? (selectedProduct.colors[selectedColorIndex].images?.[0] || 'https://picsum.photos/seed/product/800/800')
                        : (selectedProduct.images?.[0] || 'https://picsum.photos/seed/product/800/800')} 
                      alt={t(selectedProduct.name)}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/product/800/800';
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {(selectedColorIndex !== null && selectedProduct.colors?.[selectedColorIndex] 
                      ? selectedProduct.colors[selectedColorIndex].images.slice(1) 
                      : selectedProduct.images.slice(1)).map((img, i) => (
                      <div key={i} className="aspect-square border border-white/10 overflow-hidden">
                        <img src={img} alt="Detail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                  {selectedProduct.youtubeId && (
                    <div className="aspect-video border border-white/10 bg-black flex items-center justify-center relative group">
                      <iframe 
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${selectedProduct.youtubeId}`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="text-cyber-red font-mono text-sm mb-4 tracking-widest uppercase">
                    {t(selectedProduct.category)}
                  </div>
                  <h2 className="text-4xl md:text-5xl mb-6">{t(selectedProduct.name)}</h2>
                  
                  {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-3">
                        {lang === 'en' ? 'Select Color' : '選擇顏色'}
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        <button 
                          onClick={() => setSelectedColorIndex(null)}
                          className={`px-4 py-2 text-xs border transition-all ${selectedColorIndex === null ? 'border-cyber-red text-cyber-red bg-cyber-red/10' : 'border-white/10 text-white/50 hover:border-white/30'}`}
                        >
                          {lang === 'en' ? 'Default' : '預設'}
                        </button>
                        {selectedProduct.colors.map((color, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setSelectedColorIndex(idx)}
                            className={`px-4 py-2 text-xs border transition-all ${selectedColorIndex === idx ? 'border-cyber-red text-cyber-red bg-cyber-red/10' : 'border-white/10 text-white/50 hover:border-white/30'}`}
                          >
                            {t(color.name)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-baseline gap-4 mb-8">
                    {selectedProduct.salePrice ? (
                      <>
                        <span className="text-cyber-red font-display text-4xl">{formatPrice(selectedProduct.salePrice)}</span>
                        <span className="text-white/30 line-through text-xl">{formatPrice(selectedProduct.price)}</span>
                      </>
                    ) : (
                      <span className="text-white font-display text-4xl">{formatPrice(selectedProduct.price)}</span>
                    )}
                  </div>

                  {/* Product Specs Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-8 border-y border-white/5 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-widest text-white/40">{lang === 'en' ? 'Weight' : '重量'}</span>
                      <span className="text-white font-mono">{selectedProduct.weight || '-'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-widest text-white/40">{lang === 'en' ? 'Type' : '類型'}</span>
                      <span className="text-white font-mono">{selectedProduct.type ? t(selectedProduct.type) : '-'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-widest text-white/40">{lang === 'en' ? 'Dimensions (mm)' : '尺寸(mm)'}</span>
                      <span className="text-white font-mono">{selectedProduct.dimensions || '-'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-widest text-white/40">{lang === 'en' ? 'Parts' : '零件數量'}</span>
                      <span className="text-white font-mono">{selectedProduct.parts || '-'}</span>
                    </div>
                  </div>
                  <div className="space-y-8 mb-12">
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-white/50 mb-4 flex items-center gap-2">
                        <Info size={14} /> {lang === 'en' ? 'Description' : '产品描述'}
                      </h4>
                      <p className="text-white/80 leading-relaxed">{t(selectedProduct.description)}</p>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-white/50 mb-4 flex items-center gap-2">
                        <ChevronRight size={14} /> {lang === 'en' ? 'Technical Details' : '技术详情'}
                      </h4>
                      <p className="text-white/60 text-sm leading-relaxed">{t(selectedProduct.details)}</p>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-4">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          setQuickInquiryProduct(selectedProduct);
                          setIsQuickInquiryModalOpen(true);
                        }}
                        className="cyber-button flex-1 flex items-center justify-center gap-3 py-4 text-center"
                      >
                        <Mail size={20} />
                        {lang === 'en' ? 'Quick Inquiry' : '快速諮詢'}
                      </button>

                      {isAdmin && (
                        <button 
                          onClick={() => {
                            setEditingProduct(selectedProduct);
                            setSelectedProduct(null);
                          }}
                          className="border border-cyber-yellow text-cyber-yellow hover:bg-cyber-yellow/10 px-6 py-4 flex items-center justify-center gap-2 transition-all"
                        >
                          <Edit size={20} />
                          {lang === 'en' ? 'Edit' : '編輯'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Inquiry Modal */}
      <AnimatePresence>
        {isQuickInquiryModalOpen && quickInquiryProduct && (
          <motion.div 
            key="quick-inquiry-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[11000] flex items-center justify-center p-6 bg-cyber-dark/95 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-cyber-gray border border-cyber-red p-8 w-full max-w-2xl relative overflow-hidden"
            >
              <TechCorner />
              <button 
                onClick={() => setIsQuickInquiryModalOpen(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-cyber-red transition-colors z-10"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <h3 className="text-2xl font-display text-cyber-red mb-2 uppercase tracking-widest flex items-center gap-3">
                  <Mail /> {lang === 'en' ? 'Quick Inquiry' : '快速諮詢'}
                </h3>
                <p className="text-white/40 text-xs font-mono uppercase tracking-widest">
                  {lang === 'en' ? 'Product' : '產品'}: {t(quickInquiryProduct.name)}
                </p>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  country: formData.get('country'),
                  company: formData.get('company'),
                  email: formData.get('email'),
                  name: formData.get('name'),
                  phone: formData.get('phone'),
                  requirement: formData.get('requirement'),
                  remarks: formData.get('remarks')
                };
                
                try {
                  const response = await fetch('/api/inquiry', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                  });
                  
                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.message || errorData.error || `Server Error (${response.status})`;
                    throw new Error(errorMessage);
                  }
                  
                  toast.success(lang === 'en' ? 'Inquiry sent successfully!' : '需求單已成功送出！');
                  setIsQuickInquiryModalOpen(false);
                } catch (error: any) {
                  console.error('Inquiry error:', error);
                  toast.error(lang === 'en' ? `Failed to send: ${error.message}` : `需求單送出失敗：${error.message}`);
                }
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{lang === 'en' ? 'Country' : '國家'} *</label>
                    <select name="country" required className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white outline-none focus:border-cyber-red">
                      <option value="">{lang === 'en' ? 'Select Country' : '選擇國家'}</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{lang === 'en' ? 'Company Name' : '公司名稱'}</label>
                    <input name="company" className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white outline-none focus:border-cyber-red" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{lang === 'en' ? 'Contact Name' : '聯絡人姓名'} *</label>
                    <input name="name" defaultValue={user?.displayName || ''} required className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white outline-none focus:border-cyber-red" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{lang === 'en' ? 'Email' : '信箱'} *</label>
                    <input name="email" type="email" defaultValue={user?.email || ''} required className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white outline-none focus:border-cyber-red" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{lang === 'en' ? 'Phone' : '電話'} *</label>
                  <input name="phone" required className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white outline-none focus:border-cyber-red" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{lang === 'en' ? 'Requirement' : '需求'} *</label>
                  <input 
                    name="requirement" 
                    readOnly 
                    value={lang === 'en' ? `Interested in ${t(quickInquiryProduct.name)}` : `對 ${t(quickInquiryProduct.name)} 有興趣`}
                    className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white/60 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{lang === 'en' ? 'Remarks' : '備註'}</label>
                  <textarea name="remarks" className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white outline-none focus:border-cyber-red h-24" />
                </div>
                
                <div className="pt-4 flex flex-col gap-2">
                  <button type="submit" className="cyber-button w-full py-4 font-display uppercase tracking-widest">
                    {lang === 'en' ? 'Submit Inquiry' : '提交需求'}
                  </button>
                  <p className="text-[9px] text-white/30 text-center uppercase tracking-widest">
                    {lang === 'en' ? 'Your inquiry will be sent to our sales team at wesley723@163.com' : '您的需求將發送至我們的銷售團隊 wesley723@163.com'}
                  </p>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Management Modal */}
      <AnimatePresence>
        {isManagingAdmins && (
          <motion.div 
            key="admin-management-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-cyber-dark/95 backdrop-blur-md"
          >
            <div className="bg-cyber-gray border border-cyber-yellow p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-display text-cyber-yellow flex items-center gap-3">
                  <Users /> MANAGE ADMINISTRATORS
                </h3>
                <button onClick={() => setIsManagingAdmins(false)} className="text-white/50 hover:text-white transition-colors"><X /></button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-white/70 mb-6">
                  {lang === 'en' 
                    ? 'Admins can edit products, news, and site configuration. Use caution when granting admin access.' 
                    : '管理員可以編輯產品、新聞和網站配置。授予管理員權限時請謹慎。'}
                </p>
                
                <div className="border border-white/10 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-cyber-yellow uppercase text-[10px] tracking-widest">
                      <tr>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {allUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono text-xs">{u.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 text-[10px] uppercase tracking-tighter rounded ${u.role === 'admin' ? 'bg-cyber-yellow text-black' : 'bg-white/10 text-white/50'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {u.email !== user?.email && (
                              <button 
                                onClick={() => toggleUserRole(u.id, u.role)}
                                className="text-[10px] uppercase tracking-widest border border-white/20 px-3 py-1 hover:bg-white hover:text-black transition-all"
                              >
                                {u.role === 'admin' ? 'Demote' : 'Promote to Admin'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {allUsers.length === 0 && (
                  <div className="text-center py-12 text-white/30 italic">
                    No users found in database.
                  </div>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                <button 
                  onClick={() => setIsManagingAdmins(false)}
                  className="px-8 py-3 bg-cyber-yellow text-black font-display text-sm hover:bg-white transition-all"
                >
                  DONE
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Edit Modal */}
      <AnimatePresence>
        {(editingProduct || isAddingProduct) && (
          <motion.div 
            key={editingProduct ? `edit-${editingProduct.id}` : 'add-product'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-cyber-dark/95 backdrop-blur-md"
          >
            <div className="bg-cyber-gray border border-cyber-yellow p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-display text-cyber-yellow">
                  {isAddingProduct ? 'ADD NEW PRODUCT' : 'EDIT PRODUCT'}
                </h3>
                <button onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }}><X /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const manualImages = (formData.get('images') as string).split(',').map(s => s.trim()).filter(s => s !== '');
                
                const product: Product = {
                  id: (formData.get('id') as string) || (editingProduct?.id || `zp-${Date.now()}`),
                  name: { en: formData.get('name_en') as string, zh: formData.get('name_zh') as string },
                  description: { en: formData.get('desc_en') as string, zh: formData.get('desc_zh') as string },
                  details: { en: formData.get('details_en') as string, zh: formData.get('details_zh') as string },
                  price: Number(formData.get('price')),
                  images: manualImages.length > 0 ? manualImages : (editingProduct?.images || ['https://picsum.photos/seed/product/800/800']),
                  category: { en: formData.get('cat_en') as string, zh: formData.get('cat_zh') as string },
                  weight: formData.get('weight') as string,
                  type: { en: formData.get('type_en') as string, zh: formData.get('type_zh') as string },
                  dimensions: formData.get('dimensions') as string,
                  parts: formData.get('parts') ? Number(formData.get('parts')) : undefined,
                  createdAt: editingProduct?.createdAt || new Date().toISOString(),
                  colors: tempColors
                    .filter(c => c.name.en || c.name.zh || c.images.some(img => img.trim() !== ''))
                    .map(c => ({
                      ...c,
                      images: c.images.filter(img => img.trim() !== '')
                    }))
                };
                
                const salePrice = formData.get('salePrice');
                if (salePrice && salePrice !== '') product.salePrice = Number(salePrice);
                
                const youtubeId = formData.get('youtubeId') as string;
                if (youtubeId && youtubeId !== '') product.youtubeId = youtubeId;
                
                saveProduct(product, editingProduct?.id);
              }} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-2">ID</label>
                    <input name="id" defaultValue={editingProduct?.id} className="w-full bg-black/50 border border-white/10 p-2 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Category (EN/ZH)</label>
                    <div className="flex gap-2">
                      <input name="cat_en" defaultValue={editingProduct?.category.en} placeholder="EN" className="w-full bg-black/50 border border-white/10 p-2 text-sm" required />
                      <input name="cat_zh" defaultValue={editingProduct?.category.zh} placeholder="ZH" className="w-full bg-black/50 border border-white/10 p-2 text-sm" required />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Price</label>
                    <input name="price" type="number" defaultValue={editingProduct?.price} className="w-full bg-black/50 border border-white/10 p-2 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Sale Price (Optional)</label>
                    <input name="salePrice" type="number" defaultValue={editingProduct?.salePrice} className="w-full bg-black/50 border border-white/10 p-2 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Name (EN)</label>
                    <input name="name_en" defaultValue={editingProduct?.name.en} className="w-full bg-black/50 border border-white/10 p-2 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Name (ZH)</label>
                    <input name="name_zh" defaultValue={editingProduct?.name.zh} className="w-full bg-black/50 border border-white/10 p-2 text-sm" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Description (EN)</label>
                    <textarea name="desc_en" defaultValue={editingProduct?.description.en} className="w-full bg-black/50 border border-white/10 p-2 text-sm h-20" required />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Description (ZH)</label>
                    <textarea name="desc_zh" defaultValue={editingProduct?.description.zh} className="w-full bg-black/50 border border-white/10 p-2 text-sm h-20" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Details (EN)</label>
                    <textarea name="details_en" defaultValue={editingProduct?.details.en} className="w-full bg-black/50 border border-white/10 p-2 text-sm h-20" required />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Details (ZH)</label>
                    <textarea name="details_zh" defaultValue={editingProduct?.details.zh} className="w-full bg-black/50 border border-white/10 p-2 text-sm h-20" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Weight</label>
                    <input name="weight" defaultValue={editingProduct?.weight} className="w-full bg-black/50 border border-white/10 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Type (EN/ZH)</label>
                    <div className="flex gap-2">
                      <input name="type_en" defaultValue={editingProduct?.type?.en} placeholder="EN" className="w-full bg-black/50 border border-white/10 p-2 text-sm" />
                      <input name="type_zh" defaultValue={editingProduct?.type?.zh} placeholder="ZH" className="w-full bg-black/50 border border-white/10 p-2 text-sm" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Dimensions (mm)</label>
                    <input name="dimensions" defaultValue={editingProduct?.dimensions} className="w-full bg-black/50 border border-white/10 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Parts Count</label>
                    <input name="parts" type="number" defaultValue={editingProduct?.parts} className="w-full bg-black/50 border border-white/10 p-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2">Image URLs (Comma separated)</label>
                  <textarea name="images" defaultValue={editingProduct?.images.join(', ')} placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" className="w-full bg-black/50 border border-white/10 p-2 text-sm h-24" />
                </div>

                <div className="border-t border-white/5 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs text-cyber-yellow uppercase tracking-widest">Color Variants</h4>
                    <button 
                      type="button"
                      onClick={() => setTempColors([...tempColors, { name: { en: '', zh: '' }, images: [''] }])}
                      className="text-[10px] bg-cyber-yellow/10 text-cyber-yellow border border-cyber-yellow/30 px-3 py-1 hover:bg-cyber-yellow hover:text-black transition-all flex items-center gap-1"
                    >
                      <Plus size={12} /> ADD COLOR
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {tempColors.map((color, index) => (
                      <div key={index} className="p-4 bg-black/30 border border-white/5 space-y-4 relative group">
                        <button 
                          type="button"
                          onClick={() => setTempColors(tempColors.filter((_, i) => i !== index))}
                          className="absolute top-2 right-2 text-white/20 hover:text-cyber-red transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase tracking-tighter text-white/30 mb-1">Color Name (EN)</label>
                            <input 
                              value={color.name.en}
                              onChange={(e) => {
                                const newColors = [...tempColors];
                                newColors[index] = {
                                  ...newColors[index],
                                  name: { ...newColors[index].name, en: e.target.value }
                                };
                                setTempColors(newColors);
                              }}
                              placeholder="e.g. Silver"
                              className="w-full bg-black/50 border border-white/10 p-2 text-xs outline-none focus:border-cyber-yellow"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-tighter text-white/30 mb-1">Color Name (ZH)</label>
                            <input 
                              value={color.name.zh}
                              onChange={(e) => {
                                const newColors = [...tempColors];
                                newColors[index] = {
                                  ...newColors[index],
                                  name: { ...newColors[index].name, zh: e.target.value }
                                };
                                setTempColors(newColors);
                              }}
                              placeholder="e.g. 銀色"
                              className="w-full bg-black/50 border border-white/10 p-2 text-xs outline-none focus:border-cyber-yellow"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-[10px] uppercase tracking-tighter text-white/30 mb-1">Color Image URLs (Comma separated)</label>
                          <textarea 
                            value={color.images.join(', ')}
                            onChange={(e) => {
                              const newColors = [...tempColors];
                              newColors[index] = {
                                ...newColors[index],
                                images: e.target.value.split(',').map(s => s.trim())
                              };
                              setTempColors(newColors);
                            }}
                            placeholder="https://example.com/color1.jpg, https://example.com/color2.jpg"
                            className="w-full bg-black/50 border border-white/10 p-2 text-xs h-16 outline-none focus:border-cyber-yellow"
                          />
                        </div>
                      </div>
                    ))}
                    {tempColors.length === 0 && (
                      <p className="text-[10px] text-white/20 text-center py-4 border border-dashed border-white/10">No color variants added</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="cyber-button flex-1 py-3">SAVE PRODUCT</button>
                  <button type="button" onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }} className="px-6 py-3 border border-white/10">CANCEL</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* News Edit Modal */}
      <AnimatePresence>
        {(editingNews || isAddingNews) && (
          <motion.div 
            key={editingNews ? `edit-${editingNews.id}` : 'add-news'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-cyber-dark/95 backdrop-blur-md"
          >
            <div className="bg-cyber-gray border border-cyber-pink p-8 w-full max-w-xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-display text-cyber-pink">
                  {isAddingNews ? 'ADD NEWS/EVENT' : 'EDIT NEWS/EVENT'}
                </h3>
                <button onClick={() => { setEditingNews(null); setIsAddingNews(false); }}><X /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const item: NewsItem = {
                  id: editingNews?.id || `news-${Date.now()}`,
                  date: formData.get('date') as string,
                  title: { en: formData.get('title_en') as string, zh: formData.get('title_zh') as string },
                  content: { en: formData.get('content_en') as string, zh: formData.get('content_zh') as string },
                  type: formData.get('type') as 'news' | 'event'
                };
                saveNews(item);
              }} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Date</label>
                    <input name="date" type="date" defaultValue={editingNews?.date || new Date().toISOString().split('T')[0]} className="w-full bg-black/50 border border-white/10 p-2 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Type</label>
                    <select name="type" defaultValue={editingNews?.type || 'news'} className="w-full bg-black/50 border border-white/10 p-2 text-sm">
                      <option value="news">News</option>
                      <option value="event">Event</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2">Title (EN)</label>
                  <input name="title_en" defaultValue={editingNews?.title.en} className="w-full bg-black/50 border border-white/10 p-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2">Title (ZH)</label>
                  <input name="title_zh" defaultValue={editingNews?.title.zh} className="w-full bg-black/50 border border-white/10 p-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2">Content (EN)</label>
                  <textarea name="content_en" defaultValue={editingNews?.content.en} className="w-full bg-black/50 border border-white/10 p-2 text-sm h-24" required />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2">Content (ZH)</label>
                  <textarea name="content_zh" defaultValue={editingNews?.content.zh} className="w-full bg-black/50 border border-white/10 p-2 text-sm h-24" required />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="w-full py-3 bg-cyber-pink text-black font-display uppercase tracking-widest hover:bg-white transition-all">SAVE ITEM</button>
                  <button type="button" onClick={() => { setEditingNews(null); setIsAddingNews(false); }} className="px-6 py-3 border border-white/10">CANCEL</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Edit Modal */}
      <AnimatePresence>
        {isEditingHero && (
          <motion.div 
            key={isEditingHero ? 'hero-edit' : 'hero-closed'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-cyber-dark/95 backdrop-blur-md"
          >
            <div className="bg-cyber-gray border border-cyber-red p-8 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-display text-cyber-red">EDIT HERO SECTION</h3>
                <button onClick={() => setIsEditingHero(false)}><X /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                saveHero({
                  tagline: { en: formData.get('tagline_en') as string, zh: formData.get('tagline_zh') as string },
                  title: { en: formData.get('title_en') as string, zh: formData.get('title_zh') as string },
                  subtitle: { en: formData.get('subtitle_en') as string, zh: formData.get('subtitle_zh') as string },
                  image: formData.get('image_url') as string
                });
              }} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Tagline (EN)</label>
                    <input name="tagline_en" defaultValue={siteContent.hero.tagline?.en || 'EST. 2025 // SHANGHAI_STUDIO'} className="w-full bg-black/50 border border-white/10 p-2 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Tagline (ZH)</label>
                    <input name="tagline_zh" defaultValue={siteContent.hero.tagline?.zh || 'EST. 2025 // 上海工作室'} className="w-full bg-black/50 border border-white/10 p-2 text-sm" required />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Title (EN)</label>
                    <input name="title_en" defaultValue={siteContent.hero.title.en} className="w-full bg-black/50 border border-white/10 p-2 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Title (ZH)</label>
                    <input name="title_zh" defaultValue={siteContent.hero.title.zh} className="w-full bg-black/50 border border-white/10 p-2 text-sm" required />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Subtitle (EN)</label>
                    <input name="subtitle_en" defaultValue={siteContent.hero.subtitle.en} className="w-full bg-black/50 border border-white/10 p-2 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Subtitle (ZH)</label>
                    <input name="subtitle_zh" defaultValue={siteContent.hero.subtitle.zh} className="w-full bg-black/50 border border-white/10 p-2 text-sm" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2">Background Image URL</label>
                  <input name="image_url" defaultValue={siteContent.hero.image} className="w-full bg-black/50 border border-white/10 p-2 text-sm" />
                </div>
                <button type="submit" className="w-full py-4 bg-cyber-red text-white font-display uppercase tracking-widest hover:bg-white hover:text-cyber-red transition-all">
                  Save Changes
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* About Edit Modal */}
      <AnimatePresence>
        {isEditingAbout && (
          <motion.div 
            key={isEditingAbout ? 'about-edit' : 'about-closed'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-cyber-dark/95 backdrop-blur-md"
          >
            <div className="bg-cyber-gray border border-cyber-red p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-display text-cyber-red">EDIT ABOUT US</h3>
                <button onClick={() => setIsEditingAbout(false)}><X /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                saveAbout({
                  title: { en: formData.get('title_en') as string, zh: formData.get('title_zh') as string },
                  content: { en: formData.get('content_en') as string, zh: formData.get('content_zh') as string },
                  image: formData.get('image_url') as string
                });
              }} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Title (EN)</label>
                    <input name="title_en" defaultValue={siteContent.about.title.en} className="w-full bg-black/50 border border-white/10 p-2 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-2">Title (ZH)</label>
                    <input name="title_zh" defaultValue={siteContent.about.title.zh} className="w-full bg-black/50 border border-white/10 p-2 text-sm" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2">Image URL (Optional)</label>
                  <input name="image_url" defaultValue={siteContent.about.image} className="w-full bg-black/50 border border-white/10 p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2">Content (EN)</label>
                  <textarea name="content_en" defaultValue={siteContent.about.content.en} className="w-full bg-black/50 border border-white/10 p-2 text-sm h-48" required />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2">Content (ZH)</label>
                  <textarea name="content_zh" defaultValue={siteContent.about.content.zh} className="w-full bg-black/50 border border-white/10 p-2 text-sm h-48" required />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="cyber-button flex-1 py-3">SAVE CHANGES</button>
                  <button type="button" onClick={() => setIsEditingAbout(false)} className="px-6 py-3 border border-white/10">CANCEL</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Logo Edit Modal */}
      <AnimatePresence>
        {isEditingLogo && (
          <motion.div 
            key="logo-edit-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-cyber-dark/95 backdrop-blur-md"
          >
            <div className="bg-cyber-gray border border-cyber-red p-8 w-full max-w-md">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-display text-cyber-red uppercase tracking-widest">Edit Logo</h3>
                <button onClick={() => setIsEditingLogo(false)} className="text-white/50 hover:text-white"><X /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                saveLogo(formData.get('logo_url') as string);
              }} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Logo Image URL</label>
                  <input 
                    name="logo_url" 
                    defaultValue={siteContent.logo} 
                    placeholder="https://example.com/logo.png"
                    className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-cyber-red outline-none transition-colors" 
                  />
                  <p className="mt-2 text-[10px] text-white/30 uppercase tracking-wider">Leave empty to use default text logo (ZP)</p>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="cyber-button flex-1 py-3 font-display uppercase tracking-widest">Save Logo</button>
                  <button type="button" onClick={() => setIsEditingLogo(false)} className="flex-1 py-3 border border-white/10 text-white/50 font-display uppercase tracking-widest hover:bg-white/5 transition-all">Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Contact Edit Modal */}
      <AnimatePresence>
        {isEditingContact && (
          <motion.div 
            key="contact-edit-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-cyber-dark/95 backdrop-blur-md"
          >
            <div className="bg-cyber-gray border border-cyber-red p-8 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-display text-cyber-red uppercase tracking-widest">Edit Contact Info</h3>
                <button onClick={() => setIsEditingContact(false)} className="text-white/50 hover:text-white"><X /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                saveContact({
                  en: formData.get('contact_en') as string,
                  zh: formData.get('contact_zh') as string
                }, {
                  email: formData.get('contact_email') as string,
                  website: formData.get('contact_website') as string,
                  social: {
                    facebook: formData.get('social_fb') as string,
                    instagram: formData.get('social_ig') as string,
                    youtube: formData.get('social_yt') as string
                  }
                });
              }} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Contact Introduction (EN)</label>
                  <textarea 
                    name="contact_en" 
                    defaultValue={siteContent.contactInfo?.en} 
                    className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-cyber-red outline-none transition-colors h-24" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Contact Introduction (ZH)</label>
                  <textarea 
                    name="contact_zh" 
                    defaultValue={siteContent.contactInfo?.zh} 
                    className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-cyber-red outline-none transition-colors h-24" 
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Email</label>
                    <input 
                      name="contact_email" 
                      defaultValue={siteContent.contact?.email} 
                      className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-cyber-red outline-none transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Website</label>
                    <input 
                      name="contact_website" 
                      defaultValue={siteContent.contact?.website} 
                      className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-cyber-red outline-none transition-colors" 
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-xs uppercase tracking-widest text-white/50">Social Media Links</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1">Facebook</label>
                      <input 
                        name="social_fb" 
                        defaultValue={siteContent.contact?.social?.facebook} 
                        className="w-full bg-black/50 border border-white/10 p-2 text-white focus:border-cyber-red outline-none transition-colors text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1">Instagram</label>
                      <input 
                        name="social_ig" 
                        defaultValue={siteContent.contact?.social?.instagram} 
                        className="w-full bg-black/50 border border-white/10 p-2 text-white focus:border-cyber-red outline-none transition-colors text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1">YouTube</label>
                      <input 
                        name="social_yt" 
                        defaultValue={siteContent.contact?.social?.youtube} 
                        className="w-full bg-black/50 border border-white/10 p-2 text-white focus:border-cyber-red outline-none transition-colors text-sm" 
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="cyber-button flex-1 py-3 font-display uppercase tracking-widest">Save Changes</button>
                  <button type="button" onClick={() => setIsEditingContact(false)} className="flex-1 py-3 border border-white/10 text-white/50 font-display uppercase tracking-widest hover:bg-white/5 transition-all">Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Global Agents Edit Modal */}
      <AnimatePresence>
        {isEditingGlobalAgents && (
          <motion.div 
            key={isEditingGlobalAgents ? 'global-agents-edit' : 'global-agents-closed'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-cyber-dark/95 backdrop-blur-md"
          >
            <div className="bg-cyber-gray border border-cyber-red p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-display text-cyber-red uppercase tracking-widest">Edit Global Agents</h3>
                <button onClick={() => setIsEditingGlobalAgents(false)} className="text-white/50 hover:text-white"><X /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                saveGlobalAgents({
                  title: { en: formData.get('title_en') as string, zh: formData.get('title_zh') as string },
                  benefits: { en: formData.get('benefits_en') as string, zh: formData.get('benefits_zh') as string },
                  requirements: { en: formData.get('requirements_en') as string, zh: formData.get('requirements_zh') as string }
                });
              }} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Title (EN)</label>
                    <input name="title_en" defaultValue={siteContent.globalAgents?.title.en} className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-cyber-red outline-none transition-colors" required />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Title (ZH)</label>
                    <input name="title_zh" defaultValue={siteContent.globalAgents?.title.zh} className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-cyber-red outline-none transition-colors" required />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Benefits (EN)</label>
                    <textarea name="benefits_en" defaultValue={siteContent.globalAgents?.benefits.en} className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-cyber-red outline-none transition-colors h-32" required />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Benefits (ZH)</label>
                    <textarea name="benefits_zh" defaultValue={siteContent.globalAgents?.benefits.zh} className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-cyber-red outline-none transition-colors h-32" required />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Requirements (EN)</label>
                    <textarea name="requirements_en" defaultValue={siteContent.globalAgents?.requirements.en} className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-cyber-red outline-none transition-colors h-32" required />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Requirements (ZH)</label>
                    <textarea name="requirements_zh" defaultValue={siteContent.globalAgents?.requirements.zh} className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-cyber-red outline-none transition-colors h-32" required />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="cyber-button flex-1 py-3 font-display uppercase tracking-widest">Save Changes</button>
                  <button type="button" onClick={() => setIsEditingGlobalAgents(false)} className="flex-1 py-3 border border-white/10 text-white/50 font-display uppercase tracking-widest hover:bg-white/5 transition-all">Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Homepage Products Edit Modal */}
      <AnimatePresence>
        {isEditingHomepageProducts && (
          <motion.div 
            key={isEditingHomepageProducts ? 'homepage-products-edit' : 'homepage-products-closed'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-cyber-dark/95 backdrop-blur-md"
          >
            <div className="bg-cyber-gray border border-cyber-red p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-display text-cyber-red uppercase tracking-widest">Configure Homepage Products</h3>
                <button onClick={() => setIsEditingHomepageProducts(false)} className="text-white/50 hover:text-white"><X /></button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const limit = parseInt(formData.get('limit') as string) || 6;
                saveHomepageProducts(selectedHomepageIds, limit);
              }} className="space-y-8">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-black/30 border border-white/5">
                  <div className="flex items-center gap-4">
                    <label className="text-xs uppercase tracking-widest text-white/50">Display Limit:</label>
                    <input 
                      type="number" 
                      name="limit" 
                      defaultValue={siteContent.homepageProducts?.limit || 6} 
                      className="bg-black border border-white/10 p-2 text-white w-20 outline-none focus:border-cyber-red"
                    />
                    <span className="text-[10px] text-white/30 uppercase tracking-tighter">(Max products on homepage)</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setSelectedHomepageIds(products.map(p => p.id))}
                      className="text-[10px] uppercase tracking-widest text-cyber-yellow hover:text-white transition-colors"
                    >
                      Select All
                    </button>
                    <span className="text-white/20">|</span>
                    <button 
                      type="button"
                      onClick={() => setSelectedHomepageIds([])}
                      className="text-[10px] uppercase tracking-widest text-cyber-red hover:text-white transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {[...products]
                    .sort((a, b) => {
                      const dateA = a.createdAt || '1970-01-01T00:00:00.000Z';
                      const dateB = b.createdAt || '1970-01-01T00:00:00.000Z';
                      return dateB.localeCompare(dateA);
                    })
                    .map(product => {
                    const isSelected = selectedHomepageIds.includes(product.id);
                    return (
                      <label key={product.id} className={`relative cursor-pointer group border transition-all ${isSelected ? 'border-cyber-red bg-cyber-red/5' : 'border-white/10 hover:border-white/30'}`}>
                        <input 
                          type="checkbox" 
                          value={product.id} 
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedHomepageIds([...selectedHomepageIds, product.id]);
                            } else {
                              setSelectedHomepageIds(selectedHomepageIds.filter(id => id !== product.id));
                            }
                          }}
                          className="hidden"
                        />
                        <div className="aspect-square overflow-hidden">
                          <img 
                            src={product.images[0]} 
                            alt={t(product.name)} 
                            className="w-full h-full object-cover transition-all group-hover:scale-110" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-2 text-center">
                          <p className={`text-[10px] uppercase tracking-tighter truncate ${isSelected ? 'text-cyber-red' : 'text-white/70'}`}>{t(product.name)}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-cyber-red text-white p-0.5">
                            <Check size={12} />
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/10">
                  <button type="submit" className="cyber-button flex-1 py-4 font-display uppercase tracking-widest">Save Configuration</button>
                  <button type="button" onClick={() => setIsEditingHomepageProducts(false)} className="flex-1 py-4 border border-white/10 text-white/50 font-display uppercase tracking-widest hover:bg-white/5 transition-all">Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
