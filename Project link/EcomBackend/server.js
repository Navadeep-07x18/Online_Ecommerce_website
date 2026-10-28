require('dotenv').config()
const crypto = require('crypto')
const express = require('express')
const cors = require('cors')
const mysql = require('mysql')
const demoProducts = require('./demo-products')

const app = express()
const port = Number(process.env.PORT || 5000)
const tokenSecret = process.env.TOKEN_SECRET || 'local-development-secret-change-me'
const allowedOrigins = String(process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'luxe_store',
})

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true)
    return callback(null, false)
  },
}))
app.use(express.json({ limit: '8mb' }))

const query = (sql, values = []) => new Promise((resolve, reject) => {
  pool.query(sql, values, (error, results) => {
    if (error) reject(error)
    else resolve(results)
  })
})

const getConnection = () => new Promise((resolve, reject) => {
  pool.getConnection((error, connection) => {
    if (error) reject(error)
    else resolve(connection)
  })
})

const connectionQuery = (connection, sql, values = []) => new Promise((resolve, reject) => {
  connection.query(sql, values, (error, results) => {
    if (error) reject(error)
    else resolve(results)
  })
})

const beginTransaction = (connection) => new Promise((resolve, reject) => {
  connection.beginTransaction((error) => (error ? reject(error) : resolve()))
})

const commitTransaction = (connection) => new Promise((resolve, reject) => {
  connection.commit((error) => (error ? reject(error) : resolve()))
})

const rollbackTransaction = (connection) => new Promise((resolve) => {
  connection.rollback(() => resolve())
})

const inTransaction = async (work) => {
  const connection = await getConnection()
  try {
    await beginTransaction(connection)
    const result = await work((sql, values) => connectionQuery(connection, sql, values))
    await commitTransaction(connection)
    return result
  } catch (error) {
    await rollbackTransaction(connection)
    throw error
  } finally {
    connection.release()
  }
}

const createRequestError = (message, status = 400) => Object.assign(new Error(message), { status })

const ensureColumn = async (tableName, columnName, definition) => {
  const rows = await query(`SELECT COUNT(*) AS count FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`, [tableName, columnName])
  if (Number(rows[0].count) === 0) await query(`ALTER TABLE ${tableName} ADD COLUMN ${definition}`)
}

const normalizeAddress = (address = {}) => ({
  name: String(address.name || '').trim(),
  phone: String(address.phone || '').trim(),
  line1: String(address.line1 || '').trim(),
  city: String(address.city || '').trim(),
  state: String(address.state || '').trim(),
  postalCode: String(address.postalCode || '').trim(),
})

const validateAddress = (address) => Object.values(address).every(Boolean)

const getAddresses = async (userId) => query(`SELECT id, name, phone, line1, city, state,
  postal_code AS postalCode, is_default AS isDefault
  FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC, id DESC`, [userId])

const attachOrderItems = async (orders) => {
  if (orders.length === 0) return []

  const orderIds = orders.map((order) => order.id)
  const items = await query(`SELECT order_id AS orderId, product_id AS productId, product_name AS name,
    category, image_url AS image, unit_price AS price, quantity, line_total AS total
    FROM order_items WHERE order_id IN (?) ORDER BY id ASC`, [orderIds])
  const itemsByOrderId = new Map()

  for (const item of items) {
    const currentItems = itemsByOrderId.get(item.orderId) || []
    currentItems.push({ ...item, price: Number(item.price), total: Number(item.total) })
    itemsByOrderId.set(item.orderId, currentItems)
  }

  return orders.map((order) => ({
    ...order,
    total: Number(order.total),
    items: itemsByOrderId.get(order.id) || [],
  }))
}

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${hash}`
}

const verifyPassword = (password, storedHash) => {
  const [algorithm, salt, expectedHash] = String(storedHash).split('$')
  if (algorithm !== 'scrypt' || !salt || !expectedHash) return false

  const actualHash = crypto.scryptSync(password, salt, 64).toString('hex')
  const expected = Buffer.from(expectedHash, 'hex')
  const actual = Buffer.from(actualHash, 'hex')
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
}

const createToken = (user) => {
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 8,
  })).toString('base64url')
  const signature = crypto.createHmac('sha256', tokenSecret).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

const verifyToken = (token) => {
  const [payload, signature] = String(token || '').split('.')
  if (!payload || !signature) return null
  const expectedSignature = crypto.createHmac('sha256', tokenSecret).update(payload).digest('base64url')
  const actual = Buffer.from(signature)
  const expected = Buffer.from(expectedSignature)
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return decoded.exp > Date.now() ? decoded : null
  } catch {
    return null
  }
}

const requireAdmin = (request, response, next) => {
  const authorization = request.headers.authorization || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  const user = verifyToken(token)
  if (!user || user.role !== 'admin') return response.status(401).json({ message: 'Admin authentication required.' })
  request.user = user
  return next()
}

const requireAuth = (request, response, next) => {
  const authorization = request.headers.authorization || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  const user = verifyToken(token)
  if (!user) return response.status(401).json({ message: 'Authentication required.' })
  request.user = user
  return next()
}

const ensureSchema = async () => {
  await query(`CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL,
    phone VARCHAR(30) NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
  ) ENGINE=InnoDB`)

  await query(`CREATE TABLE IF NOT EXISTS products (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(180) NOT NULL,
    brand VARCHAR(120) NOT NULL DEFAULT 'LUXE',
    category VARCHAR(80) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 0,
    rating DECIMAL(2, 1) NOT NULL DEFAULT 0,
    reviews INT UNSIGNED NOT NULL DEFAULT 0,
    tag VARCHAR(80) NOT NULL DEFAULT 'New arrival',
    image_url LONGTEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_products_category (category),
    KEY idx_products_created_at (created_at)
  ) ENGINE=InnoDB`)

  await ensureColumn('products', 'description', 'description TEXT NULL')
  await ensureColumn('products', 'specifications', 'specifications LONGTEXT NULL')
  await ensureColumn('products', 'gallery', 'gallery LONGTEXT NULL')

  await query(`CREATE TABLE IF NOT EXISTS addresses (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    line1 VARCHAR(255) NOT NULL,
    city VARCHAR(120) NOT NULL,
    state VARCHAR(120) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_addresses_user_default (user_id, is_default),
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  ) ENGINE=InnoDB`)

  await query(`CREATE TABLE IF NOT EXISTS orders (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'placed',
    total DECIMAL(12, 2) NOT NULL,
    item_count INT UNSIGNED NOT NULL,
    shipping_name VARCHAR(120) NOT NULL,
    shipping_phone VARCHAR(30) NOT NULL,
    shipping_line1 VARCHAR(255) NOT NULL,
    shipping_city VARCHAR(120) NOT NULL,
    shipping_state VARCHAR(120) NOT NULL,
    shipping_postal_code VARCHAR(20) NOT NULL,
    admin_seen_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_orders_user_created (user_id, created_at),
    KEY idx_orders_admin_seen (admin_seen_at, created_at),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id)
  ) ENGINE=InnoDB`)

  await query(`CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    product_name VARCHAR(180) NOT NULL,
    category VARCHAR(80) NOT NULL,
    image_url LONGTEXT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    line_total DECIMAL(12, 2) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_order_items_order (order_id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id)
  ) ENGINE=InnoDB`)

  const productCount = await query('SELECT COUNT(*) AS count FROM products')
  if (Number(productCount[0].count) === 0) {
    for (const product of demoProducts) {
      await query(`INSERT INTO products (name, brand, category, price, quantity, rating, reviews, tag, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        product.name,
        'LUXE',
        product.category,
        product.price,
        product.quantity,
        product.rating,
        product.reviews,
        product.tag,
        product.image,
      ])
    }
    console.log(`Inserted ${demoProducts.length} demo products.`)
  }

  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const adminPassword = String(process.env.ADMIN_PASSWORD || '')
  if (!adminEmail || !adminPassword) return

  const existing = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [adminEmail])
  if (existing.length === 0) {
    await query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [
      'LUXE Admin',
      adminEmail,
      hashPassword(adminPassword),
      'admin',
    ])
  } else {
    await query('UPDATE users SET role = \'admin\' WHERE email = ?', [adminEmail])
  }
}

app.get('/api/health', async (_request, response) => {
  try {
    await query('SELECT 1 AS ok')
    return response.json({ ok: true, database: true })
  } catch (error) {
    return response.status(503).json({ ok: false, database: false, message: error.code || 'Database unavailable.' })
  }
})

app.get('/api/products', async (_request, response) => {
  try {
    const rows = await query(`SELECT id, name, brand, category, price, quantity, rating, reviews, tag,
      image_url AS image, description, specifications, gallery
      FROM products ORDER BY created_at DESC, id DESC`)
    return response.json(rows)
  } catch (error) {
    return response.status(500).json({ message: 'Could not load products.', code: error.code })
  }
})

app.get('/api/products/:id', async (request, response) => {
  const productId = Number(request.params.id)
  if (!Number.isInteger(productId) || productId <= 0) return response.status(400).json({ message: 'A valid product is required.' })

  try {
    const rows = await query(`SELECT id, name, brand, category, price, quantity, rating, reviews, tag,
      image_url AS image, description, specifications, gallery
      FROM products WHERE id = ? LIMIT 1`, [productId])
    if (rows.length === 0) return response.status(404).json({ message: 'Product not found.' })
    return response.json(rows[0])
  } catch (error) {
    return response.status(500).json({ message: 'Could not load the product.', code: error.code })
  }
})

app.post('/api/auth/register', async (request, response) => {
  const name = String(request.body.name || '').trim()
  const email = String(request.body.email || '').trim().toLowerCase()
  const phone = String(request.body.phone || '').trim()
  const password = String(request.body.password || '')

  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6) {
    return response.status(400).json({ message: 'Enter a valid name, email, and password of at least 6 characters.' })
  }

  try {
    const existing = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [email])
    if (existing.length > 0) return response.status(409).json({ message: 'An account with this email already exists.' })

    const result = await query('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)', [
      name,
      email,
      phone || null,
      hashPassword(password),
      'customer',
    ])
    return response.status(201).json({
      message: 'Account created successfully.',
      token: createToken({ id: result.insertId, email, role: 'customer' }),
      user: { id: result.insertId, name, email, phone, role: 'customer' },
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return response.status(409).json({ message: 'An account with this email already exists.' })
    return response.status(500).json({ message: 'Could not create the account.', code: error.code })
  }
})

app.post('/api/auth/login', async (request, response) => {
  const email = String(request.body.email || '').trim().toLowerCase()
  const password = String(request.body.password || '')
  if (!email || !password) return response.status(400).json({ message: 'Email and password are required.' })

  try {
    const rows = await query('SELECT id, name, email, phone, role, password_hash FROM users WHERE email = ? LIMIT 1', [email])
    const user = rows[0]
    if (!user || !verifyPassword(password, user.password_hash)) {
      return response.status(401).json({ message: 'Invalid email or password.' })
    }
    return response.json({
      token: createToken(user),
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    })
  } catch (error) {
    return response.status(500).json({ message: 'Could not sign in.', code: error.code })
  }
})

app.get('/api/auth/me', requireAuth, async (request, response) => {
  try {
    const rows = await query('SELECT id, name, email, phone, role FROM users WHERE id = ? LIMIT 1', [request.user.id])
    if (rows.length === 0) return response.status(401).json({ message: 'Account no longer exists.' })
    return response.json({ user: rows[0] })
  } catch (error) {
    return response.status(500).json({ message: 'Could not validate the session.', code: error.code })
  }
})

app.get('/api/account/profile', requireAuth, async (request, response) => {
  try {
    const rows = await query('SELECT id, name, email, phone, role FROM users WHERE id = ? LIMIT 1', [request.user.id])
    if (rows.length === 0) return response.status(401).json({ message: 'Account no longer exists.' })
    return response.json({ profile: rows[0], addresses: await getAddresses(request.user.id) })
  } catch (error) {
    return response.status(500).json({ message: 'Could not load account settings.', code: error.code })
  }
})

app.patch('/api/account/profile', requireAuth, async (request, response) => {
  const name = String(request.body.name || '').trim()
  const phone = String(request.body.phone || '').trim()
  if (name.length < 2) return response.status(400).json({ message: 'Enter a name with at least 2 characters.' })

  try {
    await query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone || null, request.user.id])
    const rows = await query('SELECT id, name, email, phone, role FROM users WHERE id = ? LIMIT 1', [request.user.id])
    return response.json({ profile: rows[0] })
  } catch (error) {
    return response.status(500).json({ message: 'Could not update your profile.', code: error.code })
  }
})

app.patch('/api/account/password', requireAuth, async (request, response) => {
  const currentPassword = String(request.body.currentPassword || '')
  const newPassword = String(request.body.newPassword || '')
  if (newPassword.length < 6) return response.status(400).json({ message: 'Your new password must be at least 6 characters.' })

  try {
    const rows = await query('SELECT password_hash FROM users WHERE id = ? LIMIT 1', [request.user.id])
    if (rows.length === 0 || !verifyPassword(currentPassword, rows[0].password_hash)) {
      return response.status(401).json({ message: 'Your current password is incorrect.' })
    }
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [hashPassword(newPassword), request.user.id])
    return response.json({ message: 'Password updated successfully.' })
  } catch (error) {
    return response.status(500).json({ message: 'Could not update your password.', code: error.code })
  }
})

app.post('/api/account/addresses', requireAuth, async (request, response) => {
  const address = normalizeAddress(request.body)
  if (!validateAddress(address)) return response.status(400).json({ message: 'Enter every delivery address field.' })

  try {
    await inTransaction(async (transactionQuery) => {
      const rows = await transactionQuery('SELECT id FROM addresses WHERE user_id = ? AND is_default = 1', [request.user.id])
      const isDefault = Boolean(request.body.isDefault) || rows.length === 0
      if (isDefault) await transactionQuery('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [request.user.id])
      await transactionQuery(`INSERT INTO addresses (user_id, name, phone, line1, city, state, postal_code, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [request.user.id, address.name, address.phone, address.line1, address.city, address.state, address.postalCode, isDefault ? 1 : 0])
    })
    return response.status(201).json({ addresses: await getAddresses(request.user.id) })
  } catch (error) {
    return response.status(500).json({ message: 'Could not save your address.', code: error.code })
  }
})

app.patch('/api/account/addresses/:id', requireAuth, async (request, response) => {
  const addressId = Number(request.params.id)
  const address = normalizeAddress(request.body)
  if (!Number.isInteger(addressId) || addressId <= 0 || !validateAddress(address)) {
    return response.status(400).json({ message: 'Enter a valid, complete delivery address.' })
  }

  try {
    const result = await inTransaction(async (transactionQuery) => {
      const addresses = await transactionQuery('SELECT id FROM addresses WHERE id = ? AND user_id = ? FOR UPDATE', [addressId, request.user.id])
      if (addresses.length === 0) throw createRequestError('Address not found.', 404)
      if (Boolean(request.body.isDefault)) await transactionQuery('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [request.user.id])
      return transactionQuery(`UPDATE addresses SET name = ?, phone = ?, line1 = ?, city = ?, state = ?, postal_code = ?,
        is_default = CASE WHEN ? THEN 1 ELSE is_default END WHERE id = ? AND user_id = ?`, [
        address.name, address.phone, address.line1, address.city, address.state, address.postalCode,
        Boolean(request.body.isDefault), addressId, request.user.id,
      ])
    })
    if (result.affectedRows === 0) return response.status(404).json({ message: 'Address not found.' })
    return response.json({ addresses: await getAddresses(request.user.id) })
  } catch (error) {
    if (error.status) return response.status(error.status).json({ message: error.message })
    return response.status(500).json({ message: 'Could not update your address.', code: error.code })
  }
})

app.delete('/api/account/addresses/:id', requireAuth, async (request, response) => {
  const addressId = Number(request.params.id)
  if (!Number.isInteger(addressId) || addressId <= 0) return response.status(400).json({ message: 'A valid address is required.' })

  try {
    await inTransaction(async (transactionQuery) => {
      const rows = await transactionQuery('SELECT id, is_default AS isDefault FROM addresses WHERE id = ? AND user_id = ? FOR UPDATE', [addressId, request.user.id])
      if (rows.length === 0) throw createRequestError('Address not found.', 404)
      await transactionQuery('DELETE FROM addresses WHERE id = ? AND user_id = ?', [addressId, request.user.id])
      if (rows[0].isDefault) {
        const nextAddress = await transactionQuery('SELECT id FROM addresses WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 1', [request.user.id])
        if (nextAddress.length > 0) await transactionQuery('UPDATE addresses SET is_default = 1 WHERE id = ?', [nextAddress[0].id])
      }
    })
    return response.json({ addresses: await getAddresses(request.user.id) })
  } catch (error) {
    if (error.status) return response.status(error.status).json({ message: error.message })
    return response.status(500).json({ message: 'Could not remove your address.', code: error.code })
  }
})

app.post('/api/auth/admin/login', async (request, response) => {
  const email = String(request.body.email || '').trim().toLowerCase()
  const password = String(request.body.password || '')
  if (!email || !password) return response.status(400).json({ message: 'Email and password are required.' })

  try {
    const rows = await query('SELECT id, name, email, role, password_hash FROM users WHERE email = ? LIMIT 1', [email])
    const user = rows[0]
    if (!user || user.role !== 'admin' || !verifyPassword(password, user.password_hash)) {
      return response.status(401).json({ message: 'Invalid admin credentials.' })
    }
    return response.json({ token: createToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    return response.status(500).json({ message: 'Could not sign in.', code: error.code })
  }
})

app.get('/api/auth/admin/me', requireAdmin, async (request, response) => {
  return response.json({ user: request.user })
})

app.get('/api/admin/analytics', requireAdmin, async (_request, response) => {
  try {
    const summaryRows = await query(`SELECT
      COUNT(*) AS totalOrders,
      COALESCE(SUM(total), 0) AS revenue,
      COALESCE(SUM(DATE(created_at) = CURDATE()), 0) AS ordersToday,
      COALESCE(SUM(CASE WHEN DATE(created_at) = CURDATE() THEN total ELSE 0 END), 0) AS revenueToday,
      COALESCE(SUM(status = 'placed'), 0) AS pendingOrders
      FROM orders WHERE status <> 'cancelled'`)
    const topProducts = await query(`SELECT oi.product_id AS id, oi.product_name AS name, oi.category,
      MAX(oi.image_url) AS image, SUM(oi.quantity) AS unitsSold, SUM(oi.line_total) AS revenue
      FROM order_items oi INNER JOIN orders o ON o.id = oi.order_id
      WHERE o.status <> 'cancelled'
      GROUP BY oi.product_id, oi.product_name, oi.category
      ORDER BY unitsSold DESC, revenue DESC LIMIT 5`)
    const lowStock = await query(`SELECT id, name, category, quantity, image_url AS image
      FROM products WHERE quantity <= 5 ORDER BY quantity ASC, name ASC LIMIT 5`)
    const summary = summaryRows[0]
    return response.json({
      summary: Object.fromEntries(Object.entries(summary).map(([key, value]) => [key, Number(value)])),
      topProducts: topProducts.map((product) => ({ ...product, unitsSold: Number(product.unitsSold), revenue: Number(product.revenue) })),
      lowStock: lowStock.map((product) => ({ ...product, quantity: Number(product.quantity) })),
    })
  } catch (error) {
    return response.status(500).json({ message: 'Could not load analytics.', code: error.code })
  }
})

app.post('/api/orders', requireAuth, async (request, response) => {
  const requestedItems = Array.isArray(request.body.items) ? request.body.items : []
  const address = request.body.address || {}
  const shippingAddress = {
    name: String(address.name || '').trim(),
    phone: String(address.phone || '').trim(),
    line1: String(address.line1 || '').trim(),
    city: String(address.city || '').trim(),
    state: String(address.state || '').trim(),
    postalCode: String(address.postalCode || '').trim(),
  }

  if (requestedItems.length === 0 || Object.values(shippingAddress).some((value) => !value)) {
    return response.status(400).json({ message: 'Add at least one item and a complete delivery address before placing an order.' })
  }

  const quantitiesByProductId = new Map()
  for (const item of requestedItems) {
    const productId = Number(item.productId)
    const quantity = Number(item.quantity)
    if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
      return response.status(400).json({ message: 'Each order item must include a valid product and quantity.' })
    }
    quantitiesByProductId.set(productId, (quantitiesByProductId.get(productId) || 0) + quantity)
  }

  try {
    const result = await inTransaction(async (transactionQuery) => {
      const items = []
      for (const [productId, quantity] of [...quantitiesByProductId.entries()].sort(([firstId], [secondId]) => firstId - secondId)) {
        const products = await transactionQuery(`SELECT id, name, category, price, quantity, image_url AS image
          FROM products WHERE id = ? FOR UPDATE`, [productId])
        const product = products[0]
        if (!product) throw createRequestError('One of the items in your bag is no longer available.', 404)
        if (Number(product.quantity) < quantity) {
          throw createRequestError(`${product.name} only has ${product.quantity} available. Please update your bag.`, 409)
        }

        items.push({
          productId: product.id,
          name: product.name,
          category: product.category,
          image: product.image,
          price: Number(product.price),
          quantity,
          total: Number(product.price) * quantity,
          availableQuantity: Number(product.quantity) - quantity,
        })
      }

      const total = items.reduce((sum, item) => sum + item.total, 0)
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
      const orderResult = await transactionQuery(`INSERT INTO orders (
        user_id, status, total, item_count, shipping_name, shipping_phone, shipping_line1,
        shipping_city, shipping_state, shipping_postal_code
      ) VALUES (?, 'placed', ?, ?, ?, ?, ?, ?, ?, ?)`, [
        request.user.id,
        total,
        itemCount,
        shippingAddress.name,
        shippingAddress.phone,
        shippingAddress.line1,
        shippingAddress.city,
        shippingAddress.state,
        shippingAddress.postalCode,
      ])

      for (const item of items) {
        await transactionQuery(`INSERT INTO order_items (
          order_id, product_id, product_name, category, image_url, unit_price, quantity, line_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
          orderResult.insertId,
          item.productId,
          item.name,
          item.category,
          item.image || null,
          item.price,
          item.quantity,
          item.total,
        ])
        await transactionQuery('UPDATE products SET quantity = quantity - ? WHERE id = ?', [item.quantity, item.productId])
      }

      return { orderId: orderResult.insertId, itemCount, items, total }
    })

    const orders = await query(`SELECT id, status, total, item_count AS itemCount, created_at AS createdAt,
      admin_seen_at AS adminSeenAt FROM orders WHERE id = ?`, [result.orderId])
    const [order] = await attachOrderItems(orders)
    return response.status(201).json({ order, inventory: result.items.map((item) => ({ id: item.productId, quantity: item.availableQuantity })) })
  } catch (error) {
    if (error.status) return response.status(error.status).json({ message: error.message })
    return response.status(500).json({ message: 'Could not place your order.', code: error.code })
  }
})

app.get('/api/orders', requireAuth, async (request, response) => {
  try {
    const orders = await query(`SELECT id, status, total, item_count AS itemCount, created_at AS createdAt
      FROM orders WHERE user_id = ? ORDER BY created_at DESC, id DESC`, [request.user.id])
    return response.json({ orders: await attachOrderItems(orders) })
  } catch (error) {
    return response.status(500).json({ message: 'Could not load your orders.', code: error.code })
  }
})

app.get('/api/admin/orders', requireAdmin, async (_request, response) => {
  try {
    const rows = await query(`SELECT o.id, o.status, o.total, o.item_count AS itemCount,
      o.shipping_name AS shippingName, o.shipping_phone AS shippingPhone,
      o.shipping_line1 AS shippingLine1, o.shipping_city AS shippingCity,
      o.shipping_state AS shippingState, o.shipping_postal_code AS shippingPostalCode,
      o.admin_seen_at AS adminSeenAt, o.created_at AS createdAt,
      u.name AS customerName, u.email AS customerEmail
      FROM orders o INNER JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC, o.id DESC`)
    const orders = rows.map((order) => ({
      ...order,
      customer: { name: order.customerName, email: order.customerEmail },
    }))
    const ordersWithItems = await attachOrderItems(orders)
    return response.json({
      orders: ordersWithItems,
      unseenCount: ordersWithItems.filter((order) => !order.adminSeenAt).length,
    })
  } catch (error) {
    return response.status(500).json({ message: 'Could not load orders.', code: error.code })
  }
})

app.patch('/api/admin/orders/:id/seen', requireAdmin, async (request, response) => {
  const orderId = Number(request.params.id)
  if (!Number.isInteger(orderId) || orderId <= 0) return response.status(400).json({ message: 'A valid order is required.' })

  try {
    const result = await query('UPDATE orders SET admin_seen_at = COALESCE(admin_seen_at, CURRENT_TIMESTAMP) WHERE id = ?', [orderId])
    if (result.affectedRows === 0) return response.status(404).json({ message: 'Order not found.' })
    const rows = await query('SELECT admin_seen_at AS adminSeenAt FROM orders WHERE id = ?', [orderId])
    return response.json({ id: orderId, adminSeenAt: rows[0].adminSeenAt })
  } catch (error) {
    return response.status(500).json({ message: 'Could not update order notification.', code: error.code })
  }
})

app.post('/api/admin/products', requireAdmin, async (request, response) => {
  const name = String(request.body.name || '').trim()
  const brand = String(request.body.brand || 'LUXE').trim()
  const category = String(request.body.category || '').trim()
  const price = Number(request.body.price)
  const quantity = Number(request.body.quantity)
  const tag = String(request.body.tag || 'New arrival').trim()
  const image = String(request.body.image || '').trim()

  if (!name || !category || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 0) {
    return response.status(400).json({ message: 'Name, category, valid price, and whole-number quantity are required.' })
  }

  try {
    const result = await query(`INSERT INTO products (name, brand, category, price, quantity, tag, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)`, [name, brand, category, price, quantity, tag, image || null])
    const rows = await query(`SELECT id, name, brand, category, price, quantity, rating, reviews, tag,
      image_url AS image FROM products WHERE id = ?`, [result.insertId])
    return response.status(201).json(rows[0])
  } catch (error) {
    return response.status(500).json({ message: 'Could not add product.', code: error.code })
  }
})

app.patch('/api/admin/products/:id/quantity', requireAdmin, async (request, response) => {
  const productId = Number(request.params.id)
  const quantityToAdd = Number(request.body.quantity)

  if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantityToAdd) || quantityToAdd <= 0) {
    return response.status(400).json({ message: 'A valid product and a positive whole-number quantity are required.' })
  }

  try {
    const result = await query('UPDATE products SET quantity = quantity + ? WHERE id = ?', [quantityToAdd, productId])
    if (result.affectedRows === 0) return response.status(404).json({ message: 'Product not found.' })

    const rows = await query(`SELECT id, name, brand, category, price, quantity, rating, reviews, tag,
      image_url AS image FROM products WHERE id = ?`, [productId])
    return response.json(rows[0])
  } catch (error) {
    return response.status(500).json({ message: 'Could not increase product quantity.', code: error.code })
  }
})

app.use((_request, response) => response.status(404).json({ message: 'Route not found.' }))

app.listen(port, async () => {
  console.log(`LUXE backend listening on http://127.0.0.1:${port}`)
  try {
    await ensureSchema()
    console.log('Database schema ready.')
  } catch (error) {
    console.error(`Database setup failed: ${error.code || error.message}`)
  }
})
