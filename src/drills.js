import { orders } from "./data.js"
import {
  orderTotal, withTotals, deliveredOnly, averageRating, revenueByDistrict, topItems,
  markDelivered, rateOrder, changeDistrict, addItem, removeCancelled, applyDiscount,
} from "./helpers.js"

const ORIGINAL = JSON.stringify(orders)
const untouched = () => console.log("Untouched?", JSON.stringify(orders) === ORIGINAL)
const show = (label, value) => console.log(`\n${label}`, value)

// ───────── Station 1 — map, filter, find ─────────
console.log("=== Station 1 ===")
show("1. ids", orders.map(({ id }) => id))
show("2. customer names", orders.map(({ customer: { name } }) => name))
show("3. delivered", deliveredOnly(orders).map(({ id }) => id))
show("4. Gasabo", orders.filter(({ customer: { district } }) => district === "Gasabo").map(({ id }) => id))
show("5. order 106", orders.find(({ id }) => id === 106))
// Careful: null <= 3 is TRUE in JS, so we must rule out null first.
show("6. any rating <= 3?", orders.some(({ rating }) => rating !== null && rating <= 3))
show("7. all pending unrated?", orders.filter(({ status }) => status === "pending").every(({ rating }) => rating === null))
show("8. unique names", [...new Set(orders.map(({ customer: { name } }) => name))])
untouched()

// ───────── Station 2 — reduce ─────────
console.log("\n=== Station 2 ===")
const ordersWithTotals = withTotals(orders)
show("9. totals", ordersWithTotals.map(({ id, total }) => ({ id, total })))
show("10. delivered revenue", deliveredOnly(orders).reduce((sum, o) => sum + orderTotal(o), 0))
show("11. average rating", averageRating(orders))
show(
  "12. Brochettes sold",
  orders.flatMap(({ items }) => items).filter(({ name }) => name === "Brochette").reduce((sum, { qty }) => sum + qty, 0)
)
show("13. most expensive order", ordersWithTotals.reduce((max, o) => (o.total > max.total ? o : max)).id)
show("14. orders per status", orders.reduce((acc, { status }) => ({ ...acc, [status]: (acc[status] ?? 0) + 1 }), {}))
untouched()

// ───────── Station 3 — grouping & ranking ─────────
console.log("\n=== Station 3 ===")
show("15. revenue per district", revenueByDistrict(orders))

// Revenue here counts every order that day, including cancelled/pending ones.
const byDate = Object.groupBy(orders, ({ date }) => date)
show(
  "16. by date",
  Object.entries(byDate).map(([date, list]) => ({
    date,
    count: list.length,
    revenue: list.reduce((sum, o) => sum + orderTotal(o), 0),
  }))
)
show("17. top 3 items", topItems(orders, 3))

const spentByCustomer = orders.reduce((acc, o) => {
  const { name } = o.customer
  const { orders: count = 0, spent = 0 } = acc[name] ?? {}
  return { ...acc, [name]: { orders: count + 1, spent: spent + (o.status === "delivered" ? orderTotal(o) : 0) } }
}, {})
show(
  "18. customers by spent (delivered only)",
  Object.entries(spentByCustomer)
    .map(([name, { orders, spent }]) => ({ name, orders, spent }))
    .toSorted((a, b) => b.spent - a.spent)
)
show(
  "19. price list",
  Object.fromEntries(orders.flatMap(({ items }) => items).map(({ name, price }) => [name, price]))
)
untouched()

// ───────── Station 4 — immutable updates ─────────
console.log("\n=== Station 4 ===")
const a = markDelivered(orders, 105)
show("20. markDelivered(105)", a.find(({ id }) => id === 105).status)
show("21a. rate delivered #101 → 2", rateOrder(orders, 101, 2).find(({ id }) => id === 101).rating)
show("21b. rate pending #105 → 1 (unchanged)", rateOrder(orders, 105, 1) === orders ? "same array" : rateOrder(orders, 105, 1).find(({ id }) => id === 105).rating)
show("22. changeDistrict(101, Kicukiro)", changeDistrict(orders, 101, "Kicukiro").find(({ id }) => id === 101).customer)
show("23. addItem(102, Fanta)", addItem(orders, 102, { name: "Fanta", price: 700, qty: 1 }).find(({ id }) => id === 102).items)
show("24. removeCancelled count", removeCancelled(orders).length)
show("25. applyDiscount(10) order 101", applyDiscount(orders, 10).find(({ id }) => id === 101).items)
untouched()
