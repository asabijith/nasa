// Import Leaflet and D3 libraries
const L = window.L // Assuming Leaflet is loaded globally
const d3 = window.d3 // Assuming D3 is loaded globally
const calculateImpact = window.calculateImpact // Assuming calculateImpact is loaded globally

let impactMap,
  impactCircles = [],
  selectedLatLng = null

// Initialize Impact Map using Leaflet
function initImpactMap(containerId) {
  const container = document.getElementById(containerId)
  // Create the map
  impactMap = L.map(container, { worldCopyJump: true }).setView([20, 0], 2)
  // Add tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 8,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(impactMap)

  // Click to set impact location
  impactMap.on("click", async (e) => {
    selectedLatLng = e.latlng
    drawMarker()
    await recalcImpactIfReady()
  })
}

function drawMarker() {
  // Clear old marker
  if (impactCircles.length) {
    impactCircles.forEach((c) => impactMap.removeLayer(c))
    impactCircles = []
  }
  if (selectedLatLng) {
    // Small pin via circle marker
    const pin = L.circleMarker([selectedLatLng.lat, selectedLatLng.lng], { radius: 6, color: "#ff4444" }).addTo(
      impactMap,
    )
    impactCircles.push(pin)
  }
}

function getSelectedAsteroid() {
  const select = document.getElementById("asteroid-select")
  if (!select || !select.value || select.value === "loading") return null
  const opt = select.options[select.selectedIndex]
  return opt && opt.dataset && opt.dataset.asteroid ? JSON.parse(opt.dataset.asteroid) : null
}

async function recalcImpactIfReady() {
  const asteroid = getSelectedAsteroid()
  if (!asteroid || !selectedLatLng) return

  const angle = Number.parseFloat(document.getElementById("entry-angle").value || "45")
  const composition = document.getElementById("composition").value

  try {
    const result = await calculateImpact(asteroid, selectedLatLng.lat, selectedLatLng.lng, angle, composition)
    renderImpactDetails(result)
    drawImpactRings(result)
    updateConsequenceFromImpact(result)
  } catch (err) {
    console.error("[v0] Impact calc failed", err)
  }
}

function metersToKm(m) {
  return m / 1000.0
}

function drawImpactRings(result) {
  // Remove old rings but keep pin
  const keep = impactCircles.slice(0, 1)
  impactCircles.forEach((c, i) => {
    if (i > 0) impactMap.removeLayer(c)
  })
  impactCircles = keep

  if (!selectedLatLng) return

  const rings = []
  const blast = result.blast_effects || {}
  const thermal = result.thermal_effects || {}
  // Draw blast severe damage
  if (blast.severe_damage_radius) {
    rings.push({ r: metersToKm(blast.severe_damage_radius), color: "#ff4444" })
  }
  // Window breakage
  if (blast.window_breakage_radius) {
    rings.push({ r: metersToKm(blast.window_breakage_radius), color: "#ffbb33" })
  }
  // Thermal 3rd degree
  if (thermal.third_degree_burns) {
    rings.push({ r: metersToKm(thermal.third_degree_burns), color: "#ff66aa" })
  }

  rings.forEach((ring) => {
    const c = L.circle([selectedLatLng.lat, selectedLatLng.lng], {
      radius: ring.r * 1000, // Leaflet expects meters
      color: ring.color,
      weight: 2,
      fillOpacity: 0.08,
    }).addTo(impactMap)
    impactCircles.push(c)
  })
}

// Render details box
function renderImpactDetails(result) {
  const el = document.getElementById("impact-details")
  if (!el) return

  const crater = result.crater || {}
  const energy = result.energy || {}

  el.innerHTML = `
        <div class="stat">
            <strong>Impact Energy:</strong>
            ${energy.megatons?.toFixed(2) || 0} Mt TNT
        </div>
        <div class="stat">
            <strong>Crater (perm):</strong>
            ${crater.permanent_diameter ? crater.permanent_diameter.toFixed(0) : 0} m
        </div>
        <div class="stat">
            <strong>Crater (temp):</strong>
            ${crater.temporary_diameter ? crater.temporary_diameter.toFixed(0) : 0} m
        </div>
        <div class="stat">
            <strong>Ocean Impact:</strong>
            ${result.impact_location?.is_ocean ? "Yes" : "No"}
        </div>
    `
}

/* Consequence charts: very simple D3 bar charts with three series */

let populationChart, economicChart, climateChart

function initConsequenceCharts() {
  populationChart = makeBarChart("#population-chart", "People Affected (M)")
  economicChart = makeBarChart("#economic-chart", "Economic Loss (B$)")
  climateChart = makeBarChart("#climate-chart", "Aerosols Index")
  // Initial values
  updateConsequenceVisualizations(0)
}

function makeBarChart(selector, label) {
  const w = 280,
    h = 160,
    m = { top: 16, right: 12, bottom: 28, left: 12 }
  const svg = d3.select(selector).append("svg").attr("width", w).attr("height", h)
  svg.append("text").attr("x", 8).attr("y", 16).attr("fill", "#9aa4b2").attr("font-size", 12).text(label)

  const g = svg.append("g").attr("transform", `translate(${m.left}, ${m.top})`)
  const x = d3
    .scaleBand()
    .domain(["Local", "Regional", "Global"])
    .range([0, w - m.left - m.right])
    .padding(0.2)
  const y = d3
    .scaleLinear()
    .domain([0, 100])
    .range([h - m.top - m.bottom, 28])

  // axes baseline
  g.append("g")
    .attr("transform", `translate(0, ${h - m.top - m.bottom})`)
    .call(d3.axisBottom(x).tickSize(0))
    .selectAll("text")
    .attr("fill", "#9aa4b2")
  g.append("g")
    .call(
      d3
        .axisLeft(y)
        .ticks(3)
        .tickSize(-w + m.left + m.right),
    )
    .selectAll("text")
    .attr("fill", "#9aa4b2")

  const bars = g
    .selectAll(".bar")
    .data([0, 0, 0])
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d, i) => x(x.domain()[i]))
    .attr("width", x.bandwidth())
    .attr("y", y(0))
    .attr("height", y(0))
    .attr("fill", (d, i) => ["#4fc3f7", "#29b6f6", "#0288d1"][i])

  return {
    update: (values) => {
      const max = Math.max(100, d3.max(values) || 100)
      y.domain([0, max])
      bars
        .data(values)
        .transition()
        .duration(300)
        .attr("y", (d) => y(d))
        .attr("height", (d) => y(0) - y(d))
    },
  }
}

function updateConsequenceFromImpact(result) {
  const mt = result?.energy?.megatons || 0
  // Simple mapping to chart scales
  const pop = [mt * 0.1, mt * 0.3, mt * 0.02].map((v) => Math.min(v, 100))
  const econ = [mt * 0.05, mt * 0.2, mt * 0.01].map((v) => Math.min(v, 100))
  const climate = [mt * 0.02, mt * 0.05, mt * 0.1].map((v) => Math.min(v, 100))
  populationChart?.update(pop)
  economicChart?.update(econ)
  climateChart?.update(climate)
}

// Slider-driven consequence animation (0..100 → hours/days/months in main.js)
function updateConsequenceVisualizations(timeValue) {
  // Just shift values a bit with time to simulate evolution
  const scale = 1 + timeValue / 200
  populationChart?.update([20 * scale, 45 * scale, 5 * scale])
  economicChart?.update([10 * scale, 30 * scale, 2 * scale])
  climateChart?.update([5 * scale, 12 * scale, 30 * scale])
}
