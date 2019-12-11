const ADOM = require('adom-js')
const A = new ADOM({
  rootDir: './client' // tell adom where to look for adom files
})

const PORT = process.env.PORT || 8000

require('http').createServer((req, res) => {
  res.writeHead(200, { 'Content-type': 'text/html' })
  console.log('building')
  res.end(A.render('index.adom'))
}).listen(PORT)

console.log('Running on 4000')
