const ADOM = require('adom-js')
const A = new ADOM({
  rootDir: './client' // tell adom where to look for adom files
})

require('http').createServer((req, res) => {
  res.writeHead(200, { 'Content-type': 'text/html' })
  console.log('building')
  res.end(A.render('index.adom'))
}).listen(4000)

console.log('Running on 4000')
