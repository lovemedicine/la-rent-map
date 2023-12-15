function rentToScale(rent, min, max) {
  return (rent - min) / (max - min)
}

function mapScaleToHeatColor(scale) {
  scale = Math.min(1, Math.max(0, scale))
  const hue = (1 - scale) * 240
  const rgbColor = hslToRgb(hue / 360, 1, 0.5)
  return `rgb(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]})`
}

function hslToRgb(h, s, l) {
  let r, g, b

  if (s === 0) {
    r = g = b = l // Achromatic (grayscale)
  } else {
    const hueToRgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hueToRgb(p, q, h + 1 / 3)
    g = hueToRgb(p, q, h)
    b = hueToRgb(p, q, h - 1 / 3)
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

window.addEventListener('load', event => {
  const map = L.map('map').setView([34.03, -118.21], 10)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map)

  const rents = rentData.map(feature => feature.rent)
  const min = Math.min(...rents)
  const max = Math.max(...rents)

  for (let i = 0; i < rentData.length; i++) {
    const feature = rentData[i]
    const latlngs = feature.geometry.coordinates[0].map(coord => [coord[1], coord[0]])
    const scale = rentToScale(feature.rent, min, max)
    const color = mapScaleToHeatColor(scale)
    const polygon = L.polygon(latlngs, {color, fillOpacity: 0.7, stroke: 0}).addTo(map)
    polygon.bindTooltip(`Median rent: $${feature.rent}`)
  }
})
