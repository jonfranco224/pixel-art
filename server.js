const Adom = require('adom-js')
const http = require('http')

const PORT = process.env.PORT || 8000

const compiler = new Adom({ root: __dirname })

http.createServer(function (req, res) {
  const html = compiler.compile_file('index.adom', {
    framesActive: [[{ x: 0, y: 0}]]
  })

  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(html)
}).listen(PORT, function () { console.log('listening on 8000') })

