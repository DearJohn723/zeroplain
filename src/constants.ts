import { Product, NewsItem, SiteContent } from './types';

export const SITE_CONTENT: SiteContent = {
  nav: {
    home: { en: 'Home', zh: '首页' },
    products: { en: 'Products', zh: '产品展示' },
    about: { en: 'About Us', zh: '公司简介' },
    news: { en: 'News & Events', zh: '最新动态' },
    contact: { en: 'Contact', zh: '联系我们' },
    globalAgents: { en: 'Global Agents', zh: '寻求全球代理' },
  },
  hero: {
    tagline: { en: 'EST. 2025 // SHANGHAI_STUDIO', zh: 'EST. 2025 // 上海工作室' },
    title: { en: 'ZERO PLAIN', zh: '龍零' },
    subtitle: { 
      en: 'War Ram Edition: Precision Stainless Steel. Cyberpunk Soul.', 
      zh: '战羯版本：精密不锈钢，赛博灵魂。' 
    },
    cta: { en: 'Explore Collection', zh: '探索系列' },
    image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1920'
  },
  globalAgents: {
    title: { en: 'ZeroPlain Agent Benefits & Requirements', zh: '龙零代理商的好处与要求' },
    benefits: {
      en: '• Lowest wholesale prices\n• Priority shipping and fastest delivery\n• Full marketing material support (HD photos, videos)\n• Exclusive regional protection',
      zh: '• 获得最低批发价格\n• 优先发货，最快拿到货\n• 全方位行銷素材支援（高清圖片、影片）\n• 獨家區域保護'
    },
    requirements: {
      en: '• Minimum 200 units per order\n• Full payment in advance\n• Commitment to brand identity and quality standards',
      zh: '• 每次叫貨至少 200 件以上\n• 需先支付全額款項\n• 承諾維護品牌形象與品質標準'
    }
  },
  about: {
    title: { en: 'Forging the Future', zh: '锻造未来' },
    content: {
      en: 'Zero Plain is a premier design and manufacturing studio based in China, specializing in high-end stainless steel model toys. We combine traditional craftsmanship with futuristic cyberpunk aesthetics to create unique, durable, and intricate collectibles for enthusiasts worldwide.',
      zh: '龍零是一家总部位于中国的高端不锈钢模型玩具设计制作公司。我们将传统工艺与未来主义的赛博朋克美学相结合，为全球爱好者打造独特、耐用且精致的收藏品。'
    }
  },
  logo: '',
  contactInfo: {
    en: 'Zero Plain is dedicated to providing high-quality stainless steel models and exceptional customer service. Contact us for inquiries, partnerships, or support.',
    zh: '龍零致力于提供高质量的不锈钢模型和卓越的客户服务。如有咨询、合作或支持需求，请联系我们。'
  },
  contact: {
    email: 'wesley723@163.com',
    website: 'www.zeroplain.com',
    social: {
      facebook: '#',
      instagram: '#',
      youtube: '#'
    }
  },
  homepageProducts: {
    ids: [],
    limit: 6
  },
  theme: 'red'
};

export const PRODUCTS: Product[] = [
  {
    id: 'zp-01',
    name: { en: 'Mantis (Bronze)', zh: '螳螂 (古铜)' },
    description: { en: 'Precision stainless steel mantis model.', zh: '精密不锈钢螳螂模型。' },
    details: { en: 'Bronze finish, gift box packaging.', zh: '古铜色涂装，礼盒包装。' },
    price: 459,
    images: ['https://picsum.photos/seed/mantis/800/800'],
    category: { en: 'Insect Series', zh: '昆虫系列' },
    weight: '133g',
    type: { en: 'Bronze', zh: '古铜' },
    dimensions: '162*121*157',
    parts: 116,
    createdAt: '2026-03-01T12:00:00Z'
  },
  {
    id: 'zp-02',
    name: { en: 'Mantis (Blue)', zh: '蓝螳螂' },
    description: { en: 'Vibrant blue metallic mantis model.', zh: '鲜艳的蓝色金属螳螂模型。' },
    details: { en: 'Blue metallic finish, gift box packaging.', zh: '蓝色金属涂装，礼盒包装。' },
    price: 459,
    images: ['https://picsum.photos/seed/bluemantis/800/800'],
    category: { en: 'Insect Series', zh: '昆虫系列' },
    weight: '133g',
    type: { en: 'Blue', zh: '蓝色' },
    dimensions: '162*121*157',
    parts: 116,
    createdAt: '2026-03-01T12:00:00Z'
  },
  {
    id: 'zp-03',
    name: { en: 'Dragonfly (Black)', zh: '蜻蜓 (黑色)' },
    description: { en: 'Sleek black stainless steel dragonfly.', zh: '干练的黑色不锈钢蜻蜓。' },
    details: { en: 'Black finish, gift box packaging.', zh: '黑色涂装，礼盒包装。' },
    price: 459,
    images: ['https://picsum.photos/seed/dragonfly/800/800'],
    category: { en: 'Insect Series', zh: '昆虫系列' },
    weight: '70g',
    type: { en: 'Black', zh: '黑色' },
    dimensions: '134*60*41',
    parts: 92,
    createdAt: '2026-03-01T12:00:00Z'
  },
  {
    id: 'zp-04',
    name: { en: 'Dragonfly (Original)', zh: '蜻蜓 (原色)' },
    description: { en: 'Classic stainless steel dragonfly model.', zh: '经典不锈钢原色蜻蜓模型。' },
    details: { en: 'Original steel finish, gift box packaging.', zh: '不锈钢原色，礼盒包装。' },
    price: 459,
    images: ['https://picsum.photos/seed/dragonfly2/800/800'],
    category: { en: 'Insect Series', zh: '昆虫系列' },
    weight: '70g',
    type: { en: 'Original', zh: '原色' },
    dimensions: '134*60*41',
    parts: 92,
    createdAt: '2026-03-01T12:00:00Z'
  },
  {
    id: 'zp-05',
    name: { en: 'Spider (Silver)', zh: '蜘蛛 (银色)' },
    description: { en: 'Detailed mechanical spider model.', zh: '精致的机械蜘蛛模型。' },
    details: { en: 'Silver finish, gift box packaging.', zh: '银色涂装，礼盒包装。' },
    price: 459,
    images: ['https://picsum.photos/seed/spider/800/800'],
    category: { en: 'Insect Series', zh: '昆虫系列' },
    weight: '117g',
    type: { en: 'Silver', zh: '银色' },
    dimensions: '170*103*55',
    parts: 108,
    createdAt: '2026-03-02T12:00:00Z'
  },
  {
    id: 'zp-06',
    name: { en: 'Spider (Black)', zh: '黑蜘蛛' },
    description: { en: 'Aggressive black mechanical spider.', zh: '酷炫的黑色机械蜘蛛。' },
    details: { en: 'Black finish, gift box packaging.', zh: '黑色涂装，礼盒包装。' },
    price: 459,
    images: ['https://picsum.photos/seed/blackspider/800/800'],
    category: { en: 'Insect Series', zh: '昆虫系列' },
    weight: '117g',
    type: { en: 'Black', zh: '黑色' },
    dimensions: '170*103*55',
    parts: 108,
    createdAt: '2026-03-02T12:00:00Z'
  },
  {
    id: 'zp-07',
    name: { en: 'Wasp (Original)', zh: '黄蜂 (原色)' },
    description: { en: 'Intricate mechanical wasp model.', zh: '复杂精密的机械黄蜂模型。' },
    details: { en: 'Original steel finish, gift box packaging.', zh: '不锈钢原色，礼盒包装。' },
    price: 459,
    images: ['https://picsum.photos/seed/wasp/800/800'],
    category: { en: 'Insect Series', zh: '昆虫系列' },
    weight: '82g',
    type: { en: 'Original', zh: '原色' },
    dimensions: '152*65*35',
    parts: 96,
    createdAt: '2026-03-03T12:00:00Z'
  },
  {
    id: 'zp-08',
    name: { en: 'Wasp (Black)', zh: '黑黄蜂' },
    description: { en: 'Stealth style mechanical wasp.', zh: '隐身风格的机械黄蜂。' },
    details: { en: 'Black finish, gift box packaging.', zh: '黑色涂装，礼盒包装。' },
    price: 459,
    images: ['https://picsum.photos/seed/blackwasp/800/800'],
    category: { en: 'Insect Series', zh: '昆虫系列' },
    weight: '82g',
    type: { en: 'Black', zh: '黑色' },
    dimensions: '152*65*35',
    parts: 96,
    createdAt: '2026-03-03T12:00:00Z'
  },
  {
    id: 'zp-09',
    name: { en: 'Ant (Silver)', zh: '蚂蚁 (银色)' },
    description: { en: 'Small but detailed mechanical ant.', zh: '小巧但细节丰富的机械蚂蚁。' },
    details: { en: 'Silver finish, gift box packaging.', zh: '银色涂装，礼盒包装。' },
    price: 459,
    images: ['https://picsum.photos/seed/ant/800/800'],
    category: { en: 'Insect Series', zh: '昆虫系列' },
    weight: '68g',
    type: { en: 'Silver', zh: '银色' },
    dimensions: '140*66*39',
    parts: 88,
    createdAt: '2026-03-04T12:00:00Z'
  },
  {
    id: 'zp-10',
    name: { en: 'Ant (Black)', zh: '黑蚂蚁' },
    description: { en: 'Minimalist black mechanical ant.', zh: '极简风格的黑色机械蚂蟻。' },
    details: { en: 'Black finish, gift box packaging.', zh: '黑色涂装，礼盒包装。' },
    price: 459,
    images: ['https://picsum.photos/seed/blackant/800/800'],
    category: { en: 'Insect Series', zh: '昆虫系列' },
    weight: '68g',
    type: { en: 'Black', zh: '黑色' },
    dimensions: '140*66*39',
    parts: 88,
    createdAt: '2026-03-04T12:00:00Z'
  },
  {
    id: 'zp-11',
    name: { en: 'Metal Scorpion', zh: '金属蝎' },
    description: { en: 'Multi-color mechanical scorpion.', zh: '多种金属色可选的机械蝎子。' },
    details: { en: 'Available in Blue, Green, Purple, Gold. Gift box.', zh: '蓝、绿、紫、金多色可选。礼盒装。' },
    price: 289,
    images: ['https://picsum.photos/seed/scorpion/800/800'],
    category: { en: 'Creature Series', zh: '生物系列' },
    weight: '217g',
    type: { en: 'Multi-color', zh: '多色' },
    dimensions: '110*48*95mm',
    parts: 185,
    createdAt: '2026-03-05T12:00:00Z'
  },
  {
    id: 'zp-12',
    name: { en: 'Trident Beetle', zh: '三叉戟甲虫' },
    description: { en: 'Powerful looking mechanical beetle.', zh: '充满力量感的机械甲虫。' },
    details: { en: 'Blue, Green, Purple finish. Gift box.', zh: '蓝、绿、紫涂装。礼盒装。' },
    price: 289,
    images: ['https://picsum.photos/seed/beetle/800/800'],
    category: { en: 'Insect Series', zh: '昆虫系列' },
    weight: '186g',
    type: { en: 'Blue/Green/Purple', zh: '蓝/绿/紫' },
    dimensions: '95*43*78mm',
    parts: 222,
    createdAt: '2026-03-25T08:27:47Z'
  },
  {
    id: 'zp-13',
    name: { en: 'Mechanical Cicada', zh: '机械蝉' },
    description: { en: 'Delicate mechanical cicada model.', zh: '精致小巧的机械蝉模型。' },
    details: { en: 'Blue, Green, Purple finish. Gift box.', zh: '蓝、绿、紫涂装。礼盒裝。' },
    price: 289,
    images: ['https://picsum.photos/seed/cicada/800/800'],
    category: { en: 'Insect Series', zh: '昆虫系列' },
    weight: '137g',
    type: { en: 'Blue/Green/Purple', zh: '蓝/绿/紫' },
    dimensions: '88*36*90mm',
    parts: 178,
    createdAt: '2026-03-25T08:27:47Z'
  },
  {
    id: 'zp-14',
    name: { en: 'Mechanical Grasshopper', zh: '机械蝗虫' },
    description: { en: 'Dynamic mechanical grasshopper.', zh: '充满动态感的机械蝗虫。' },
    details: { en: 'Blue, Green, Purple finish. Gift box.', zh: '蓝、绿、紫涂装。礼盒装。' },
    price: 289,
    images: ['https://picsum.photos/seed/grasshopper/800/800'],
    category: { en: 'Insect Series', zh: '昆虫系列' },
    weight: '166g',
    type: { en: 'Blue/Green/Purple', zh: '蓝/微/紫' },
    dimensions: '88*34*96mm',
    parts: 213,
    createdAt: '2026-03-25T08:27:47Z'
  },
  {
    id: 'zp-15',
    name: { en: 'Mechanical Firefly', zh: '机械萤火虫' },
    description: { en: 'Luminous mechanical firefly model.', zh: '发光的机械萤火虫模型。' },
    details: { en: 'Blue, Green, Purple finish. Gift box.', zh: '蓝、绿、紫涂装。礼盒装。' },
    price: 289,
    images: ['https://picsum.photos/seed/firefly/800/800'],
    category: { en: 'Insect Series', zh: '昆虫系列' },
    weight: '93g',
    type: { en: 'Blue/Green/Purple', zh: '蓝/绿/紫' },
    dimensions: '108*36*65mm',
    parts: 162,
    createdAt: '2026-03-25T08:27:47Z'
  },
  {
    id: 'zp-17',
    name: { en: 'Harley Motorcycle', zh: '哈雷摩托车' },
    description: { en: 'Classic Harley style mechanical model.', zh: '经典哈雷风格机械模型。' },
    details: { en: 'Silver and Black finish. Gift box.', zh: '经典银黑涂装。礼盒装。' },
    price: 419,
    images: ['https://picsum.photos/seed/harley/800/800'],
    category: { en: 'Vehicle Series', zh: '交通工具系列' },
    weight: '400g',
    type: { en: 'Silver/Black', zh: '银/黑' },
    dimensions: '180*110*170',
    parts: 416,
    createdAt: '2026-03-10T12:00:00Z'
  },
  {
    id: 'zp-18',
    name: { en: 'War God Motorcycle', zh: '战神摩托' },
    description: { en: 'Aggressive war god style motorcycle.', zh: '霸氣十足的戰神風格摩托。' },
    details: { en: 'Blue finish. Gift box.', zh: '蓝色涂装。礼盒装。' },
    price: 419,
    images: ['https://picsum.photos/seed/warmoto/800/800'],
    category: { en: 'Vehicle Series', zh: '交通工具系列' },
    weight: '300g',
    type: { en: 'Blue', zh: '蓝色' },
    dimensions: '180*110*170',
    parts: 416,
    createdAt: '2026-03-10T12:00:00Z'
  },
  {
    id: 'zp-19',
    name: { en: 'Cruiser Motorcycle', zh: '巡航摩托' },
    description: { en: 'Elegant cruiser style mechanical model.', zh: '优雅的巡航风格机械模型。' },
    details: { en: 'Original steel finish. Gift box.', zh: '原色涂装。礼盒装。' },
    price: 419,
    images: ['https://picsum.photos/seed/cruiser/800/800'],
    category: { en: 'Vehicle Series', zh: '交通工具系列' },
    weight: '300g',
    type: { en: 'Original', zh: '原色' },
    dimensions: '180*110*170',
    parts: 416
  },
  {
    id: 'zp-20',
    name: { en: 'Speedster Motorcycle', zh: '极速摩托' },
    description: { en: 'High-speed style mechanical motorcycle.', zh: '极速风格机械摩托。' },
    details: { en: 'Original steel finish. Gift box.', zh: '原色涂装。礼盒装。' },
    price: 419,
    images: ['https://picsum.photos/seed/speedmoto/800/800'],
    category: { en: 'Vehicle Series', zh: '交通工具系列' },
    weight: '300g',
    type: { en: 'Original', zh: '原色' },
    dimensions: '180*110*170',
    parts: 416,
    createdAt: '2026-03-10T12:00:00Z'
  },
  {
    id: 'zp-21',
    name: { en: 'Phantom Motorcycle', zh: '幻影摩托' },
    description: { en: 'Mysterious phantom style motorcycle.', zh: '神秘的幻影風格摩托。' },
    details: { en: 'Original steel finish. Gift box.', zh: '原色涂装。礼盒装。' },
    price: 419,
    images: ['https://picsum.photos/seed/phantom/800/800'],
    category: { en: 'Vehicle Series', zh: '交通工具系列' },
    weight: '300g',
    type: { en: 'Original', zh: '原色' },
    dimensions: '180*110*170',
    parts: 416,
    createdAt: '2026-03-10T12:00:00Z'
  },
  {
    id: 'zp-22',
    name: { en: 'Knight Motorcycle', zh: '骑士摩托' },
    description: { en: 'Noble knight style mechanical model.', zh: '高贵的骑士风格机械模型。' },
    details: { en: 'Blue finish. Gift box.', zh: '蓝色涂装。礼盒装。' },
    price: 419,
    images: ['https://picsum.photos/seed/knight/800/800'],
    category: { en: 'Vehicle Series', zh: '交通工具系列' },
    weight: '300g',
    type: { en: 'Blue', zh: '蓝色' },
    dimensions: '180*110*170',
    parts: 416,
    createdAt: '2026-03-10T12:00:00Z'
  },
  {
    id: 'zp-23',
    name: { en: 'Retro Motorcycle', zh: '复古摩托' },
    description: { en: 'Vintage style mechanical motorcycle.', zh: '复古风格机械摩托。' },
    details: { en: 'Original steel finish. Gift box.', zh: '原色涂装。礼盒装。' },
    price: 499,
    images: ['https://picsum.photos/seed/retro/800/800'],
    category: { en: 'Vehicle Series', zh: '交通工具系列' },
    weight: '350g',
    type: { en: 'Original', zh: '原色' },
    dimensions: '180*110*170',
    parts: 416,
    createdAt: '2026-03-10T12:00:00Z'
  },
  {
    id: 'zp-24',
    name: { en: 'Thunder Motorcycle', zh: '雷霆摩托' },
    description: { en: 'Powerful thunder style motorcycle.', zh: '充满力量的雷霆風格摩托。' },
    details: { en: 'Original steel finish. Gift box.', zh: '原色涂装。礼盒装。' },
    price: 529,
    images: ['https://picsum.photos/seed/thunder/800/800'],
    category: { en: 'Vehicle Series', zh: '交通工具系列' },
    weight: '300g',
    type: { en: 'Original', zh: '原色' },
    dimensions: '180*110*170',
    parts: 416,
    createdAt: '2026-03-10T12:00:00Z'
  },
  {
    id: 'zp-25',
    name: { en: 'Storm Motorcycle', zh: '风暴摩托' },
    description: { en: 'Dynamic storm style motorcycle.', zh: '动感十足的风暴風格摩托。' },
    details: { en: 'Original steel finish. Gift box.', zh: '原色涂装。礼盒装。' },
    price: 529,
    images: ['https://picsum.photos/seed/storm/800/800'],
    category: { en: 'Vehicle Series', zh: '交通工具系列' },
    weight: '300g',
    type: { en: 'Original', zh: '原色' },
    dimensions: '180*110*170',
    parts: 416,
    createdAt: '2026-03-10T12:00:00Z'
  },
  {
    id: 'zp-26',
    name: { en: 'Classic Motorcycle', zh: '经典摩托' },
    description: { en: 'Timeless classic mechanical model.', zh: '永恆經典的機械模型。' },
    details: { en: 'Original steel finish. Gift box.', zh: '原色涂装。礼盒装。' },
    price: 499,
    images: ['https://picsum.photos/seed/classic/800/800'],
    category: { en: 'Vehicle Series', zh: '交通工具系列' },
    weight: '300g',
    type: { en: 'Original', zh: '原色' },
    dimensions: '180*110*170',
    parts: 416,
    createdAt: '2026-03-10T12:00:00Z'
  },
  {
    id: 'zp-27',
    name: { en: 'Great White Shark', zh: '大白鲨' },
    description: { en: 'Majestic mechanical great white shark.', zh: '雄伟的机械大白鲨。' },
    details: { en: 'Original steel finish, gift box packaging.', zh: '原色涂装，礼盒包装。' },
    price: 839,
    images: ['https://picsum.photos/seed/shark/800/800'],
    category: { en: 'Marine Series', zh: '海洋系列' },
    weight: '600g',
    type: { en: 'Original', zh: '原色' },
    dimensions: '276*159*83mm',
    parts: 339,
    createdAt: '2026-03-10T12:00:00Z'
  },
  {
    id: 'zp-28',
    name: { en: 'Killer Whale', zh: '虎鲸' },
    description: { en: 'Powerful mechanical killer whale.', zh: '充满力量的机械虎鲸。' },
    details: { en: 'Original steel finish, gift box packaging.', zh: '原色涂装，礼盒包装。' },
    price: 839,
    images: ['https://picsum.photos/seed/orca/800/800'],
    category: { en: 'Marine Series', zh: '海洋系列' },
    weight: '600g',
    type: { en: 'Original', zh: '原色' },
    dimensions: '276*159*83mm',
    parts: 339,
    createdAt: '2026-03-10T12:00:00Z'
  },
  {
    id: 'zp-29',
    name: { en: 'Dolphin', zh: '海豚' },
    description: { en: 'Graceful mechanical dolphin model.', zh: '优雅的机械海豚模型。' },
    details: { en: 'Original steel finish, gift box packaging.', zh: '原色涂装，礼盒包装。' },
    price: 839,
    images: ['https://picsum.photos/seed/dolphin/800/800'],
    category: { en: 'Marine Series', zh: '海洋系列' },
    weight: '600g',
    type: { en: 'Original', zh: '原色' },
    dimensions: '276*159*83mm',
    parts: 339,
    createdAt: '2026-03-10T12:00:00Z'
  },
  {
    id: 'zp-30',
    name: { en: 'Mechanical Crab', zh: '机械螃蟹' },
    description: { en: 'Intricate mechanical crab model.', zh: '精致复杂的机械螃蟹模型。' },
    details: { en: 'Silver and Black finish, gift box packaging.', zh: '经典银黑涂装，礼盒包装。' },
    price: 209,
    images: ['https://picsum.photos/seed/crab/800/800'],
    category: { en: 'Marine Series', zh: '海洋系列' },
    weight: '200g',
    type: { en: 'Silver/Black', zh: '银/黑' },
    dimensions: '140*55*30mm',
    parts: 104,
    createdAt: '2026-03-25T08:27:47Z'
  },
  {
    id: 'zp-31',
    name: { en: 'Mechanical Orca', zh: '机械虎鲸 (小)' },
    description: { en: 'Compact mechanical orca model.', zh: '小巧的机械虎鲸模型。' },
    details: { en: 'Original steel finish, gift box packaging.', zh: '原色涂装，礼盒包装。' },
    price: 289,
    images: ['https://picsum.photos/seed/orca2/800/800'],
    category: { en: 'Marine Series', zh: '海洋系列' },
    weight: '129g',
    type: { en: 'Original', zh: '原色' },
    dimensions: '159*119*99mm',
    parts: 121,
    createdAt: '2026-03-25T08:27:47Z'
  },
  {
    id: 'zp-32',
    name: { en: 'Mechanical Dolphin', zh: '机械海豚 (小)' },
    description: { en: 'Compact mechanical dolphin model.', zh: '小巧的机械海豚模型。' },
    details: { en: 'Original steel finish, gift box packaging.', zh: '原色涂装，礼盒包装。' },
    price: 289,
    images: ['https://picsum.photos/seed/dolphin2/800/800'],
    category: { en: 'Marine Series', zh: '海洋系列' },
    weight: '133g',
    type: { en: 'Original', zh: '原色' },
    dimensions: '169*118*99mm',
    parts: 121,
    createdAt: '2026-03-25T08:27:47Z'
  },
  {
    id: 'zp-33',
    name: { en: 'Mechanical Penguin', zh: '机械企鹅' },
    description: { en: 'Cute mechanical penguin model.', zh: '可愛的機械企鵝模型。' },
    details: { en: 'Blue finish, gift box packaging.', zh: '蓝色涂装，礼盒包装。' },
    price: 289,
    images: ['https://picsum.photos/seed/penguin/800/800'],
    category: { en: 'Marine Series', zh: '海洋系列' },
    weight: '133g',
    type: { en: 'Blue', zh: '蓝色' },
    dimensions: '160*145*99mm',
    parts: 129,
    createdAt: '2026-03-25T08:27:47Z'
  },
  {
    id: 'zp-34',
    name: { en: 'Mechanical Hummingbird', zh: '机械蜂鸟' },
    description: { en: 'Tiny and delicate mechanical bird.', zh: '小巧精致的机械鸟。' },
    details: { en: 'Blue finish, gift box packaging.', zh: '蓝色涂装，礼盒包装。' },
    price: 99,
    images: ['https://picsum.photos/seed/hummingbird/800/800'],
    category: { en: 'Animal Series', zh: '动物系列' },
    weight: '30g',
    type: { en: 'Blue', zh: '蓝色' },
    dimensions: '58*42*72',
    parts: 23,
    createdAt: '2026-03-25T08:27:47Z'
  },
  {
    id: 'zp-35',
    name: { en: 'Tyrannosaurus Rex', zh: '霸王龙' },
    description: { en: 'Powerful mechanical T-Rex model.', zh: '充满力量的机械霸王龙模型。' },
    details: { en: 'Silver finish, gift box packaging.', zh: '银色涂装，礼盒包装。' },
    price: 399,
    images: ['https://picsum.photos/seed/trex/800/800'],
    category: { en: 'Animal Series', zh: '动物系列' },
    weight: '380g',
    type: { en: 'Silver', zh: '银色' },
    dimensions: '170*75*95mm',
    parts: 240,
    createdAt: '2026-03-25T08:27:47Z'
  },
  {
    id: 'zp-03-void-walker',
    name: { en: 'Void Walker Mech', zh: '虚空行者机甲' },
    description: { 
      en: 'Heavy-duty industrial style mech warrior.', 
      zh: '重型工业风格机甲战士。' 
    },
    details: {
      en: 'Fully articulated joints. Sandblasted matte finish. Standing at 15cm tall. Limited edition serial number engraved.',
      zh: '全身关节可动。喷砂磨砂饰面。身高 15 厘米。刻有限量版序列号。'
    },
    price: 450,
    images: [
      'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000'
    ],
    category: { en: 'Mech Series', zh: '机甲系列' },
    weight: '1.5kg',
    type: { en: 'Heavy Mech', zh: '重型机甲' },
    dimensions: '180 x 180 x 250 mm',
    parts: 210,
    createdAt: '2026-03-20T12:00:00Z'
  }
];

export const NEWS: NewsItem[] = [
  {
    id: 'news-2',
    date: '2026-03-25',
    title: { en: 'Official Launch: War Ram Edition', zh: '正式发布：战羯版本' },
    content: { 
      en: 'The highly anticipated War Ram stainless steel model is now available. Experience the peak of cyberpunk engineering.', 
      zh: '备受期待的战羯不锈钢模型现已上市。体验赛博工程的巅峰之作。' 
    },
    type: 'news'
  },
  {
    id: 'news-1',
    date: '2026-03-20',
    title: { en: 'New Release: Mechanical Narwhal', zh: '新品发布：机械独角鲸' },
    content: { 
      en: 'Our latest addition to the Marine Series is now available for pre-order.', 
      zh: '我们海洋系列的最新成员现已开放预订。' 
    },
    type: 'news'
  },
  {
    id: 'event-1',
    date: '2026-04-15',
    title: { en: 'Cyber Expo 2026', zh: '2026 赛博博览会' },
    content: { 
      en: 'Visit our booth at the Shanghai Cyber Expo to see our prototypes in person.', 
      zh: '欢迎莅临上海赛博博览会我们的展位，亲身体验我们的原型产品。' 
    },
    type: 'event'
  }
];

export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];
