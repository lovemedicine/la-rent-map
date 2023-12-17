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

function getRentRange(features) {
  const rents = features.map(feature => feature.properties.rent)
  const min = Math.min(...rents)
  const max = Math.max(...rents)
  return { min, max }
}

function buildLeafletMap(rentData) {
  const { features } = rentData
  const map = createLeafletMap(map => {
    const { min, max } = getRentRange(features)

    for (let i = 0; i < features.length; i++) {
      const feature = features[i]
      const rentScale = rentToScale(feature.properties.rent, min, max)
      addLeafletPolygon(map, feature, rentScale)
    }
  })

  return map
}

function createLeafletMap(onLoad) {
  const map = L.map('map')
  map.on('load', () => onLoad(map))
  map.setView([34.03, -118.21], 10)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map)
  return map
}

function addLeafletPolygon(map, feature, rentScale) {
  const latlngs = feature.geometry.coordinates[0].map(coord => [coord[1], coord[0]])
  const color = mapScaleToHeatColor(rentScale)
  const polygon = L.polygon(latlngs, {color, fillOpacity: 0.7, stroke: 0}).addTo(map)
  polygon.bindTooltip(`Median rent: $${feature.properties.rent}`)
}

function buildMapboxMap(rentData) {
  return createMapboxMap(map => {
    addMapboxPolygons(map, rentData)
  })
}

function createMapboxMap(onLoad) {
  mapboxgl.accessToken = mapboxAccessToken
  const map = new mapboxgl.Map({
    container: 'map',
    center: [-118.21, 34.03],
    zoom: 9
  })
  map.on('load', () => onLoad(map))
  return map
}

function addMapboxPolygons(map, rentData) {
  map.addSource('rent-features', {
    type: 'geojson',
    data: rentData
  })

  const { min, max } = getRentRange(rentData.features)

  map.addLayer({
    id: 'rent-features',
    type: 'fill',
    source: 'rent-features',
    paint: {
      'fill-color': [
        'hsl',
         // hue = (1 - ((rent-min)/(max-min))) * 240
        ['*', ['-', 1, ['/', ['-', ['get', 'rent'], min], max - min]], 240],
        100,
        50
      ],
      'fill-opacity': 0.7,
    },
  })

  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  })

  map.on('mousemove', 'rent-features', event => {
    const rent = event.features[0].properties.rent
    popup.setLngLat(event.lngLat).setText(`Median rent: $${rent}`).addTo(map)
  })

  map.on('mouseleave', 'rent-features', () => {
    map.getCanvas().style.cursor = ''
    popup.remove()
  })
}

function buildMap(type) {
  window[`build${type}Map`](rentData)
}

window.addEventListener('load', event => {
  buildMap('Mapbox')
})
