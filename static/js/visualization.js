// visualization.js - Handles 3D visualizations for space and atmosphere views

// Import Three.js
const THREE = window.THREE

// Global Three.js objects
let spaceScene, spaceCamera, spaceRenderer, spaceControls
let atmosphereScene, atmosphereCamera, atmosphereRenderer
let earth, asteroid, orbitLine, sun
let asteroidMesh, atmosphere, earthMesh
let orbitCurve,
  orbitPoints = [],
  orbitParam = 0
let spaceAnimId
let atmosphereSceneSetup = false,
  entryLine

// Constants
const EARTH_RADIUS = 6371 // km
const SUN_DISTANCE = 149600000 // km

// Initialize space visualization
function initSpaceVisualization(containerId) {
  const container = document.getElementById(containerId)

  // Scene setup
  spaceScene = new THREE.Scene()
  spaceScene.background = new THREE.Color(0x000510)

  // Camera setup
  spaceCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000000)
  spaceCamera.position.set(0, 30000, 60000)
  spaceCamera.lookAt(0, 0, 0)

  // Renderer setup
  spaceRenderer = new THREE.WebGLRenderer({ antialias: true })
  spaceRenderer.setSize(container.clientWidth, container.clientHeight)
  container.appendChild(spaceRenderer.domElement)

  // Add orbital controls
  spaceControls = new THREE.OrbitControls(spaceCamera, spaceRenderer.domElement)
  spaceControls.enableDamping = true
  spaceControls.dampingFactor = 0.05

  // Add event listener for window resize
  window.addEventListener("resize", () => {
    if (container.clientWidth === 0) return
    spaceCamera.aspect = container.clientWidth / container.clientHeight
    spaceCamera.updateProjectionMatrix()
    spaceRenderer.setSize(container.clientWidth, container.clientHeight)
  })

  // Create celestial bodies
  createSun()
  createEarth()

  // Add lighting
  addSpaceLighting()

  // Add stars
  addStarfield()

  // Start animation loop
  animateSpace()
}

// Create sun
function createSun() {
  // Simplified sun (just a light source)
  const sunGeometry = new THREE.SphereGeometry(6955, 32, 32)
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    emissive: 0xffff00,
  })
  sun = new THREE.Mesh(sunGeometry, sunMaterial)

  // Position sun far away
  sun.position.set(-SUN_DISTANCE / 5000, 0, -SUN_DISTANCE / 2000)
  spaceScene.add(sun)
}

// Create Earth
function createEarth() {
  // Earth geometry
  const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS / 200, 32, 32)

  // Earth material (simplified, would use textures in full version)
  const earthMaterial = new THREE.MeshPhongMaterial({
    color: 0x2233ff,
    specular: 0x333333,
    shininess: 5,
  })

  earth = new THREE.Mesh(earthGeometry, earthMaterial)
  spaceScene.add(earth)

  // Add Earth's atmosphere
  const atmosphereGeometry = new THREE.SphereGeometry((EARTH_RADIUS / 200) * 1.03, 32, 32)
  const atmosphereMaterial = new THREE.MeshPhongMaterial({
    color: 0x8888ff,
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide,
  })

  const earthAtmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
  earth.add(earthAtmosphere)
}

// Add lighting to space scene
function addSpaceLighting() {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0x333333)
  spaceScene.add(ambientLight)

  // Directional light (from sun)
  const sunLight = new THREE.DirectionalLight(0xffffff, 1)
  sunLight.position.set(-SUN_DISTANCE / 5000, 0, -SUN_DISTANCE / 2000)
  spaceScene.add(sunLight)
}

// Add starfield background
function addStarfield() {
  const starGeometry = new THREE.BufferGeometry()
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1,
    sizeAttenuation: false,
  })

  const starVertices = []

  // Create random stars
  for (let i = 0; i < 10000; i++) {
    const x = THREE.MathUtils.randFloatSpread(2000)
    const y = THREE.MathUtils.randFloatSpread(2000)
    const z = THREE.MathUtils.randFloatSpread(2000)
    starVertices.push(x, y, z)
  }

  starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3))
  const starField = new THREE.Points(starGeometry, starMaterial)
  spaceScene.add(starField)
}

// Update space visualization with new asteroid data
function updateSpaceVisualization(asteroidData) {
  // Remove previous asteroid and orbit line if they exist
  if (asteroid) {
    spaceScene.remove(asteroid)
    asteroid.geometry.dispose()
    asteroid.material.dispose()
    asteroid = null
  }
  if (orbitLine) {
    spaceScene.remove(orbitLine)
    orbitLine.geometry.dispose()
    orbitLine.material.dispose()
    orbitLine = null
  }

  // Create new asteroid mesh (scaled from diameter)
  const asteroidSize = Math.max(asteroidData.diameter / 200, 20)
  const asteroidGeometry = new THREE.SphereGeometry(asteroidSize, 16, 16)
  const asteroidMaterial = new THREE.MeshPhongMaterial({
    color: 0xaaa9ad,
    specular: 0x333333,
    shininess: 5,
  })
  asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial)
  spaceScene.add(asteroid)

  // Build a simplified hyperbolic flyby path using an ellipse-like curve around Earth
  // Scale miss distance (km) into scene units
  const missDistanceKm = Math.max(asteroidData.missDistance, 10000) // avoid degenerate
  const a = missDistanceKm / 300 // semi-major axis (scene units)
  const b = a * 0.6 // semi-minor axis for a nice path

  orbitCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2 * a, 0, -b),
    new THREE.Vector3(-a, 0, 0),
    new THREE.Vector3(0, 0, b),
    new THREE.Vector3(a, 0, 0),
    new THREE.Vector3(2 * a, 0, -b),
  ])

  orbitPoints = orbitCurve.getPoints(200)
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints)
  const orbitMaterial = new THREE.LineDashedMaterial({ color: 0x66ccff, dashSize: 100, gapSize: 50 })
  orbitLine = new THREE.Line(orbitGeometry, orbitMaterial)
  // LineDashed needs computeLineDistances
  orbitLine.computeLineDistances()
  spaceScene.add(orbitLine)

  // Reset param and place asteroid along the curve near closest approach
  orbitParam = 0.5
  placeAsteroidAtParam(orbitParam)
}

// Move asteroid along orbit for a given normalized time [0..1]
function placeAsteroidAtParam(t) {
  if (!orbitCurve || !asteroid) return
  const pos = orbitCurve.getPoint(THREE.MathUtils.clamp(t, 0, 1))
  asteroid.position.copy(pos)
}

// Update time from slider (days converted to a 0..1 sweep)
function updateSpaceTime(days) {
  // Map days range ~0..10 to param sweep on 0.3..0.7 for near-Earth passage
  const t = THREE.MathUtils.clamp(0.3 + (days / 10) * 0.4, 0, 1)
  orbitParam = t
  placeAsteroidAtParam(orbitParam)
}

// Animation loop
function animateSpace() {
  spaceAnimId = requestAnimationFrame(animateSpace)
  if (earth) {
    // Slow Earth rotation
    earth.rotation.y += 0.0008
  }
  if (spaceControls) {
    spaceControls.update()
  }
  spaceRenderer.render(spaceScene, spaceCamera)
}

// Atmosphere visualization (basic entry line)
function initAtmosphereVisualization(containerId) {
  const container = document.getElementById(containerId)
  atmosphereScene = new THREE.Scene()
  atmosphereScene.background = new THREE.Color(0x000510)

  atmosphereCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 5000)
  atmosphereCamera.position.set(0, 0, 1200)

  atmosphereRenderer = new THREE.WebGLRenderer({ antialias: true })
  atmosphereRenderer.setSize(container.clientWidth, container.clientHeight)
  container.appendChild(atmosphereRenderer.domElement)

  // Simple Earth-atmosphere cross section
  const earthR = 400
  const atmR = earthR * 1.05

  const earthGeom = new THREE.SphereGeometry(earthR, 32, 32)
  const earthMat = new THREE.MeshPhongMaterial({ color: 0x2244ff, specular: 0x333333, shininess: 5 })
  earthMesh = new THREE.Mesh(earthGeom, earthMat)
  atmosphereScene.add(earthMesh)

  const atmGeom = new THREE.SphereGeometry(atmR, 32, 32)
  const atmMat = new THREE.MeshPhongMaterial({
    color: 0x88aaff,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
  })
  atmosphere = new THREE.Mesh(atmGeom, atmMat)
  atmosphereScene.add(atmosphere)

  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(-500, 500, 1000)
  atmosphereScene.add(light)
  atmosphereScene.add(new THREE.AmbientLight(0x333333))

  drawEntryVector()

  function animateAtmosphere() {
    requestAnimationFrame(animateAtmosphere)
    atmosphereRenderer.render(atmosphereScene, atmosphereCamera)
  }
  animateAtmosphere()
  atmosphereSceneSetup = true

  window.addEventListener("resize", () => {
    if (container.clientWidth === 0) return
    atmosphereCamera.aspect = container.clientWidth / container.clientHeight
    atmosphereCamera.updateProjectionMatrix()
    atmosphereRenderer.setSize(container.clientWidth, container.clientHeight)
  })
}

function drawEntryVector() {
  // Remove previous line
  if (entryLine) {
    atmosphereScene.remove(entryLine)
    entryLine.geometry.dispose()
    entryLine.material.dispose()
    entryLine = null
  }
  // Entry angle and composition alter color
  const angle = Number.parseFloat(document.getElementById("entry-angle").value || "45")
  const composition = document.getElementById("composition").value
  const color = composition === "metallic" ? 0xffdd88 : composition === "icy" ? 0x88e0ff : 0xff8844

  // Build a line starting at atmosphere boundary toward surface
  const atmR = 400 * 1.05
  const length = 800
  const rad = THREE.MathUtils.degToRad(angle)
  const dir = new THREE.Vector3(Math.cos(rad), -Math.sin(rad), 0).normalize()

  const start = new THREE.Vector3(-dir.x * atmR, dir.y * atmR, 0)
  const end = start.clone().add(dir.clone().multiplyScalar(length))

  const geom = new THREE.BufferGeometry().setFromPoints([start, end])
  const mat = new THREE.LineBasicMaterial({ color, linewidth: 3 })
  entryLine = new THREE.Line(geom, mat)
  atmosphereScene.add(entryLine)
}

function updateAtmosphereVisualization() {
  if (!atmosphereSceneSetup) return
  drawEntryVector()
}
