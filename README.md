# la-rent-map

A simple web page that displays a heat map of rents in Los Angeles using Leaflet.js or Mapbox and the latest 5-year census data. You can view a demo of the Leaflet.js version at this [replit](https://replit.com/@matthewskomarov/la-rent-map).

## Instructions

1. Start the server with node:

```
npm server.js
```

2. Open the map page at [http://localhost:3000](http://localhost:3000)

3. To re-generate the combined data from census block group shapes and rents:

```
npm generateGeoRentData.js
```
