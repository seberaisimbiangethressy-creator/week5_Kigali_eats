// Pure helpers shared by drills.js and the dashboard. None of them mutate their input.

export const orderTotal = ({ items }) =>
  items.reduce((sum, { price, qty }) => sum + price * qty, 0)

export const withTotals = (orders) =>
  orders.map((order) => ({ ...order, total: orderTotal(order) }))

export const deliveredOnly = (orders) =>
  orders.filter(({ status }) => status === "delivered")

export const totalRevenue = (orders) =>
  orders.reduce((sum, order) => sum + orderTotal(order), 0)

export const averageRating = (orders) => {
  const ratings = orders.map(({ rating }) => rating).filter((r) => r !== null)
  const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
  return Math.round(avg * 10) / 10
}

export const revenueByDistrict = (orders) =>
  deliveredOnly(orders).reduce(
    (acc, order) => ({
      ...acc,
      [order.customer.district]: (acc[order.customer.district] ?? 0) + orderTotal(order),
    }),
    {}
  )

// Cancelled orders never reached the customer, so they don't count as "sold".
export const topItems = (orders, n = 3) => {
  const qtyByName = orders
    .filter(({ status }) => status !== "cancelled")
    .flatMap(({ items }) => items)
    .reduce((acc, { name, qty }) => ({ ...acc, [name]: (acc[name] ?? 0) + qty }), {})
  return Object.entries(qtyByName)
    .map(([name, qty]) => ({ name, qty }))
    .toSorted((a, b) => b.qty - a.qty)
    .slice(0, n)
}

// ---- Station 4: immutable updates ----

export const markDelivered = (orders, id) =>
  orders.map((o) => (o.id === id && o.status === "pending" ? { ...o, status: "delivered" } : o))

export const rateOrder = (orders, id, rating) => {
  const target = orders.find((o) => o.id === id)
  if (target?.status !== "delivered") return orders // not allowed: same array back
  return orders.map((o) => (o.id === id ? { ...o, rating } : o))
}

export const changeDistrict = (orders, id, district) =>
  orders.map((o) => (o.id === id ? { ...o, customer: { ...o.customer, district } } : o))

export const addItem = (orders, id, item) =>
  orders.map((o) => (o.id === id ? { ...o, items: [...o.items, item] } : o))

export const removeCancelled = (orders) =>
  orders.filter(({ status }) => status !== "cancelled")

export const applyDiscount = (orders, percent) =>
  orders.map((o) => ({
    ...o,
    items: o.items.map((item) => ({
      ...item,
      price: Math.round(item.price * (1 - percent / 100)),
    })),
  }))
