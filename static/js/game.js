let gameState = {
  running: false,
  budget: 1000, // million $
  years: 10,
  score: 0,
}

function initGameVisualization(containerId) {
  const container = document.getElementById(containerId)
  // Minimal canvas backdrop
  const canvas = document.createElement("canvas")
  canvas.width = container.clientWidth
  canvas.height = container.clientHeight
  container.appendChild(canvas)

  const ctx = canvas.getContext("2d")
  drawScene(ctx)

  window.addEventListener("resize", () => {
    if (container.clientWidth === 0) return
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight
    drawScene(ctx)
  })
}

function drawScene(ctx) {
  ctx.fillStyle = "#001018"
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  // Earth circle
  ctx.fillStyle = "#1e88e5"
  ctx.beginPath()
  const r = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.15
  ctx.arc(ctx.canvas.width * 0.75, ctx.canvas.height * 0.5, r, 0, Math.PI * 2)
  ctx.fill()
  // Incoming asteroid dot
  ctx.fillStyle = "#dddddd"
  ctx.beginPath()
  ctx.arc(ctx.canvas.width * 0.2, ctx.canvas.height * 0.3, 6, 0, Math.PI * 2)
  ctx.fill()
}

function startGame() {
  gameState = { running: true, budget: 1000, years: 10, score: 0 }
  updateGameHUD()
  document.getElementById("mission-result").innerHTML = "<em>Mission initialized. Choose a method and launch.</em>"
}

function launchMission() {
  if (!gameState.running) startGame()

  const method = document.getElementById("deflection-method").value
  const years = Number.parseInt(document.getElementById("launch-time").value || "5", 10)

  // Simple model: success chance increases with earlier launch; method modifies base factors
  const base = Math.min(0.25 + years * 0.06, 0.9)
  const methodFactor = method === "kinetic" ? 1.0 : method === "gravity_tractor" ? 0.85 : 1.2
  const successChance = Math.min(base * methodFactor, 0.98)

  // Budget cost per method
  const cost = method === "gravity_tractor" ? 120 : method === "kinetic" ? 180 : 400
  if (gameState.budget < cost) {
    document.getElementById("mission-result").innerHTML = "<strong>Insufficient budget.</strong>"
    return
  }
  gameState.budget -= cost

  const success = Math.random() < successChance
  const deltaScore = success ? Math.round(successChance * 500) : -100
  gameState.score += deltaScore

  const msg = success
    ? `Success! Mission deflected the asteroid. (+${deltaScore} score)`
    : `Mission failed to deflect sufficiently. (${deltaScore} score)`

  document.getElementById("mission-result").innerHTML = `
        <div><strong>Result:</strong> ${msg}</div>
        <div>Method: ${method.replace("_", " ")}, Lead time: ${years} years</div>
        <div>Success chance: ${(successChance * 100).toFixed(1)}%</div>
        <div>Budget used: $${cost}M</div>
    `

  updateGameHUD()

  // Optionally: notify server to store score (non-blocking)
  fetch("/api/game/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ score: gameState.score }),
  }).catch(() => {})
}

function updateGameHUD() {
  document.getElementById("budget-display").textContent = gameState.budget
  document.getElementById("time-remaining").textContent = gameState.years
  document.getElementById("score-display").textContent = gameState.score
}
