import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api'

const departments = ['All departments', 'Fashion', 'Accessories', 'Home', 'Tech']

const ratingFilters = [
  { id: 'all', label: 'All ratings' },
  { id: '4.5', label: '4.5 & up' },
  { id: '4.0', label: '4.0 & up' },
]

const priceFilters = [
  { id: 'all', label: 'All prices' },
  { id: 'under-2000', label: 'Under ₹2,000' },
  { id: '2000-5000', label: '₹2,000 – ₹5,000' },
  { id: '5000-10000', label: '₹5,000 – ₹10,000' },
  { id: '10000-plus', label: '₹10,000 & above' },
]

const products = [
  {
    name: 'Form Knit Sweater',
    category: 'Fashion',
    price: 4599,
    rating: '4.9',
    reviews: 124,
    tag: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Arc Ceramic Set',
    category: 'Home',
    price: 2499,
    rating: '4.8',
    reviews: 86,
    tag: 'New arrival',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Cove Leather Tote',
    category: 'Accessories',
    price: 7999,
    rating: '4.9',
    reviews: 52,
    tag: 'Editor’s pick',
    image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Orbit Desk Speaker',
    category: 'Tech',
    price: 6499,
    rating: '4.7',
    reviews: 213,
    tag: 'Low stock',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Tempo Everyday Sneaker',
    category: 'Fashion',
    price: 3999,
    rating: '4.8',
    reviews: 72,
    tag: 'Most loved',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Terra Table Lamp',
    category: 'Home',
    price: 4999,
    rating: '4.6',
    reviews: 41,
    tag: 'Hand finished',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Aster Mechanical Keyboard',
    category: 'Tech',
    price: 8999,
    rating: '4.9',
    reviews: 168,
    tag: 'Desk essential',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Dune Card Wallet',
    category: 'Accessories',
    price: 2999,
    rating: '4.8',
    reviews: 39,
    tag: 'New arrival',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Nova Smartwatch',
    category: 'Tech',
    price: 12999,
    rating: '4.7',
    reviews: 94,
    tag: 'New arrival',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Canvas Overshirt',
    category: 'Fashion',
    price: 3299,
    rating: '4.6',
    reviews: 57,
    tag: 'Everyday layer',
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Mono Desk Organizer',
    category: 'Home',
    price: 1899,
    rating: '4.5',
    reviews: 28,
    tag: 'Workspace pick',
    image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Pulse Wireless Headphones',
    category: 'Tech',
    price: 7499,
    rating: '4.8',
    reviews: 132,
    tag: 'Most loved',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'iPhone 15 Pro',
    category: 'Tech',
    price: 124999,
    rating: '4.8',
    reviews: 326,
    tag: 'Flagship pick',
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Tech',
    price: 109999,
    rating: '4.7',
    reviews: 281,
    tag: 'Top rated',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Nike Air Max 270',
    category: 'Fashion',
    price: 12999,
    rating: '4.8',
    reviews: 197,
    tag: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Adidas Ultraboost 5',
    category: 'Fashion',
    price: 15999,
    rating: '4.7',
    reviews: 143,
    tag: 'Running favorite',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Rolex Oyster Perpetual',
    category: 'Accessories',
    price: 685000,
    rating: '4.9',
    reviews: 38,
    tag: 'Luxury icon',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Sony Alpha Mirrorless Camera',
    category: 'Tech',
    price: 74999,
    rating: '4.8',
    reviews: 91,
    tag: 'Creator choice',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Ray-Ban Wayfarer Classic',
    category: 'Accessories',
    price: 12999,
    rating: '4.6',
    reviews: 76,
    tag: 'Classic design',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Herman Miller Sayl Chair',
    category: 'Home',
    price: 64999,
    rating: '4.7',
    reviews: 44,
    tag: 'Workspace upgrade',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=85',
  },
]

const catalogFallback = products.map((product, index) => ({
  ...product,
  quantity: [14, 8, 5, 3, 21, 11, 7, 16, 4, 18, 9, 12, 6, 10, 24, 13, 2, 7, 17, 5, 9, 15, 4, 12, 8, 6, 19, 11][index] ?? 10,
}))

const categoryCards = [
  { name: 'Fashion', count: '124 pieces', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85' },
  { name: 'Accessories', count: '68 pieces', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=85' },
  { name: 'Home', count: '88 pieces', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85' },
  { name: 'Tech', count: '96 pieces', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85' },
]

function Icon({ name, size = 20 }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21c.8-3.5 3.2-5.2 7-5.2s6.2 1.7 7 5.2" /></>,
    bag: <><path d="M5.5 8.5h13l.8 12H4.7l.8-12Z" /><path d="M9 9V6.5a3 3 0 0 1 6 0V9" /></>,
    heart: <path d="M20.8 8.7c0 5.2-8.8 10.4-8.8 10.4S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z" />,
    arrow: <><path d="M4 12h16" /><path d="m14 6 6 6-6 6" /></>,
    chevron: <path d="m7 9 5 5 5-5" />,
    menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
    close: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    filter: <><path d="M4 6h16" /><path d="M7 12h10" /><path d="M10 18h4" /></>,
    grid: <><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /></>,
    list: <><path d="M8 6h12" /><path d="M8 12h12" /><path d="M8 18h12" /><path d="M4 6h.01" /><path d="M4 12h.01" /><path d="M4 18h.01" /></>,
    truck: <><path d="M3 6h11v10H3z" /><path d="M14 10h3.5l3 3v3H14z" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></>,
    shield: <><path d="M12 3 19 6v5c0 4.3-2.4 7.7-7 10-4.6-2.3-7-5.7-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    support: <><path d="M4 13a8 8 0 0 1 16 0" /><path d="M4 13v3a2 2 0 0 0 2 2h1v-5H4Zm16 0v3a2 2 0 0 1-2 2h-1v-5h3Z" /><path d="M15 20h-3" /></>,
  }

  return <svg aria-hidden="true" className="icon" fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" viewBox="0 0 24 24" width={size}>{paths[name]}</svg>
}

const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
  currency: 'INR',
  maximumFractionDigits: 0,
  style: 'currency',
}).format(price)

const formatOrderNumber = (orderId) => `LUXE-${String(orderId).padStart(6, '0')}`

const formatOrderDate = (date) => new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(date))

const matchesPriceFilter = (price, filterId) => {
  if (filterId === 'under-2000') return price < 2000
  if (filterId === '2000-5000') return price >= 2000 && price <= 5000
  if (filterId === '5000-10000') return price > 5000 && price <= 10000
  if (filterId === '10000-plus') return price > 10000
  return true
}

const parseJsonValue = (value, fallback) => {
  if (!value) return fallback
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

const normalizeProduct = (product) => ({
  ...product,
  id: product.id || undefined,
  price: Number(product.price),
  quantity: Number(product.quantity ?? 0),
  rating: product.rating ? String(product.rating) : 'New',
  reviews: Number(product.reviews ?? 0),
  specifications: parseJsonValue(product.specifications, []),
  gallery: parseJsonValue(product.gallery, []),
})

function ProductCard({ product, onAdd, onView }) {
  const [liked, setLiked] = useState(false)
  const stockLabel = product.quantity === 0 ? 'Out of stock' : product.quantity <= 5 ? `Only ${product.quantity} left` : `${product.quantity} available`

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img alt={product.name} className="product-image" src={product.image} />
        <span className="product-tag">{product.tag}</span>
        <button className={`wishlist-button ${liked ? 'is-liked' : ''}`} onClick={() => setLiked(!liked)} type="button">
          <Icon name="heart" size={18} />
          <span className="sr-only">{liked ? 'Remove' : 'Add'} {product.name} {liked ? 'from' : 'to'} wishlist</span>
        </button>
        <button className="quick-add" onClick={() => onAdd(product)} type="button">Quick add <Icon name="arrow" size={16} /></button>
      </div>
      <div className="product-info">
        <div><h3>{product.name}</h3><p>{product.brand ? `${product.brand} · ` : ''}{product.category}</p></div>
        <strong>{formatPrice(product.price)}</strong>
      </div>
      <div className={`stock-status ${product.quantity <= 5 ? 'low-stock' : ''} ${product.quantity === 0 ? 'out-of-stock' : ''}`}>{stockLabel}</div>
      <div className="rating"><span className="star-row"><Icon name="star" size={13} /><Icon name="star" size={13} /><Icon name="star" size={13} /><Icon name="star" size={13} /><Icon name="star" size={13} /></span><b>{product.rating}</b><span className="rating-separator">·</span><span>{product.reviews} reviews</span></div>
      <button className="product-details-button" onClick={() => onView(product)} type="button">View details <Icon name="arrow" size={14} /></button>
    </article>
  )
}

function ProductDetailPanel({ product, catalog, onAdd, close }) {
  const gallery = Array.isArray(product.gallery) && product.gallery.length > 0 ? product.gallery : [product.image]
  const [selectedImage, setSelectedImage] = useState(gallery[0])
  const description = product.description || `${product.name} is a considered ${product.category.toLowerCase()} piece selected for everyday use.`
  const specifications = Array.isArray(product.specifications) && product.specifications.length > 0
    ? product.specifications
    : [
      { label: 'Brand', value: product.brand || 'LUXE' },
      { label: 'Department', value: product.category },
      { label: 'Availability', value: product.quantity > 0 ? `${product.quantity} available` : 'Out of stock' },
    ]
  const relatedProducts = catalog.filter((item) => item.category === product.category && item.id !== product.id && item.name !== product.name).slice(0, 3)

  return (
    <div className="product-detail-backdrop" onClick={close}>
      <section aria-label={`${product.name} details`} aria-modal="true" className="product-detail-panel" role="dialog" onClick={(event) => event.stopPropagation()}>
        <button className="icon-button product-detail-close" onClick={close} type="button"><Icon name="close" /><span className="sr-only">Close product details</span></button>
        <div className="product-detail-gallery"><img alt={product.name} src={selectedImage} />{gallery.length > 1 && <div>{gallery.map((image) => <button className={image === selectedImage ? 'active' : ''} key={image} onClick={() => setSelectedImage(image)} type="button"><img alt="" src={image} /></button>)}</div>}</div>
        <div className="product-detail-copy"><p className="eyebrow">{product.brand || 'LUXE'} · {product.category}</p><h2>{product.name}</h2><div className="product-detail-rating"><span className="star-row"><Icon name="star" size={14} /><Icon name="star" size={14} /><Icon name="star" size={14} /><Icon name="star" size={14} /><Icon name="star" size={14} /></span><strong>{product.rating}</strong><span>{product.reviews} reviews</span></div><strong className="product-detail-price">{formatPrice(product.price)}</strong><p className="product-detail-description">{description}</p><dl className="product-detail-specs">{specifications.map((specification) => <div key={specification.label}><dt>{specification.label}</dt><dd>{specification.value}</dd></div>)}</dl><button className="button button-dark" disabled={product.quantity === 0} onClick={() => onAdd(product)} type="button">{product.quantity === 0 ? 'Out of stock' : 'Add to bag'} <Icon name="arrow" size={17} /></button>{relatedProducts.length > 0 && <div className="related-products"><p className="eyebrow">You may also like</p><div>{relatedProducts.map((item) => <button key={item.id || item.name} onClick={() => onAdd(item)} type="button"><img alt={item.name} src={item.image} /><span>{item.name}</span><strong>{formatPrice(item.price)}</strong></button>)}</div></div>}</div>
      </section>
    </div>
  )
}

function AdminDashboard({
  catalog,
  adminOrders,
  adminOrdersLoading,
  adminOrdersNotice,
  refreshAdminOrders,
  markOrderSeen,
  analytics,
  analyticsLoading,
  analyticsNotice,
  refreshAnalytics,
  adminAction,
  setAdminAction,
  adminForm,
  updateAdminField,
  existingProductId,
  setExistingProductId,
  adminImagePreview,
  handleAdminImage,
  submitAdminProduct,
  adminNotice,
  signOutAdmin,
  close,
  resetAdminFields,
}) {
  const [activeView, setActiveView] = useState('overview')
  const [inventoryQuery, setInventoryQuery] = useState('')
  const [inventoryCategory, setInventoryCategory] = useState('All departments')
  const [inventoryStock, setInventoryStock] = useState('all')

  const totalUnits = catalog.reduce((total, product) => total + Number(product.quantity || 0), 0)
  const lowStockProducts = catalog.filter((product) => Number(product.quantity || 0) <= 5)
  const categoryCount = new Set(catalog.map((product) => product.category)).size
  const unseenOrderCount = adminOrders.filter((order) => !order.adminSeenAt).length
  const analyticsSummary = analytics.summary || { totalOrders: 0, revenue: 0, ordersToday: 0, revenueToday: 0, pendingOrders: 0 }
  const inventoryProducts = catalog
    .filter((product) => {
      const matchesQuery = product.name.toLowerCase().includes(inventoryQuery.toLowerCase())
      const matchesCategory = inventoryCategory === 'All departments' || product.category === inventoryCategory
      const quantity = Number(product.quantity || 0)
      const matchesStock = inventoryStock === 'all'
        || (inventoryStock === 'low' && quantity > 0 && quantity <= 5)
        || (inventoryStock === 'out' && quantity === 0)
        || (inventoryStock === 'healthy' && quantity > 5)
      return matchesQuery && matchesCategory && matchesStock
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const startNewProduct = () => {
    resetAdminFields()
    setAdminAction('new')
    setActiveView('inventory-form')
  }

  const startRestock = (product) => {
    resetAdminFields()
    setAdminAction('increase')
    setExistingProductId(String(product.id))
    setActiveView('inventory-form')
  }

  return (
    <div className="admin-dashboard-backdrop" role="dialog" aria-modal="true" aria-label="LUXE admin control center">
      <section className="admin-dashboard">
        <header className="admin-dashboard-header">
          <div className="admin-dashboard-brand"><span className="admin-brand-mark">L/</span><div><p className="eyebrow">LUXE operations</p><h2>Admin control center</h2></div></div>
          <div className="admin-dashboard-header-actions"><span className="admin-status"><span />Database-connected workspace</span><button className="icon-button" onClick={close} type="button"><Icon name="close" /><span className="sr-only">Close admin dashboard</span></button></div>
        </header>

        <div className="admin-dashboard-layout">
          <aside className="admin-dashboard-sidebar">
            <p className="admin-sidebar-label">Workspace</p>
            <button className={activeView === 'overview' ? 'active' : ''} onClick={() => setActiveView('overview')} type="button"><Icon name="grid" size={17} />Overview</button>
            <button className={activeView === 'analytics' ? 'active' : ''} onClick={() => { setActiveView('analytics'); refreshAnalytics() }} type="button"><Icon name="star" size={17} />Analytics</button>
            <button className={activeView === 'inventory' ? 'active' : ''} onClick={() => setActiveView('inventory')} type="button"><Icon name="bag" size={17} />Inventory</button>
            <button className={activeView === 'orders' ? 'active' : ''} onClick={() => { setActiveView('orders'); refreshAdminOrders() }} type="button"><Icon name="truck" size={17} />Orders {unseenOrderCount > 0 && <span className="admin-order-notification-count">{unseenOrderCount}</span>}</button>
            <button className={activeView === 'inventory-form' ? 'active' : ''} onClick={startNewProduct} type="button"><Icon name="arrow" size={17} />Add inventory</button>
            <div className="admin-sidebar-spacer" />
            <button onClick={close} type="button"><Icon name="arrow" size={17} />View storefront</button>
            <button className="admin-sidebar-signout" onClick={signOutAdmin} type="button"><Icon name="close" size={17} />Sign out</button>
          </aside>

          <main className="admin-dashboard-main">
            {activeView === 'overview' && <>
              <div className="admin-view-heading"><div><p className="eyebrow">Good to see you</p><h1>Store overview</h1><p>Manage the LUXE catalog, stock levels, and new product launches from one place.</p></div><button className="button button-dark" onClick={startNewProduct} type="button">Add a product <Icon name="arrow" size={17} /></button></div>
              <div className="admin-stat-grid"><article><span>Total products</span><strong>{catalog.length}</strong><small>Across {categoryCount} departments</small></article><article><span>Units in stock</span><strong>{totalUnits.toLocaleString('en-IN')}</strong><small>Available to customers</small></article><article><span>Low stock</span><strong>{lowStockProducts.length}</strong><small>Products need attention</small></article><article><span>Catalog value</span><strong>{formatPrice(catalog.reduce((total, product) => total + Number(product.price || 0) * Number(product.quantity || 0), 0))}</strong><small>Retail value in stock</small></article></div>
              <div className="admin-overview-grid"><section className="admin-card"><div className="admin-card-heading"><div><p className="eyebrow">Attention needed</p><h3>Low-stock products</h3></div><button className="text-link" onClick={() => { setInventoryStock('low'); setActiveView('inventory') }} type="button">View all <Icon name="arrow" size={16} /></button></div>{lowStockProducts.length > 0 ? <div className="admin-low-stock-list">{lowStockProducts.slice(0, 5).map((product) => <div key={product.id || product.name}><img alt="" src={product.image} /><div><strong>{product.name}</strong><span>{product.category}</span></div><b>{product.quantity} left</b><button onClick={() => startRestock(product)} type="button">Restock</button></div>)}</div> : <p className="admin-empty-message">Everything is well stocked right now.</p>}</section><section className="admin-card admin-quick-card"><p className="eyebrow">Quick actions</p><h3>Keep the storefront fresh.</h3><p>Launch a new listing or replenish a product without leaving the admin workspace.</p><button className="button button-outline" onClick={startNewProduct} type="button">Add new product <Icon name="arrow" size={16} /></button><button className="button button-outline" onClick={() => setActiveView('inventory')} type="button">Browse inventory <Icon name="arrow" size={16} /></button></section></div>
              <section className="admin-card"><div className="admin-card-heading"><div><p className="eyebrow">Recently available</p><h3>Latest catalog items</h3></div><button className="text-link" onClick={() => setActiveView('inventory')} type="button">Manage inventory <Icon name="arrow" size={16} /></button></div><div className="admin-recent-grid">{catalog.slice(0, 6).map((product) => <div key={product.id || product.name}><img alt={product.name} src={product.image} /><strong>{product.name}</strong><span>{formatPrice(product.price)} · {product.quantity} available</span></div>)}</div></section>
            </>}

            {activeView === 'inventory' && <section className="admin-inventory-view"><div className="admin-view-heading"><div><p className="eyebrow">Catalog management</p><h1>Inventory</h1><p>Search, review, and replenish products stored in your database.</p></div><button className="button button-dark" onClick={startNewProduct} type="button">Add a product <Icon name="arrow" size={17} /></button></div><div className="admin-inventory-toolbar"><input onChange={(event) => setInventoryQuery(event.target.value)} placeholder="Search products" type="search" value={inventoryQuery} /><select onChange={(event) => setInventoryCategory(event.target.value)} value={inventoryCategory}>{departments.map((department) => <option key={department}>{department}</option>)}</select><select onChange={(event) => setInventoryStock(event.target.value)} value={inventoryStock}><option value="all">All stock levels</option><option value="healthy">Healthy stock</option><option value="low">Low stock</option><option value="out">Out of stock</option></select></div><div className="admin-inventory-table"><div className="admin-table-row admin-table-head"><span>Product</span><span>Department</span><span>Price</span><span>Stock</span><span>Action</span></div>{inventoryProducts.length > 0 ? inventoryProducts.map((product) => <div className="admin-table-row" key={product.id || product.name}><div className="admin-table-product"><img alt="" src={product.image} /><strong>{product.name}</strong></div><span>{product.category}</span><span>{formatPrice(product.price)}</span><span className={product.quantity <= 5 ? 'admin-stock-low' : 'admin-stock-ok'}>{product.quantity === 0 ? 'Out of stock' : `${product.quantity} available`}</span><button onClick={() => startRestock(product)} type="button">Increase quantity</button></div>) : <p className="admin-empty-message">No products match these filters.</p>}</div></section>}

            {activeView === 'inventory-form' && <section className="admin-form-view"><div className="admin-view-heading"><div><p className="eyebrow">Inventory workspace</p><h1>{adminAction === 'increase' ? 'Replenish inventory' : 'Add a new product'}</h1><p>{adminAction === 'increase' ? 'Add units to a product that already exists in the database.' : 'Create a complete product listing for the storefront.'}</p></div></div><form className="admin-product-form" onSubmit={submitAdminProduct}><fieldset className="admin-action-choice"><legend>Choose an inventory action</legend><label><input checked={adminAction === 'new'} name="adminActionDashboard" onChange={() => { resetAdminFields(); setAdminAction('new') }} type="radio" />Add a new product</label><label><input checked={adminAction === 'increase'} name="adminActionDashboard" onChange={() => { resetAdminFields(); setAdminAction('increase') }} type="radio" />Increase existing quantity</label></fieldset>{adminAction === 'increase' ? <><label>Existing product<select onChange={(event) => setExistingProductId(event.target.value)} required value={existingProductId}><option value="">Choose a saved product</option>{catalog.filter((product) => product.id).sort((a, b) => a.name.localeCompare(b.name)).map((product) => <option key={product.id} value={product.id}>{product.name} · {product.quantity} available</option>)}</select></label><label>Quantity to add<input min="1" onChange={(event) => updateAdminField('quantity', event.target.value)} placeholder="10" required step="1" type="number" value={adminForm.quantity} /></label></> : <><div className="admin-form-grid"><label>Product name<input onChange={(event) => updateAdminField('name', event.target.value)} placeholder="Example: Pixel Pro Phone" required type="text" value={adminForm.name} /></label><label>Brand<input onChange={(event) => updateAdminField('brand', event.target.value)} placeholder="Example: Google" type="text" value={adminForm.brand} /></label></div><div className="admin-form-grid"><label>Department<select onChange={(event) => updateAdminField('category', event.target.value)} value={adminForm.category}>{departments.slice(1).map((department) => <option key={department}>{department}</option>)}</select></label><label>Tag<input onChange={(event) => updateAdminField('tag', event.target.value)} placeholder="New arrival" type="text" value={adminForm.tag} /></label></div><div className="admin-form-grid"><label>Price (₹)<input min="0" onChange={(event) => updateAdminField('price', event.target.value)} placeholder="49999" required step="1" type="number" value={adminForm.price} /></label><label>Quantity<input min="0" onChange={(event) => updateAdminField('quantity', event.target.value)} placeholder="25" required step="1" type="number" value={adminForm.quantity} /></label></div><label>Product picture<input accept="image/*" onChange={handleAdminImage} type="file" /></label>{adminImagePreview && <img alt="New product preview" className="admin-image-preview" src={adminImagePreview} />}</>}<button className="button button-dark admin-form-submit" type="submit">{adminAction === 'increase' ? 'Increase quantity' : 'Add product'} <Icon name="arrow" size={17} /></button></form>{adminNotice && <p className="panel-notice">{adminNotice}</p>}</section>}
            {activeView === 'orders' && <section className="admin-orders-view"><div className="admin-view-heading"><div><p className="eyebrow">Customer activity</p><h1>Order notifications</h1><p>{unseenOrderCount > 0 ? `${unseenOrderCount} new ${unseenOrderCount === 1 ? 'order is' : 'orders are'} waiting for review.` : 'Review every customer order and its delivery details.'}</p></div><button className="button button-outline" onClick={refreshAdminOrders} type="button">Refresh orders <Icon name="arrow" size={17} /></button></div>{adminOrdersNotice && <p className="panel-notice">{adminOrdersNotice}</p>}{adminOrdersLoading ? <p className="admin-empty-message">Loading orders…</p> : adminOrders.length > 0 ? <div className="admin-order-list">{adminOrders.map((order) => <article className="admin-order-card" key={order.id}><header><div><p>{formatOrderNumber(order.id)}</p><strong>{formatOrderDate(order.createdAt)}</strong></div>{!order.adminSeenAt && <span className="admin-new-order-badge">New order</span>}</header><div className="admin-order-details"><div><span>Customer</span><strong>{order.customer?.name}</strong><small>{order.customer?.email}</small></div><div><span>Delivery</span><strong>{order.shippingName}</strong><small>{order.shippingLine1}, {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}</small></div></div><ul>{order.items.map((item) => <li key={`${order.id}-${item.productId}`}><span>{item.quantity} × {item.name}</span><strong>{formatPrice(item.total)}</strong></li>)}</ul><footer><div><span>{order.itemCount} {order.itemCount === 1 ? 'item' : 'items'} · {order.status}</span><strong>{formatPrice(order.total)}</strong></div>{!order.adminSeenAt && <button onClick={() => markOrderSeen(order.id)} type="button">Mark as seen</button>}</footer></article>)}</div> : <p className="admin-empty-message">No customer orders have been placed yet.</p>}</section>}
            {activeView === 'analytics' && <section className="admin-analytics-view"><div className="admin-view-heading"><div><p className="eyebrow">Store performance</p><h1>Analytics</h1><p>Monitor revenue, sales activity, best sellers, and products that need restocking.</p></div><button className="button button-outline" onClick={refreshAnalytics} type="button">Refresh analytics <Icon name="arrow" size={17} /></button></div>{analyticsNotice && <p className="panel-notice">{analyticsNotice}</p>}{analyticsLoading ? <p className="admin-empty-message">Loading analytics…</p> : <><div className="admin-stat-grid analytics-stat-grid"><article><span>Total revenue</span><strong>{formatPrice(analyticsSummary.revenue)}</strong><small>All completed store activity</small></article><article><span>Orders today</span><strong>{analyticsSummary.ordersToday}</strong><small>{formatPrice(analyticsSummary.revenueToday)} today</small></article><article><span>Total orders</span><strong>{analyticsSummary.totalOrders}</strong><small>{analyticsSummary.pendingOrders} awaiting fulfilment</small></article><article><span>Low stock</span><strong>{analytics.lowStock?.length || 0}</strong><small>Products with 5 or fewer units</small></article></div><div className="admin-overview-grid"><section className="admin-card"><div className="admin-card-heading"><div><p className="eyebrow">Sales leaders</p><h3>Top products</h3></div></div>{analytics.topProducts?.length > 0 ? <div className="analytics-product-list">{analytics.topProducts.map((product) => <div key={product.id}><img alt="" src={product.image} /><div><strong>{product.name}</strong><span>{product.unitsSold} sold · {formatPrice(product.revenue)}</span></div></div>)}</div> : <p className="admin-empty-message">Sales data will appear after the first order.</p>}</section><section className="admin-card"><div className="admin-card-heading"><div><p className="eyebrow">Inventory watch</p><h3>Low-stock alerts</h3></div></div>{analytics.lowStock?.length > 0 ? <div className="analytics-product-list">{analytics.lowStock.map((product) => <div key={product.id}><img alt="" src={product.image} /><div><strong>{product.name}</strong><span>{product.quantity === 0 ? 'Out of stock' : `${product.quantity} left`} · {product.category}</span></div></div>)}</div> : <p className="admin-empty-message">Everything is stocked well right now.</p>}</section></div></>}</section>}
          </main>
        </div>
      </section>
    </div>
  )
}

function OrderHistoryPanel({ orders, loading, notice, refresh, close }) {
  return (
    <div className="panel-backdrop" onClick={close}>
      <aside className="side-panel order-history-panel" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header"><div><p className="eyebrow">Your LUXE account</p><h2>Order history</h2></div><button className="icon-button" onClick={close} type="button"><Icon name="close" /><span className="sr-only">Close order history</span></button></div>
        <div className="order-history-actions"><p>All orders placed with this account are saved here.</p><button className="text-link" onClick={refresh} type="button">Refresh <Icon name="arrow" size={15} /></button></div>
        {notice && <p className="panel-notice">{notice}</p>}
        {loading ? <p className="admin-empty-message">Loading your orders…</p> : orders.length > 0 ? <div className="customer-order-list">{orders.map((order) => <article className="customer-order-card" key={order.id}><header><div><p>{formatOrderNumber(order.id)}</p><strong>{formatOrderDate(order.createdAt)}</strong></div><span>{order.status}</span></header><div className="customer-order-items">{order.items.map((item) => <div key={`${order.id}-${item.productId}`}><img alt="" src={item.image} /><div><strong>{item.quantity} × {item.name}</strong><small>{formatPrice(item.total)}</small></div></div>)}</div><footer><span>{order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}</span><strong>{formatPrice(order.total)}</strong></footer></article>)}</div> : <div className="drawer-empty"><span className="drawer-empty-icon"><Icon name="bag" size={28} /></span><h3>No orders yet.</h3><p>When you check out, your order will appear here.</p><button className="button button-outline" onClick={close} type="button">Continue shopping</button></div>}
      </aside>
    </div>
  )
}

function AccountPanel({
  authTab,
  setAuthTab,
  authForm,
  updateAuthField,
  submitAuth,
  authNotice,
  customerSession,
  adminSession,
  accountName,
  signOutCustomer,
  signOutAdmin,
  openAdminPanel,
  openAddress,
  openProfile,
  openOrderHistory,
  close,
}) {
  const isSignedIn = Boolean(customerSession || adminSession)

  return (
    <div className="panel-backdrop" onClick={close}>
      <aside className="side-panel account-panel" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header">
          <div><p className="eyebrow">LUXE account</p><h2>{isSignedIn ? `Welcome, ${accountName || 'back'}` : authTab === 'register' ? 'Create your account' : 'Welcome back'}</h2></div>
          <button className="icon-button" onClick={close} type="button"><Icon name="close" /><span className="sr-only">Close account panel</span></button>
        </div>

        {isSignedIn ? <div className="signed-in-account">
          <div className="signed-in-badge"><span className="account-avatar"><Icon name="user" size={21} /><span className="account-status-dot" /></span><div><strong>{adminSession ? 'Administrator account' : 'Customer account'}</strong><span>{accountName ? `Signed in as ${accountName}` : 'Active session'}</span></div></div>
          <p className="signed-in-message">Your account is active. You can manage your profile, delivery details, and saved shopping experience from here.</p>
          {adminSession && <button className="button button-dark panel-submit" onClick={openAdminPanel} type="button">Open admin control center <Icon name="arrow" size={17} /></button>}
          {customerSession && <button className="panel-link-button" onClick={openProfile} type="button"><span><strong>Profile settings</strong><small>Manage your name, phone, password, and addresses</small></span><Icon name="arrow" size={17} /></button>}
          {customerSession && <button className="panel-link-button" onClick={openOrderHistory} type="button"><span><strong>Order history</strong><small>View purchases and delivery updates</small></span><Icon name="arrow" size={17} /></button>}
          <button className="panel-link-button" onClick={openAddress} type="button"><span><strong>Delivery address</strong><small>Add or update your delivery details</small></span><Icon name="arrow" size={17} /></button>
          <button className="button button-outline panel-submit" onClick={adminSession ? signOutAdmin : signOutCustomer} type="button">{adminSession ? 'Sign out admin' : 'Sign out'} <Icon name="arrow" size={17} /></button>
        </div> : <>
          <div className="panel-tabs"><button className={authTab === 'register' ? 'active' : ''} onClick={() => { setAuthTab('register') }} type="button">Register</button><button className={authTab === 'signin' ? 'active' : ''} onClick={() => { setAuthTab('signin') }} type="button">Sign in</button></div>
          <form className="panel-form" onSubmit={submitAuth}>{authTab === 'register' && <label>Full name<input onChange={(event) => updateAuthField('name', event.target.value)} placeholder="Your full name" required type="text" value={authForm.name} /></label>}<label>Email address<input onChange={(event) => updateAuthField('email', event.target.value)} placeholder="you@example.com" required type="email" value={authForm.email} /></label>{authTab === 'register' && <label>Mobile number<input onChange={(event) => updateAuthField('phone', event.target.value)} placeholder="+91 98765 43210" required type="tel" value={authForm.phone} /></label>}<label>Password<input minLength="6" onChange={(event) => updateAuthField('password', event.target.value)} placeholder="At least 6 characters" required type="password" value={authForm.password} /></label><button className="button button-dark panel-submit" type="submit">{authTab === 'register' ? 'Create account' : 'Sign in'} <Icon name="arrow" size={17} /></button></form>
          {authNotice && <p className="panel-notice">{authNotice}</p>}
          <div className="panel-divider" /><button className="panel-link-button" onClick={openAddress} type="button"><span><strong>Delivery address</strong><small>Add an address for faster checkout</small></span><Icon name="arrow" size={17} /></button>
        </>}
        <p className="panel-footnote">Your LUXE account keeps your addresses, orders, and wishlist together.</p>
      </aside>
    </div>
  )
}

function ProfilePanel({
  profile,
  profileForm,
  passwordForm,
  notice,
  loading,
  addresses,
  updateProfileField,
  updatePasswordField,
  submitProfile,
  submitPassword,
  startNewAddress,
  startAddressEdit,
  setDefaultAddress,
  removeAddress,
  close,
}) {
  return (
    <div className="panel-backdrop" onClick={close}>
      <aside className="side-panel profile-panel" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header"><div><p className="eyebrow">Your LUXE account</p><h2>Profile settings</h2></div><button className="icon-button" onClick={close} type="button"><Icon name="close" /><span className="sr-only">Close profile settings</span></button></div>
        {loading ? <p className="admin-empty-message">Loading your profile…</p> : <><form className="panel-form" onSubmit={submitProfile}><p className="profile-section-title">Personal details</p><label>Full name<input onChange={(event) => updateProfileField('name', event.target.value)} required type="text" value={profileForm.name} /></label><label>Email address<input disabled type="email" value={profile?.email || ''} /></label><label>Mobile number<input onChange={(event) => updateProfileField('phone', event.target.value)} type="tel" value={profileForm.phone} /></label><button className="button button-dark panel-submit" type="submit">Save profile <Icon name="arrow" size={17} /></button></form><div className="panel-divider" /><form className="panel-form" onSubmit={submitPassword}><p className="profile-section-title">Password</p><label>Current password<input autoComplete="current-password" onChange={(event) => updatePasswordField('currentPassword', event.target.value)} required type="password" value={passwordForm.currentPassword} /></label><label>New password<input autoComplete="new-password" minLength="6" onChange={(event) => updatePasswordField('newPassword', event.target.value)} required type="password" value={passwordForm.newPassword} /></label><button className="button button-outline panel-submit" type="submit">Update password <Icon name="arrow" size={17} /></button></form><div className="panel-divider" /><div className="profile-address-heading"><div><p className="profile-section-title">Saved addresses</p><small>Select a default address for checkout.</small></div><button className="text-link" onClick={startNewAddress} type="button">Add address <Icon name="arrow" size={15} /></button></div>{addresses.length > 0 ? <div className="profile-address-list">{addresses.map((address) => <article key={address.id}><div><strong>{address.name}</strong>{address.isDefault && <span>Default</span>}<p>{address.line1}<br />{address.city}, {address.state} {address.postalCode}<br />{address.phone}</p></div><footer><button onClick={() => startAddressEdit(address)} type="button">Edit</button>{!address.isDefault && <button onClick={() => setDefaultAddress(address)} type="button">Set default</button>}<button className="address-remove-button" onClick={() => removeAddress(address.id)} type="button">Remove</button></footer></article>)}</div> : <p className="admin-empty-message">Save delivery addresses here for faster checkout.</p>}{notice && <p className="panel-notice">{notice}</p>}</>}
      </aside>
    </div>
  )
}

function AddressPanel({ form, updateField, submit, notice, isEditing, savedAddress, close }) {
  return (
    <div className="panel-backdrop" onClick={close}>
      <aside className="side-panel" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header"><div><p className="eyebrow">Delivery preferences</p><h2>{isEditing ? 'Edit delivery address' : 'Add a delivery address'}</h2></div><button className="icon-button" onClick={close} type="button"><Icon name="close" /><span className="sr-only">Close address panel</span></button></div>
        {!isEditing && savedAddress && <div className="saved-address-card"><Icon name="location" size={19} /><div><strong>Current default: {savedAddress.name}</strong><span>{savedAddress.line1}</span><span>{savedAddress.city}, {savedAddress.state} {savedAddress.postalCode}</span><span>{savedAddress.phone}</span></div></div>}
        <form className="panel-form" onSubmit={submit}><label>Full name<input onChange={(event) => updateField('name', event.target.value)} placeholder="Recipient name" required type="text" value={form.name} /></label><label>Mobile number<input onChange={(event) => updateField('phone', event.target.value)} placeholder="+91 98765 43210" required type="tel" value={form.phone} /></label><label>Address<input onChange={(event) => updateField('line1', event.target.value)} placeholder="House number, street, area" required type="text" value={form.line1} /></label><div className="panel-input-grid"><label>City<input onChange={(event) => updateField('city', event.target.value)} placeholder="Mumbai" required type="text" value={form.city} /></label><label>State<input onChange={(event) => updateField('state', event.target.value)} placeholder="Maharashtra" required type="text" value={form.state} /></label></div><label>PIN code<input inputMode="numeric" onChange={(event) => updateField('postalCode', event.target.value)} pattern="[0-9]{6}" placeholder="400001" required type="text" value={form.postalCode} /></label><button className="button button-dark panel-submit" type="submit">{isEditing ? 'Save changes' : 'Save address'} <Icon name="arrow" size={17} /></button></form>
        {notice && <p className="panel-notice">{notice}</p>}
        <p className="panel-footnote">Saved addresses are available for every future checkout from this account.</p>
      </aside>
    </div>
  )
}

function App() {
  const [activeCategory, setActiveCategory] = useState('All departments')
  const [sortBy, setSortBy] = useState('Featured')
  const [selectedRating, setSelectedRating] = useState('all')
  const [selectedPriceRange, setSelectedPriceRange] = useState('all')
  const [cart, setCart] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [catalog, setCatalog] = useState(catalogFallback)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [panelOpen, setPanelOpen] = useState(null)
  const [authTab, setAuthTab] = useState('register')
  const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [accountName, setAccountName] = useState('')
  const [customerSession, setCustomerSession] = useState(() => sessionStorage.getItem('luxe_customer_token') || '')
  const [authNotice, setAuthNotice] = useState('')
  const [addressForm, setAddressForm] = useState({ name: '', phone: '', line1: '', city: '', state: '', postalCode: '' })
  const [savedAddress, setSavedAddress] = useState(null)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressNotice, setAddressNotice] = useState('')
  const [profile, setProfile] = useState(null)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' })
  const [profileNotice, setProfileNotice] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [customerOrders, setCustomerOrders] = useState([])
  const [customerOrdersLoading, setCustomerOrdersLoading] = useState(false)
  const [ordersNotice, setOrdersNotice] = useState('')
  const [checkoutNotice, setCheckoutNotice] = useState('')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [adminAction, setAdminAction] = useState('new')
  const [adminForm, setAdminForm] = useState({ name: '', brand: '', category: 'Tech', price: '', quantity: '', tag: 'New arrival', image: '' })
  const [existingProductId, setExistingProductId] = useState('')
  const [adminImagePreview, setAdminImagePreview] = useState('')
  const [adminNotice, setAdminNotice] = useState('')
  const [adminLoginForm, setAdminLoginForm] = useState({ email: '', password: '' })
  const [adminLoginNotice, setAdminLoginNotice] = useState('')
  const [adminSession, setAdminSession] = useState(() => sessionStorage.getItem('luxe_admin_token') || '')
  const [adminOrders, setAdminOrders] = useState([])
  const [adminOrdersLoading, setAdminOrdersLoading] = useState(false)
  const [adminOrdersNotice, setAdminOrdersNotice] = useState('')
  const [analytics, setAnalytics] = useState({ summary: null, topProducts: [], lowStock: [] })
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsNotice, setAnalyticsNotice] = useState('')
  const [sessionChecked, setSessionChecked] = useState(false)

  const loadProfile = useCallback(async () => {
    if (!customerSession) {
      setProfile(null)
      setSavedAddresses([])
      setSavedAddress(null)
      return
    }

    setProfileLoading(true)
    setProfileNotice('')
    try {
      const response = await fetch(`${API_BASE_URL}/account/profile`, { headers: { Authorization: `Bearer ${customerSession}` } })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not load profile settings.')
      const addresses = Array.isArray(result.addresses) ? result.addresses : []
      setProfile(result.profile)
      setProfileForm({ name: result.profile?.name || '', phone: result.profile?.phone || '' })
      setSavedAddresses(addresses)
      setSavedAddress(addresses.find((address) => address.isDefault) || null)
      setAccountName(result.profile?.name?.split(' ')[0] || 'there')
    } catch (error) {
      setProfileNotice(error.message || 'Could not connect to the backend.')
    } finally {
      setProfileLoading(false)
    }
  }, [customerSession])

  const loadCustomerOrders = useCallback(async () => {
    if (!customerSession) {
      setCustomerOrders([])
      return
    }

    setCustomerOrdersLoading(true)
    setOrdersNotice('')
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, { headers: { Authorization: `Bearer ${customerSession}` } })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not load your orders.')
      setCustomerOrders(Array.isArray(result.orders) ? result.orders : [])
    } catch (error) {
      setOrdersNotice(error.message || 'Could not connect to the backend.')
    } finally {
      setCustomerOrdersLoading(false)
    }
  }, [customerSession])

  const loadAdminOrders = useCallback(async () => {
    if (!adminSession) {
      setAdminOrders([])
      return
    }

    setAdminOrdersLoading(true)
    setAdminOrdersNotice('')
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders`, { headers: { Authorization: `Bearer ${adminSession}` } })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not load orders.')
      setAdminOrders(Array.isArray(result.orders) ? result.orders : [])
    } catch (error) {
      setAdminOrdersNotice(error.message || 'Could not connect to the backend.')
    } finally {
      setAdminOrdersLoading(false)
    }
  }, [adminSession])

  const loadAnalytics = useCallback(async () => {
    if (!adminSession) {
      setAnalytics({ summary: null, topProducts: [], lowStock: [] })
      return
    }

    setAnalyticsLoading(true)
    setAnalyticsNotice('')
    try {
      const response = await fetch(`${API_BASE_URL}/admin/analytics`, { headers: { Authorization: `Bearer ${adminSession}` } })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not load analytics.')
      setAnalytics({
        summary: result.summary || null,
        topProducts: Array.isArray(result.topProducts) ? result.topProducts : [],
        lowStock: Array.isArray(result.lowStock) ? result.lowStock : [],
      })
    } catch (error) {
      setAnalyticsNotice(error.message || 'Could not connect to the backend.')
    } finally {
      setAnalyticsLoading(false)
    }
  }, [adminSession])

  useEffect(() => {
    const token = adminSession || customerSession
    if (!token) return
    const endpoint = adminSession ? '/auth/admin/me' : '/auth/me'
    fetch(`${API_BASE_URL}${endpoint}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        if (!response.ok) throw new Error('Expired session')
        return response.json()
      })
      .then((result) => {
        const role = result.user?.role
        if (role === 'admin') {
          setAccountName(result.user.name?.split(' ')[0] || 'Admin')
          setAdminSession(adminSession)
          setCustomerSession('')
        } else if (role === 'customer') {
          setAccountName(result.user.name?.split(' ')[0] || 'there')
          setCustomerSession(customerSession)
          setAdminSession('')
        }
      })
      .catch(() => {
        sessionStorage.removeItem('luxe_admin_token')
        sessionStorage.removeItem('luxe_customer_token')
        setAdminSession('')
        setCustomerSession('')
        setAccountName('')
      })
      .finally(() => setSessionChecked(true))
  }, [adminSession, customerSession])

  useEffect(() => {
    if (!customerSession) return undefined
    const refreshId = window.setTimeout(() => { void loadCustomerOrders() }, 0)
    return () => window.clearTimeout(refreshId)
  }, [customerSession, loadCustomerOrders])

  useEffect(() => {
    if (!customerSession) return undefined
    const refreshId = window.setTimeout(() => { void loadProfile() }, 0)
    return () => window.clearTimeout(refreshId)
  }, [customerSession, loadProfile])

  useEffect(() => {
    if (!adminSession) return undefined
    const refreshId = window.setTimeout(() => { void loadAdminOrders() }, 0)
    return () => window.clearTimeout(refreshId)
  }, [adminSession, loadAdminOrders])

  useEffect(() => {
    if (!adminSession) return undefined
    const refreshId = window.setTimeout(() => { void loadAnalytics() }, 0)
    return () => window.clearTimeout(refreshId)
  }, [adminSession, loadAnalytics])

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then((response) => (response.ok ? response.json() : []))
      .then((serverProducts) => {
        if (!Array.isArray(serverProducts) || serverProducts.length === 0) return
        const serverNames = new Set(serverProducts.map((product) => product.name))
        const localProducts = catalogFallback.filter((product) => !serverNames.has(product.name))
        setCatalog([...serverProducts.map(normalizeProduct), ...localProducts])
      })
      .catch(() => {})
  }, [])

  const visibleProducts = useMemo(() => {
    const result = catalog.filter((product) => {
      const matchesCategory = activeCategory === 'All departments' || product.category === activeCategory
      const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase())
      const rating = Number.parseFloat(product.rating)
      const matchesRating = selectedRating === 'all' || (Number.isFinite(rating) && rating >= Number(selectedRating))
      const matchesPrice = matchesPriceFilter(product.price, selectedPriceRange)
      return matchesCategory && matchesQuery && matchesRating && matchesPrice
    })

    if (sortBy === 'Price: low to high') return [...result].sort((a, b) => a.price - b.price)
    if (sortBy === 'Price: high to low') return [...result].sort((a, b) => b.price - a.price)
    if (sortBy === 'Top rated') return [...result].sort((a, b) => Number(b.rating) - Number(a.rating))
    return result
  }, [activeCategory, catalog, query, selectedPriceRange, selectedRating, sortBy])

  const resetFilters = () => {
    setSelectedRating('all')
    setSelectedPriceRange('all')
    setSortBy('Featured')
    setFiltersOpen(false)
  }

  const addToCart = (product) => {
    setCart((current) => [...current, product])
    setCartOpen(true)
  }

  const removeFromCart = (index) => setCart((current) => current.filter((_, itemIndex) => itemIndex !== index))

  const placeOrder = async () => {
    if (!customerSession) {
      setCartOpen(false)
      setAuthTab('signin')
      setAuthNotice('Sign in to place your order and keep its history in your account.')
      setPanelOpen('account')
      return
    }

    if (!savedAddress) {
      setCartOpen(false)
      setPanelOpen('address')
      return
    }

    const quantitiesByProductId = new Map()
    for (const product of cart) {
      if (!product.id) {
        setCheckoutNotice('This item is not ready for checkout yet. Refresh the catalog and try again.')
        return
      }
      quantitiesByProductId.set(product.id, (quantitiesByProductId.get(product.id) || 0) + 1)
    }

    setCheckoutNotice('')
    setIsPlacingOrder(true)
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        body: JSON.stringify({
          address: savedAddress,
          items: [...quantitiesByProductId.entries()].map(([productId, quantity]) => ({ productId, quantity })),
        }),
        headers: { Authorization: `Bearer ${customerSession}`, 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not place your order.')

      setCart([])
      setCartOpen(false)
      setCatalog((current) => current.map((product) => {
        const inventory = result.inventory?.find((item) => item.id === product.id)
        return inventory ? { ...product, quantity: inventory.quantity } : product
      }))
      setCustomerOrders((current) => [result.order, ...current.filter((order) => order.id !== result.order.id)])
      setOrdersNotice(`Order ${formatOrderNumber(result.order.id)} has been placed successfully.`)
      setPanelOpen('orders')
    } catch (error) {
      setCheckoutNotice(error.message || 'Could not connect to the backend.')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const submitNewsletter = (event) => {
    event.preventDefault()
    if (email.trim()) setSubscribed(true)
  }

  const updateAuthField = (field, value) => setAuthForm((current) => ({ ...current, [field]: value }))

  const updateAddressField = (field, value) => setAddressForm((current) => ({ ...current, [field]: value }))

  const updateProfileField = (field, value) => setProfileForm((current) => ({ ...current, [field]: value }))

  const updatePasswordField = (field, value) => setPasswordForm((current) => ({ ...current, [field]: value }))

  const submitAuth = async (event) => {
    event.preventDefault()
    setAuthNotice('')
    if (authTab !== 'register') {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          body: JSON.stringify({ email: authForm.email, password: authForm.password }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Could not sign in.')
        if (result.user?.role === 'admin') {
          sessionStorage.setItem('luxe_admin_token', result.token)
          sessionStorage.removeItem('luxe_customer_token')
          setAdminSession(result.token)
          setCustomerSession('')
          setAccountName(result.user?.name?.split(' ')[0] || 'Admin')
          setAuthForm((current) => ({ ...current, password: '' }))
          setAuthNotice('Administrator signed in. Opening the admin control center.')
          setPanelOpen('admin')
          return
        }

        sessionStorage.setItem('luxe_customer_token', result.token)
        sessionStorage.removeItem('luxe_admin_token')
        setAdminSession('')
        setCustomerSession(result.token)
        setAccountName(result.user?.name?.split(' ')[0] || 'there')
        setAuthForm((current) => ({ ...current, password: '' }))
        setAuthNotice('You are signed in successfully.')
      } catch (error) {
        setAuthNotice(error.message || 'Could not connect to the backend.')
      }
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        body: JSON.stringify(authForm),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not create the account.')
      sessionStorage.removeItem('luxe_admin_token')
      sessionStorage.setItem('luxe_customer_token', result.token)
      setAdminSession('')
      setCustomerSession(result.token)
      setAccountName(result.user?.name?.split(' ')[0] || 'there')
      setAuthForm((current) => ({ ...current, password: '' }))
      setAuthNotice('Your account was created and saved. Add a delivery address to continue.')
    } catch (error) {
      setAuthNotice(error.message || 'Could not connect to the backend.')
    }
  }

  const updateAdminLoginField = (field, value) => setAdminLoginForm((current) => ({ ...current, [field]: value }))

  const openAdminPanel = () => {
    setAdminNotice('')
    setAdminLoginNotice('')
    if (adminSession) {
      loadAdminOrders()
      loadAnalytics()
    }
    setPanelOpen(adminSession ? 'admin' : 'admin-login')
  }

  const submitAdminLogin = async (event) => {
    event.preventDefault()
    setAdminLoginNotice('')
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        body: JSON.stringify(adminLoginForm),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Admin login failed.')
      sessionStorage.setItem('luxe_admin_token', result.token)
      sessionStorage.removeItem('luxe_customer_token')
      setAdminSession(result.token)
      setCustomerSession('')
      setAccountName(result.user?.name?.split(' ')[0] || 'Admin')
      setPanelOpen('admin')
    } catch (error) {
      setAdminLoginNotice(error.message)
    }
  }

  const signOutAdmin = () => {
    sessionStorage.removeItem('luxe_admin_token')
    setAdminSession('')
    setAccountName('')
    setAdminLoginForm({ email: '', password: '' })
    setAdminLoginNotice('')
    setPanelOpen(null)
  }

  const signOutCustomer = () => {
    sessionStorage.removeItem('luxe_customer_token')
    setCustomerSession('')
    setAccountName('')
    setCustomerOrders([])
    setOrdersNotice('')
    setSavedAddress(null)
    setSavedAddresses([])
    setProfile(null)
    setProfileForm({ name: '', phone: '' })
    setPasswordForm({ currentPassword: '', newPassword: '' })
    setProfileNotice('')
    setAddressForm({ name: '', phone: '', line1: '', city: '', state: '', postalCode: '' })
    setAuthForm({ name: '', email: '', phone: '', password: '' })
    setAuthNotice('You have been signed out.')
  }

  const markOrderSeen = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/seen`, {
        headers: { Authorization: `Bearer ${adminSession}` },
        method: 'PATCH',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not update the order notification.')
      setAdminOrders((current) => current.map((order) => order.id === orderId ? { ...order, adminSeenAt: result.adminSeenAt } : order))
    } catch (error) {
      setAdminOrdersNotice(error.message || 'Could not connect to the backend.')
    }
  }

  const openProfile = () => {
    setProfileNotice('')
    setPanelOpen('profile')
    void loadProfile()
  }

  const startNewAddress = () => {
    setEditingAddressId(null)
    setAddressNotice('')
    setAddressForm({ name: profile?.name || '', phone: profile?.phone || '', line1: '', city: '', state: '', postalCode: '' })
    setPanelOpen('address')
  }

  const startAddressEdit = (address) => {
    setEditingAddressId(address.id)
    setAddressNotice('')
    setAddressForm({ name: address.name, phone: address.phone, line1: address.line1, city: address.city, state: address.state, postalCode: address.postalCode })
    setPanelOpen('address')
  }

  const applyAddresses = (addresses) => {
    setSavedAddresses(addresses)
    setSavedAddress(addresses.find((address) => address.isDefault) || null)
  }

  const submitProfile = async (event) => {
    event.preventDefault()
    setProfileNotice('')
    try {
      const response = await fetch(`${API_BASE_URL}/account/profile`, {
        body: JSON.stringify(profileForm),
        headers: { Authorization: `Bearer ${customerSession}`, 'Content-Type': 'application/json' },
        method: 'PATCH',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not update your profile.')
      setProfile(result.profile)
      setProfileForm({ name: result.profile.name || '', phone: result.profile.phone || '' })
      setAccountName(result.profile.name?.split(' ')[0] || 'there')
      setProfileNotice('Profile saved successfully.')
    } catch (error) {
      setProfileNotice(error.message || 'Could not connect to the backend.')
    }
  }

  const submitPassword = async (event) => {
    event.preventDefault()
    setProfileNotice('')
    try {
      const response = await fetch(`${API_BASE_URL}/account/password`, {
        body: JSON.stringify(passwordForm),
        headers: { Authorization: `Bearer ${customerSession}`, 'Content-Type': 'application/json' },
        method: 'PATCH',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not update your password.')
      setPasswordForm({ currentPassword: '', newPassword: '' })
      setProfileNotice(result.message || 'Password updated successfully.')
    } catch (error) {
      setProfileNotice(error.message || 'Could not connect to the backend.')
    }
  }

  const setDefaultAddress = async (address) => {
    setProfileNotice('')
    try {
      const response = await fetch(`${API_BASE_URL}/account/addresses/${address.id}`, {
        body: JSON.stringify({ ...address, isDefault: true }),
        headers: { Authorization: `Bearer ${customerSession}`, 'Content-Type': 'application/json' },
        method: 'PATCH',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not set the default address.')
      applyAddresses(result.addresses || [])
      setProfileNotice('Default delivery address updated.')
    } catch (error) {
      setProfileNotice(error.message || 'Could not connect to the backend.')
    }
  }

  const removeAddress = async (addressId) => {
    setProfileNotice('')
    try {
      const response = await fetch(`${API_BASE_URL}/account/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${customerSession}` },
        method: 'DELETE',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not remove the address.')
      applyAddresses(result.addresses || [])
      setProfileNotice('Address removed.')
    } catch (error) {
      setProfileNotice(error.message || 'Could not connect to the backend.')
    }
  }

  const submitAddress = async (event) => {
    event.preventDefault()
    setAddressNotice('')
    if (!customerSession) {
      setSavedAddress(addressForm)
      setPanelOpen(null)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/account/addresses${editingAddressId ? `/${editingAddressId}` : ''}`, {
        body: JSON.stringify({ ...addressForm, isDefault: savedAddresses.length === 0 }),
        headers: { Authorization: `Bearer ${customerSession}`, 'Content-Type': 'application/json' },
        method: editingAddressId ? 'PATCH' : 'POST',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not save your address.')
      applyAddresses(result.addresses || [])
      setEditingAddressId(null)
      setPanelOpen('profile')
    } catch (error) {
      setAddressNotice(error.message || 'Could not connect to the backend.')
    }
  }

  const updateAdminField = (field, value) => setAdminForm((current) => ({ ...current, [field]: value }))

  const resetAdminFields = () => {
    setAdminForm({ name: '', brand: '', category: 'Tech', price: '', quantity: '', tag: 'New arrival', image: '' })
    setExistingProductId('')
    setAdminImagePreview('')
  }

  const handleAdminImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const imageData = String(reader.result || '')
      setAdminImagePreview(imageData)
      updateAdminField('image', imageData)
    }
    reader.readAsDataURL(file)
  }

  const submitAdminProduct = async (event) => {
    event.preventDefault()
    const price = Number(adminForm.price)
    const quantity = Number(adminForm.quantity)

    if (adminAction === 'increase') {
      const productId = Number(existingProductId)
      if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
        setAdminNotice('Choose an existing product and enter a positive whole-number quantity to add.')
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/quantity`, {
          body: JSON.stringify({ quantity }),
          headers: { Authorization: `Bearer ${adminSession}`, 'Content-Type': 'application/json' },
          method: 'PATCH',
        })
        const result = await response.json()
        if (response.status === 401) {
          signOutAdmin()
          setAdminLoginNotice('Your admin session expired. Please sign in again.')
          setPanelOpen('admin-login')
          return
        }
        if (!response.ok) throw new Error(result.message || 'Could not increase product quantity.')
        setCatalog((current) => current.map((product) => product.id === result.id ? normalizeProduct(result) : product))
        setAdminForm((current) => ({ ...current, quantity: '' }))
        setExistingProductId('')
        setAdminNotice(`${result.name} quantity increased by ${quantity}. Total available: ${result.quantity}.`)
      } catch (error) {
        setAdminNotice(error.message || 'Could not connect to the backend.')
      }
      return
    }

    if (!adminForm.name.trim() || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 0) {
      setAdminNotice('Enter a product name, a valid INR price, and a whole-number quantity of 0 or more.')
      return
    }

    const fallbackImage = categoryCards.find((category) => category.name === adminForm.category)?.image || categoryCards[0].image
    const newProduct = {
      name: adminForm.name.trim(),
      brand: adminForm.brand.trim() || 'LUXE',
      category: adminForm.category,
      price,
      quantity,
      rating: 'New',
      reviews: 0,
      tag: adminForm.tag.trim() || 'New arrival',
      image: adminForm.image.trim() || fallbackImage,
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/products`, {
        body: JSON.stringify(newProduct),
        headers: { Authorization: `Bearer ${adminSession}`, 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const result = await response.json()
      if (response.status === 401) {
        signOutAdmin()
        setAdminLoginNotice('Your admin session expired. Please sign in again.')
        setPanelOpen('admin-login')
        return
      }
      if (!response.ok) throw new Error(result.message || 'Could not add product.')
      setCatalog((current) => [normalizeProduct(result), ...current.filter((product) => product.name !== result.name)])
      resetAdminFields()
      setAdminNotice(`${result.name} was saved to the database with ${result.quantity} available.`)
    } catch (error) {
      setAdminNotice(error.message || 'Could not connect to the backend.')
    }
  }

  const closeMenus = () => {
    setMenuOpen(false)
    setSearchOpen(false)
  }

  return (
    <main className="marketplace-shell">
      <div className="top-strip"><div className="content-container top-strip-inner"><span>Complimentary shipping on orders over ₹5,000</span><span>Easy 30-day returns</span><span>Thoughtful goods, always</span></div></div>

      <header className="market-header">
        <div className="content-container header-main">
          <button className="mobile-menu-button icon-button" onClick={() => setMenuOpen(!menuOpen)} type="button"><Icon name={menuOpen ? 'close' : 'menu'} /><span className="sr-only">Toggle navigation</span></button>
          <a className="wordmark" href="#top" onClick={closeMenus}>LUXE<span className="wordmark-mark">/</span></a>
          <button className="delivery-location" onClick={() => setPanelOpen('address')} type="button"><Icon name="location" size={19} /><div><small>Deliver to</small><strong>{savedAddress ? `${savedAddress.city}, ${savedAddress.postalCode}` : 'Select your address'}</strong></div></button>
          <div className={`search-box ${searchOpen ? 'is-open' : ''}`}>
            <button className="department-select" onClick={() => setFiltersOpen(!filtersOpen)} type="button"><span>{activeCategory === 'All departments' ? 'All' : activeCategory}</span><Icon name="chevron" size={15} /></button>
            <input onChange={(event) => setQuery(event.target.value)} placeholder="Search LUXE" type="search" value={query} />
            <button className="search-submit" onClick={() => setSearchOpen(true)} type="button"><Icon name="search" size={20} /><span className="sr-only">Search</span></button>
            {filtersOpen && <div className="department-menu">{departments.map((department) => <button key={department} onClick={() => { setActiveCategory(department); setFiltersOpen(false) }} type="button">{department}</button>)}</div>}
          </div>
          <button className={`header-account account-trigger ${accountName ? 'is-authenticated' : ''}`} onClick={() => { setAuthNotice(''); setPanelOpen((adminSession || customerSession) ? 'account-signed' : 'account') }} type="button"><span className="account-avatar"><Icon name="user" size={17} /><span className="account-status-dot" /></span><span><small>{accountName ? `Signed in as ${accountName}` : 'Hello, sign in'}</small><strong>{adminSession ? 'Admin account' : customerSession ? 'Customer account' : 'Account & Lists'} <Icon name="chevron" size={13} /></strong></span></button>
          <button className={`mobile-account-button ${accountName ? 'is-authenticated' : ''}`} onClick={() => { setAuthNotice(''); setPanelOpen((adminSession || customerSession) ? 'account-signed' : 'account') }} type="button"><span className="account-avatar"><Icon name="user" size={17} /><span className="account-status-dot" /></span><span className="sr-only">{accountName ? `Open ${adminSession ? 'admin' : 'customer'} account` : 'Sign in or register'}</span></button>
          <div className="header-account orders-account"><small>Returns</small><strong>& Orders</strong></div>
          <button className="cart-button" onClick={() => setCartOpen(true)} type="button"><Icon name="bag" size={25} /><span>Cart</span><b>{cart.length}</b></button>
        </div>
        <nav className={`department-nav ${menuOpen ? 'is-open' : ''}`}>
          <div className="content-container department-nav-inner">
            <button className="all-departments" onClick={() => setFiltersOpen(!filtersOpen)} type="button"><Icon name="menu" size={18} />All departments</button>
            <a href="#deals" onClick={closeMenus}>Today’s deals</a>
            <a href="#shop" onClick={closeMenus}>Best sellers</a>
            <a href="#shop" onClick={closeMenus}>New releases</a>
            <a href="#categories" onClick={closeMenus}>Gift ideas</a>
            <a href="#story" onClick={closeMenus}>Our story</a>
            <a href="#footer" onClick={closeMenus}>Sell with LUXE</a>
             {sessionChecked && adminSession && <button className="admin-nav-button" onClick={() => { openAdminPanel(); setMenuOpen(false) }} type="button">Admin panel</button>}
            <button className="mobile-panel-link" onClick={() => { setPanelOpen('account'); setMenuOpen(false) }} type="button">Sign in / register</button>
            <button className="mobile-panel-link" onClick={() => { setPanelOpen('address'); setMenuOpen(false) }} type="button">Delivery address</button>
          </div>
        </nav>
      </header>

      <section className="hero-market" id="top">
        <div className="content-container hero-market-grid">
          <div className="hero-market-copy">
            <p className="eyebrow">The LUXE marketplace</p>
            <h1>Find pieces that make the everyday <em>feel better.</em></h1>
            <p>Shop considered goods from independent makers and trusted names, all in one calm, easy-to-browse place.</p>
            <div className="hero-buttons"><a className="button button-dark" href="#shop">Start shopping <Icon name="arrow" size={17} /></a><a className="hero-secondary-link" href="#categories">Browse departments</a></div>
            <div className="hero-trust"><span>✦</span><span>Curated weekly</span><span>·</span><span>Small-batch finds</span><span>·</span><span>Ships with care</span></div>
          </div>
          <div className="hero-market-image" role="img" aria-label="Curated LUXE home and lifestyle products" />
        </div>
      </section>

      <section className="content-container category-rail" id="categories">
        <div className="rail-heading"><div><p className="eyebrow">Browse the edit</p><h2>Shop by department</h2></div><a className="text-link" href="#shop">See all departments <Icon name="arrow" size={17} /></a></div>
        <div className="category-rail-grid">{categoryCards.map((category) => <button className="category-rail-card" key={category.name} onClick={() => { setActiveCategory(category.name); document.querySelector('#shop')?.scrollIntoView({ behavior: 'smooth' }) }} type="button"><img alt={category.name} src={category.image} /><span className="category-rail-overlay" /><strong>{category.name}</strong><small>{category.count}</small><span className="category-card-arrow"><Icon name="arrow" size={17} /></span></button>)}</div>
      </section>

      <section className="content-container deal-rail" id="deals">
        <div className="deal-card deal-card-dark"><p className="eyebrow">The weekly edit</p><h2>Up to 25% off<br /><em>everyday icons.</em></h2><a href="#shop">Shop the edit <Icon name="arrow" size={16} /></a></div>
        <div className="deal-card deal-card-image"><div><p className="eyebrow">New makers</p><h3>Small batch,<br /><em>big feeling.</em></h3><a href="#shop">Meet the collection <Icon name="arrow" size={15} /></a></div></div>
        <div className="deal-card deal-card-olive"><p className="eyebrow">LUXE picks</p><h3>Five things<br />we’re loving now</h3><a href="#shop">See the list <Icon name="arrow" size={16} /></a></div>
      </section>

      <section className="content-container marketplace-section" id="shop">
        <aside className={`filters-panel ${filtersOpen ? 'is-open' : ''}`}>
          <div className="filters-header"><div><p className="eyebrow">Refine your search</p><h2>Departments</h2></div><div className="filters-header-actions"><button className="reset-filters" onClick={resetFilters} type="button">Reset filters</button><button className="close-filters icon-button" onClick={() => setFiltersOpen(false)} type="button"><Icon name="close" /><span className="sr-only">Close filters</span></button></div></div>
          <div className="filter-group"><button className={`filter-link ${activeCategory === 'All departments' ? 'active' : ''}`} onClick={() => setActiveCategory('All departments')} type="button">All departments <span>{catalog.length}</span></button>{departments.slice(1).map((department) => <button className={`filter-link ${activeCategory === department ? 'active' : ''}`} key={department} onClick={() => setActiveCategory(department)} type="button">{department}<span>{catalog.filter((product) => product.category === department).length}</span></button>)}</div>
          <div className="filter-rule" />
          <div className="filter-group filter-static"><p>Customer rating</p>{ratingFilters.slice(1).map((filter) => <button className={selectedRating === filter.id ? 'active' : ''} key={filter.id} onClick={() => { setSelectedRating(selectedRating === filter.id ? 'all' : filter.id); setFiltersOpen(false) }} type="button"><span className="star-row">{Array.from({ length: filter.id === '4.5' ? 5 : 4 }, (_, index) => <Icon key={index} name="star" size={13} />)}</span>{filter.label}</button>)}</div>
          <div className="filter-group filter-static"><p>Price range</p>{priceFilters.slice(1).map((filter) => <button className={selectedPriceRange === filter.id ? 'active' : ''} key={filter.id} onClick={() => { setSelectedPriceRange(selectedPriceRange === filter.id ? 'all' : filter.id); setFiltersOpen(false) }} type="button">{filter.label}</button>)}</div>
          <div className="filters-note"><Icon name="shield" size={18} /><p>Every LUXE order is backed by secure checkout and simple returns.</p></div>
        </aside>

        <div className="marketplace-results">
          <div className="results-toolbar"><div><p className="eyebrow">The considered edit</p><h2>{activeCategory === 'All departments' ? 'All pieces' : activeCategory}</h2><span className="results-count">{visibleProducts.length} results{query ? ` for “${query}”` : ''}</span></div><div className="results-controls"><button className="mobile-filter-button" onClick={() => setFiltersOpen(true)} type="button"><Icon name="filter" size={17} />Filters</button><label htmlFor="sort">Sort by<select id="sort" onChange={(event) => setSortBy(event.target.value)} value={sortBy}><option>Featured</option><option>Top rated</option><option>Price: low to high</option><option>Price: high to low</option></select><Icon name="chevron" size={14} /></label><button className="view-button active" type="button"><Icon name="grid" size={18} /><span className="sr-only">Grid view</span></button><button className="view-button" type="button"><Icon name="list" size={18} /><span className="sr-only">List view</span></button></div></div>
          <div className="product-grid">{visibleProducts.length > 0 ? visibleProducts.map((product) => <ProductCard key={product.name} onAdd={addToCart} onView={setSelectedProduct} product={product} />) : <div className="empty-state"><p>No pieces found for “{query}”.</p><button className="text-link" onClick={() => setQuery('')} type="button">Clear search <Icon name="arrow" size={17} /></button></div>}</div>
        </div>
      </section>

      <section className="content-container value-strip"><div><Icon name="truck" size={24} /><strong>Thoughtful delivery</strong><span>Complimentary shipping over ₹5,000</span></div><div><Icon name="shield" size={24} /><strong>Secure checkout</strong><span>Protected payments, always</span></div><div><Icon name="support" size={24} /><strong>Here to help</strong><span>Personal customer care</span></div></section>

      <section className="newsletter-section"><div className="content-container newsletter-inner"><div><p className="eyebrow">Stay in the know</p><h2>Good things, in your inbox.</h2><p>First access to new drops, private offers, and stories from the LUXE marketplace.</p></div>{subscribed ? <div className="subscription-success"><span>✦</span><strong>Welcome to the list.</strong><p>Keep an eye on your inbox for something good.</p></div> : <form className="newsletter-form" onSubmit={submitNewsletter}><label className="sr-only" htmlFor="email">Your email address</label><input id="email" onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" required type="email" value={email} /><button className="button button-dark" type="submit">Join the list <Icon name="arrow" size={17} /></button></form>}</div></section>

      <footer className="site-footer" id="footer"><div className="content-container footer-grid"><div className="footer-brand"><a className="wordmark" href="#top">LUXE<span className="wordmark-mark">/</span></a><p>Everyday objects,<br />considered carefully.</p><span className="footer-copyright">© 2026 LUXE Studio</span></div><div className="footer-column"><p className="footer-label">Explore</p><a href="#shop">Shop all</a><a href="#deals">Today’s deals</a><a href="#categories">Departments</a><a href="#top">Our story</a></div><div className="footer-column"><p className="footer-label">Help</p><a href="#footer">Order tracking</a><a href="#footer">Shipping & returns</a><a href="#footer">Contact us</a><a href="#footer">FAQ</a></div><div className="footer-column"><p className="footer-label">Follow along</p><a href="#footer">Instagram</a><a href="#footer">Pinterest</a><a href="#footer">Journal</a><a href="#footer">Wholesale</a></div></div><div className="content-container footer-bottom"><span>Privacy</span><span>Terms</span><span>Made with intention</span></div></footer>

      {panelOpen === 'account' && <div className="panel-backdrop" onClick={() => setPanelOpen(null)}><aside className="side-panel" onClick={(event) => event.stopPropagation()}><div className="panel-header"><div><p className="eyebrow">LUXE account</p><h2>{authTab === 'register' ? 'Create your account' : 'Welcome back'}</h2></div><button className="icon-button" onClick={() => setPanelOpen(null)} type="button"><Icon name="close" /><span className="sr-only">Close account panel</span></button></div><div className="panel-tabs"><button className={authTab === 'register' ? 'active' : ''} onClick={() => { setAuthTab('register'); setAuthNotice('') }} type="button">Register</button><button className={authTab === 'signin' ? 'active' : ''} onClick={() => { setAuthTab('signin'); setAuthNotice('') }} type="button">Sign in</button></div><form className="panel-form" onSubmit={submitAuth}>{authTab === 'register' && <label>Full name<input onChange={(event) => updateAuthField('name', event.target.value)} placeholder="Your full name" required type="text" value={authForm.name} /></label>}<label>Email address<input onChange={(event) => updateAuthField('email', event.target.value)} placeholder="you@example.com" required type="email" value={authForm.email} /></label>{authTab === 'register' && <label>Mobile number<input onChange={(event) => updateAuthField('phone', event.target.value)} placeholder="+91 98765 43210" required type="tel" value={authForm.phone} /></label>}<label>Password<input minLength="6" onChange={(event) => updateAuthField('password', event.target.value)} placeholder="At least 6 characters" required type="password" value={authForm.password} /></label><button className="button button-dark panel-submit" type="submit">{authTab === 'register' ? 'Create account' : 'Sign in'} <Icon name="arrow" size={17} /></button></form>{authNotice && <p className="panel-notice">{authNotice}</p>}<div className="panel-divider" />{adminSession && <button className="panel-link-button" onClick={signOutAdmin} type="button"><span><strong>Sign out admin</strong><small>End the administrator session</small></span><Icon name="arrow" size={17} /></button>}{customerSession && <button className="panel-link-button" onClick={signOutCustomer} type="button"><span><strong>Sign out</strong><small>Remove this browser’s account session</small></span><Icon name="arrow" size={17} /></button>}<button className="panel-link-button" onClick={() => setPanelOpen('address')} type="button"><span><strong>Delivery address</strong><small>{savedAddress ? `${savedAddress.city}, ${savedAddress.postalCode}` : 'Add an address for faster checkout'}</small></span><Icon name="arrow" size={17} /></button><p className="panel-footnote">Your LUXE account keeps your addresses, orders, and wishlist together.</p></aside></div>}

      {panelOpen === 'address' && <AddressPanel form={addressForm} updateField={updateAddressField} submit={submitAddress} notice={addressNotice} isEditing={Boolean(editingAddressId)} savedAddress={savedAddress} close={() => setPanelOpen(customerSession ? 'profile' : null)} />}

      {panelOpen === 'account-signed' && <AccountPanel authTab={authTab} setAuthTab={setAuthTab} authForm={authForm} updateAuthField={updateAuthField} submitAuth={submitAuth} authNotice={authNotice} customerSession={customerSession} adminSession={adminSession} accountName={accountName} signOutCustomer={signOutCustomer} signOutAdmin={signOutAdmin} openAdminPanel={openAdminPanel} openAddress={startNewAddress} openProfile={openProfile} openOrderHistory={() => { setPanelOpen('orders'); loadCustomerOrders() }} close={() => setPanelOpen(null)} />}

      {panelOpen === 'profile' && <ProfilePanel profile={profile} profileForm={profileForm} passwordForm={passwordForm} notice={profileNotice} loading={profileLoading} addresses={savedAddresses} updateProfileField={updateProfileField} updatePasswordField={updatePasswordField} submitProfile={submitProfile} submitPassword={submitPassword} startNewAddress={startNewAddress} startAddressEdit={startAddressEdit} setDefaultAddress={setDefaultAddress} removeAddress={removeAddress} close={() => setPanelOpen(null)} />}

      {panelOpen === 'orders' && <OrderHistoryPanel orders={customerOrders} loading={customerOrdersLoading} notice={ordersNotice} refresh={loadCustomerOrders} close={() => setPanelOpen(null)} />}

      {panelOpen === 'admin-login' && <div className="panel-backdrop" onClick={() => setPanelOpen(null)}><aside className="side-panel admin-panel" onClick={(event) => event.stopPropagation()}><div className="panel-header"><div><p className="eyebrow">Protected area</p><h2>Admin sign in</h2></div><button className="icon-button" onClick={() => setPanelOpen(null)} type="button"><Icon name="close" /><span className="sr-only">Close admin login</span></button></div><p className="admin-intro">Only the administrator account can manage products, prices, pictures, and inventory.</p><form className="panel-form" onSubmit={submitAdminLogin}><label>Admin email<input autoComplete="username" onChange={(event) => updateAdminLoginField('email', event.target.value)} placeholder="admin@example.com" required type="email" value={adminLoginForm.email} /></label><label>Admin password<input autoComplete="current-password" onChange={(event) => updateAdminLoginField('password', event.target.value)} placeholder="Your admin password" required type="password" value={adminLoginForm.password} /></label><button className="button button-dark panel-submit" type="submit">Sign in to admin <Icon name="arrow" size={17} /></button></form>{adminLoginNotice && <p className="panel-notice">{adminLoginNotice}</p>}<p className="panel-footnote">The credentials are checked by the backend. No admin password is stored in this React app.</p></aside></div>}

      {panelOpen === 'admin' && <AdminDashboard catalog={catalog} adminOrders={adminOrders} adminOrdersLoading={adminOrdersLoading} adminOrdersNotice={adminOrdersNotice} refreshAdminOrders={loadAdminOrders} markOrderSeen={markOrderSeen} analytics={analytics} analyticsLoading={analyticsLoading} analyticsNotice={analyticsNotice} refreshAnalytics={loadAnalytics} adminAction={adminAction} setAdminAction={setAdminAction} adminForm={adminForm} updateAdminField={updateAdminField} existingProductId={existingProductId} setExistingProductId={setExistingProductId} adminImagePreview={adminImagePreview} handleAdminImage={handleAdminImage} submitAdminProduct={submitAdminProduct} adminNotice={adminNotice} signOutAdmin={signOutAdmin} close={() => setPanelOpen(null)} resetAdminFields={resetAdminFields} />}

      {selectedProduct && <ProductDetailPanel key={selectedProduct.id || selectedProduct.name} product={selectedProduct} catalog={catalog} onAdd={(product) => { setSelectedProduct(null); addToCart(product) }} close={() => setSelectedProduct(null)} />}

      {cartOpen && <div className="drawer-backdrop" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-header"><div><p className="eyebrow">Your selection</p><h2>Shopping bag <span>({cart.length})</span></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} type="button"><Icon name="close" /><span className="sr-only">Close bag</span></button></div>{cart.length > 0 ? <><div className="drawer-items">{cart.map((product, index) => <div className="drawer-item" key={`${product.name}-${index}`}><img alt={product.name} src={product.image} /><div><strong>{product.name}</strong><span>{product.category}</span><b>{formatPrice(product.price)}</b><button onClick={() => removeFromCart(index)} type="button">Remove</button></div></div>)}</div><div className="drawer-summary"><div><span>Subtotal</span><strong>{formatPrice(cart.reduce((total, product) => total + product.price, 0))}</strong></div><p>Shipping calculated at checkout.</p>{checkoutNotice && <p className="panel-notice">{checkoutNotice}</p>}<button className="button button-dark" disabled={isPlacingOrder} onClick={placeOrder} type="button">{isPlacingOrder ? 'Placing order…' : 'Checkout'} <Icon name="arrow" size={17} /></button></div></> : <div className="drawer-empty"><span className="drawer-empty-icon"><Icon name="bag" size={28} /></span><h3>Your bag is waiting.</h3><p>Add something considered to get started.</p><button className="button button-outline" onClick={() => setCartOpen(false)} type="button">Continue shopping</button></div>}</aside></div>}
    </main>
  )
}

export default App
