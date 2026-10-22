import "./style.css"
import { orders } from "./data.js"
import {
  orderTotal, withTotals, deliveredOnly, totalRevenue, averageRating, revenueByDistrict, topItems,
} from "./helpers.js"

// NOTE: innerHTML is acceptable in this file because every string comes from our own
// data.js. If any value came from users or an API, use textContent or escape it first.

// Full class names so Tailwind can detect them at build time.
const STATUS_CLASSES = {
  delivered: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  cancelled: "bg-red-100 text-red-800",
}
const FILTERS = ["all", "delivered", "pending", "cancelled"]

// ── state → render (Week 4 pattern) ──
const state = { filter: "all" }

const fmt = (n) => n.toLocaleString("en-US")
const label = (s) => s[0].toUpperCase() + s.slice(1)

const renderStats = () => {
  const delivered = deliveredOnly(orders)
  const [best] = topItems(orders, 1)
  const cards = [
    ["Total revenue", `${fmt(totalRevenue(delivered))} RWF`],
    ["Delivered orders", delivered.length],
    ["Average rating", `${averageRating(orders)} / 5`],
    ["Best-selling item", `${best.name} (${best.qty})`],
  ]
  document.querySelector("#stats").innerHTML = cards
    .map(([title, value]) => `
      <div class="rounded-lg border border-stone-200 bg-white p-5">
        <p class="text-sm text-stone-500">${title}</p>
        <p class="mt-1 text-2xl font-bold">${value}</p>
      </div>`)
    .join("")
}

const renderDistricts = () => {
  const entries = Object.entries(revenueByDistrict(orders))
  const max = Math.max(...entries.map(([, value]) => value))
  document.querySelector("#districts").innerHTML = entries
    .map(([district, value]) => `
      <div>
        <div class="mb-1 flex justify-between text-sm"><span>${district}</span><span>${fmt(value)} RWF</span></div>
        <div class="h-3 rounded bg-stone-100">
          <div class="h-3 rounded bg-emerald-600" style="width: ${(value / max) * 100}%"></div>
        </div>
      </div>`)
    .join("")
}

const renderFilters = () => {
  document.querySelector("#filters").innerHTML = FILTERS
    .map((f) => {
      const active = f === state.filter
      const cls = active ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
      return `<button data-filter="${f}" aria-pressed="${active}" class="rounded-full px-4 py-1.5 text-sm font-medium ${cls}">${label(f)}</button>`
    })
    .join("")
}

const renderTable = () => {
  const visible = withTotals(orders).filter(({ status }) => state.filter === "all" || status === state.filter)
  document.querySelector("#rows").innerHTML = visible.length
    ? visible
        .map(({ id, customer: { name, district }, total, status }) => `
          <tr class="border-b border-stone-100 last:border-0">
            <td class="py-2.5 pr-4 font-medium">#${id}</td>
            <td class="pr-4">${name}</td>
            <td class="pr-4">${district}</td>
            <td class="pr-4 text-right tabular-nums">${total.toLocaleString()}</td>
            <td><span class="rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}">${label(status)}</span></td>
          </tr>`)
        .join("")
    : `<tr><td colspan="5" class="py-6 text-center text-stone-500">No ${state.filter} orders.</td></tr>`
}

const render = () => {
  renderFilters()
  renderTable()
}

document.querySelector("#filters").addEventListener("click", ({ target }) => {
  const btn = target.closest("[data-filter]")
  if (!btn) return
  state.filter = btn.dataset.filter
  render()
})

renderStats()
renderDistricts()
render()
