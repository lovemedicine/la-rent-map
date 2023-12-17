import fs from 'fs'
import { parse } from 'csv-parse'
import { finished } from 'stream/promises'

async function loadGeojson() {
  const filePath = './data/ca-block-group-2022.json'
  const data = await fs.promises.readFile(filePath, 'utf8')
  const json = await JSON.parse(data)
  return json
}

async function loadRents() {
  const records = []
  const parser = fs
    .createReadStream('./data/los-angeles-rents.csv')
    .pipe(parse())
  parser.on('readable', function(){
    let record
    while ((record = parser.read()) !== null) {
      records.push(record)
    }
  })
  await finished(parser)
  return records
}

let geojson = await loadGeojson()
let features = {}

for (let feature of geojson.features) {
  const geoid = feature.properties.AFFGEOID
  features[geoid] = feature
}

const rows = await loadRents()
let found = 0
let notFound = 0

for (let row of rows.slice(2)) {
  let [geoid, name, rent, margin] = row

  if (features[geoid]) {
    rent = parseInt(rent.replace(',', '')) || null
    margin = parseInt(margin.replace(',', '')) || null
    let newFeature = { ...features[geoid] }
    newFeature.properties =  { ...newFeature.properties, rent, margin, name }
    features[geoid] = newFeature
    found++
  } else {
    notFound++
  }
}

const featuresWithRent = Object.values(features).filter(feature => feature.properties.rent)
geojson.features = featuresWithRent
await fs.promises.writeFile('./data/geoRentData.js', `const rentData = ${JSON.stringify(geojson)}`)

