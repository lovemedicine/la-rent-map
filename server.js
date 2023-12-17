import http from 'http'
import fs from 'fs'
import path from 'path'

const port = 3000

http.createServer((request, response) => {
  let filePath = '.' + request.url
  if (filePath == './') {
    filePath = './index.html'
  }

  const extname = String(path.extname(filePath)).toLowerCase()
  let contentType = 'text/html'

  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.geojson': 'application/geo+json'
  };

  contentType = mimeTypes[extname] || 'application/octet-stream'

  fs.readFile(filePath, function(err, data) {
    if (err) {
      response.writeHead(404)
      response.end('404 Not Found')
    } else {
      response.writeHead(200, {'Content-Type': contentType})
      response.end(data)
    }
  })
}).listen(port)

console.log(`Server running at http://localhost:${port}/`)
