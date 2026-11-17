export type CategoryId =
  | 'desks'
  | 'chairs'
  | 'keyboards'
  | 'lighting'
  | 'desk-essentials'
  | 'audio';

export interface Category {
  id: CategoryId;
  name: string;
  tagline: string;
  emoji: string;
}

export interface Review {
  author: string;
  rating: number;
  title: string;
  body: string;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  /** Price in cents. */
  price: number;
  /** Original price in cents, when the product is on sale. */
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  /** Starting inventory. Live inventory is tracked in the store state. */
  stock: number;
  featured?: boolean;
  /** ISO date the product was added to the catalog; used for "Newest" sort. */
  addedAt: string;
  emoji: string;
  /** Hue (0–360) for the generated product tile. */
  hue: number;
  summary: string;
  description: string;
  features: string[];
  reviews: Review[];
}

export const CATEGORIES: Category[] = [
  { id: 'desks', name: 'Desks', tagline: 'Sit, stand, and everything between', emoji: '🪵' },
  { id: 'chairs', name: 'Chairs', tagline: 'Support for the long sessions', emoji: '🪑' },
  { id: 'keyboards', name: 'Keyboards', tagline: 'Every keystroke, considered', emoji: '⌨️' },
  { id: 'lighting', name: 'Lighting', tagline: 'Warm light, sharp focus', emoji: '💡' },
  { id: 'desk-essentials', name: 'Desk essentials', tagline: 'The small things that matter', emoji: '🗂️' },
  { id: 'audio', name: 'Audio', tagline: 'Hear every detail', emoji: '🎧' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'oak-standing-desk',
    name: 'Oakline Standing Desk',
    category: 'desks',
    price: 64900,
    compareAtPrice: 72900,
    rating: 4.8,
    reviewCount: 312,
    stock: 8,
    featured: true,
    addedAt: '2026-09-02',
    emoji: '🪵',
    hue: 32,
    summary: 'Solid oak top on a whisper-quiet dual-motor frame.',
    description:
      'The Oakline pairs a 160 × 80 cm solid oak top with a dual-motor frame that moves from 62 to 127 cm in under 20 seconds. Four memory presets make switching between sitting and standing a single tap.',
    features: ['Solid oak top, 160 × 80 cm', 'Dual motors, 120 kg capacity', '4 memory presets', 'Anti-collision sensor'],
    reviews: [
      { author: 'Priya N.', rating: 5, title: 'Rock solid', body: 'No wobble even at full height. The oak is gorgeous.' },
      { author: 'Marcus T.', rating: 4, title: 'Great desk, heavy box', body: 'Assembly took an hour with two people. Worth it.' },
    ],
  },
  {
    id: 'compact-desk',
    name: 'Nook Compact Desk',
    category: 'desks',
    price: 28900,
    rating: 4.5,
    reviewCount: 148,
    stock: 15,
    addedAt: '2026-06-18',
    emoji: '🗄️',
    hue: 200,
    summary: 'A 100 cm desk built for small rooms and big ideas.',
    description:
      'Nook fits where other desks do not. A powder-coated steel frame, a birch ply top, and a hidden cable tray keep a small space tidy.',
    features: ['Birch ply top, 100 × 55 cm', 'Hidden cable tray', 'Adjustable feet', 'Tool-free assembly'],
    reviews: [{ author: 'Lena K.', rating: 5, title: 'Perfect for my flat', body: 'Fits under the window exactly.' }],
  },
  {
    id: 'walnut-corner-desk',
    name: 'Walnut Corner Desk',
    category: 'desks',
    price: 89900,
    rating: 4.6,
    reviewCount: 57,
    stock: 0,
    addedAt: '2026-10-21',
    emoji: '📐',
    hue: 18,
    summary: 'An L-shaped walnut workstation with room for three monitors.',
    description:
      'A generous L-shaped surface in American walnut veneer. Reversible so the return can sit on either side.',
    features: ['Walnut veneer', 'Reversible L-shape', 'Integrated grommets', 'Seats three monitors'],
    reviews: [],
  },
  {
    id: 'ergo-mesh-chair',
    name: 'Arc Ergonomic Mesh Chair',
    category: 'chairs',
    price: 42900,
    rating: 4.7,
    reviewCount: 521,
    stock: 12,
    featured: true,
    addedAt: '2026-05-11',
    emoji: '🪑',
    hue: 220,
    summary: 'Breathable mesh with adaptive lumbar support.',
    description:
      'Arc follows your spine as you move. 4D armrests, a synchro-tilt mechanism, and breathable mesh make it comfortable for a full working day.',
    features: ['Adaptive lumbar support', '4D armrests', 'Synchro-tilt with lock', '12-year warranty'],
    reviews: [
      { author: 'Jon P.', rating: 5, title: 'Back pain gone', body: 'Took a week to dial in, now I forget it is there.' },
      { author: 'Ama O.', rating: 4, title: 'Comfortable', body: 'Wish the headrest was included.' },
    ],
  },
  {
    id: 'task-stool',
    name: 'Perch Active Stool',
    category: 'chairs',
    price: 15900,
    rating: 4.2,
    reviewCount: 89,
    stock: 20,
    addedAt: '2026-08-30',
    emoji: '🍄',
    hue: 140,
    summary: 'A wobble stool for standing-desk days.',
    description: 'Perch tilts with you, keeping your core engaged when you are working at a raised desk.',
    features: ['Weighted rocking base', 'Height 60–85 cm', 'Wool felt seat'],
    reviews: [],
  },
  {
    id: 'mech-keyboard-75',
    name: 'Tactile 75 Mechanical Keyboard',
    category: 'keyboards',
    price: 18900,
    rating: 4.9,
    reviewCount: 744,
    stock: 25,
    featured: true,
    addedAt: '2026-10-05',
    emoji: '⌨️',
    hue: 268,
    summary: 'Gasket-mounted 75% board with hot-swap switches.',
    description:
      'An aluminium 75% keyboard with a gasket mount, pre-lubed tactile switches, and PBT keycaps. Wired, Bluetooth, or 2.4 GHz.',
    features: ['Gasket mount', 'Hot-swap sockets', 'Tri-mode connectivity', 'PBT double-shot keycaps'],
    reviews: [
      { author: 'Sam R.', rating: 5, title: 'The sound!', body: 'Deep, quiet thock. Best keyboard I have owned.' },
    ],
  },
  {
    id: 'low-profile-keyboard',
    name: 'Slim Low-Profile Keyboard',
    category: 'keyboards',
    price: 9900,
    rating: 4.4,
    reviewCount: 233,
    stock: 40,
    addedAt: '2026-03-14',
    emoji: '🎹',
    hue: 190,
    summary: 'Laptop-like feel with full-size layout.',
    description: 'Low-profile scissor keys, a full number pad, and three-device pairing.',
    features: ['Scissor switches', 'Full-size layout', 'Pairs with 3 devices', 'USB-C charging'],
    reviews: [],
  },
  {
    id: 'split-keyboard',
    name: 'Divide Split Keyboard',
    category: 'keyboards',
    price: 24900,
    rating: 4.6,
    reviewCount: 102,
    stock: 6,
    addedAt: '2026-11-01',
    emoji: '🧩',
    hue: 330,
    summary: 'Ergonomic split layout with tenting legs.',
    description: 'Two halves, adjustable tenting, and fully programmable layers.',
    features: ['Split layout', '3-angle tenting', 'Programmable layers', 'Magnetic connector'],
    reviews: [],
  },
  {
    id: 'monitor-light-bar',
    name: 'Halo Monitor Light Bar',
    category: 'lighting',
    price: 7900,
    rating: 4.7,
    reviewCount: 410,
    stock: 30,
    featured: true,
    addedAt: '2026-07-07',
    emoji: '💡',
    hue: 48,
    summary: 'Asymmetric light that never glares on your screen.',
    description: 'Halo clips onto your monitor and lights your desk without reflecting on the screen. Adjustable temperature from 2700 K to 6500 K.',
    features: ['No screen glare', '2700–6500 K', 'Wireless dial', 'Auto-dimming sensor'],
    reviews: [],
  },
  {
    id: 'desk-lamp',
    name: 'Pivot Desk Lamp',
    category: 'lighting',
    price: 12900,
    rating: 4.3,
    reviewCount: 76,
    stock: 18,
    addedAt: '2026-02-20',
    emoji: '🔦',
    hue: 12,
    summary: 'A counter-balanced arm in powder-coated steel.',
    description: 'Pivot holds any angle without springs, thanks to a counter-balanced arm.',
    features: ['Counter-balanced arm', 'Dimmable LED', 'Weighted base'],
    reviews: [],
  },
  {
    id: 'wool-desk-mat',
    name: 'Merino Wool Desk Mat',
    category: 'desk-essentials',
    price: 4900,
    rating: 4.6,
    reviewCount: 265,
    stock: 50,
    addedAt: '2026-04-02',
    emoji: '🧶',
    hue: 100,
    summary: 'A soft felt mat that quiets your keyboard.',
    description: 'Dense merino felt with a non-slip cork base, 90 × 40 cm.',
    features: ['Merino wool felt', 'Cork base', '90 × 40 cm'],
    reviews: [],
  },
  {
    id: 'monitor-stand',
    name: 'Riser Monitor Stand',
    category: 'desk-essentials',
    price: 8900,
    compareAtPrice: 10900,
    rating: 4.5,
    reviewCount: 188,
    stock: 22,
    featured: true,
    addedAt: '2026-06-01',
    emoji: '🖥️',
    hue: 210,
    summary: 'Lift your screen to eye level and free up desk space.',
    description: 'A bent-steel riser with a hidden drawer for cables and small items.',
    features: ['Holds up to 30 kg', 'Hidden drawer', 'Fits under most keyboards'],
    reviews: [],
  },
  {
    id: 'cable-kit',
    name: 'Tidy Cable Management Kit',
    category: 'desk-essentials',
    price: 2900,
    rating: 4.1,
    reviewCount: 340,
    stock: 80,
    addedAt: '2026-01-15',
    emoji: '🔌',
    hue: 160,
    summary: 'Everything you need to hide the cable spaghetti.',
    description: 'An under-desk tray, 10 reusable ties, adhesive clips, and a cable sleeve.',
    features: ['Under-desk tray', '10 reusable ties', '1.5 m sleeve'],
    reviews: [],
  },
  {
    id: 'laptop-stand',
    name: 'Fold Laptop Stand',
    category: 'desk-essentials',
    price: 5900,
    rating: 4.4,
    reviewCount: 129,
    stock: 3,
    addedAt: '2026-09-25',
    emoji: '💻',
    hue: 250,
    summary: 'Folds flat for travel, holds steady at your desk.',
    description: 'Six height settings in anodised aluminium. Folds to the size of a notebook.',
    features: ['6 height settings', 'Folds flat', 'Anodised aluminium'],
    reviews: [],
  },
  {
    id: 'desk-organizer',
    name: 'Ash Desk Organizer',
    category: 'desk-essentials',
    price: 3900,
    rating: 4.0,
    reviewCount: 41,
    stock: 0,
    addedAt: '2026-10-30',
    emoji: '✏️',
    hue: 40,
    summary: 'Solid ash tray with a phone slot.',
    description: 'A slab of solid ash routed for pens, cards, and a phone at a readable angle.',
    features: ['Solid ash', 'Phone slot', 'Felt underside'],
    reviews: [],
  },
  {
    id: 'studio-headphones',
    name: 'Studio Closed-Back Headphones',
    category: 'audio',
    price: 21900,
    rating: 4.7,
    reviewCount: 389,
    stock: 14,
    featured: true,
    addedAt: '2026-08-12',
    emoji: '🎧',
    hue: 0,
    summary: 'Detailed sound with active noise cancelling.',
    description: 'Hybrid ANC, 40 mm drivers, and 40 hours of battery life.',
    features: ['Hybrid ANC', '40 h battery', 'Multipoint Bluetooth'],
    reviews: [],
  },
  {
    id: 'desk-speakers',
    name: 'Duo Desktop Speakers',
    category: 'audio',
    price: 16900,
    rating: 4.3,
    reviewCount: 95,
    stock: 9,
    addedAt: '2026-05-28',
    emoji: '🔊',
    hue: 290,
    summary: 'Compact bookshelf speakers for your desk.',
    description: 'A pair of powered speakers with USB-C audio, Bluetooth, and a front headphone jack.',
    features: ['USB-C audio', 'Bluetooth 5.3', 'Front headphone jack'],
    reviews: [],
  },
  {
    id: 'usb-mic',
    name: 'Clear USB Microphone',
    category: 'audio',
    price: 11900,
    rating: 4.5,
    reviewCount: 211,
    stock: 11,
    addedAt: '2026-11-08',
    emoji: '🎙️',
    hue: 175,
    summary: 'Broadcast-quality voice for every call.',
    description: 'A cardioid condenser mic with a built-in pop filter and zero-latency monitoring.',
    features: ['Cardioid pattern', 'Built-in pop filter', 'Mute button with LED'],
    reviews: [],
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
