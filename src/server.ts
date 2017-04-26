import * as path from 'path'
import * as http from 'http'
import * as express from 'express'
import * as WebSocket from 'ws'
import * as url from 'url'
import * as fs from 'fs'
import feed from './feed'

const app = express()
app.use(express.static(path.join(__dirname, 'client')))

const server = http.createServer(app)
const wss = new WebSocket.Server({ server, path: '/ticker' })

let RECORD_FIXTURES = false
if (process.argv.length > 2 && process.argv.indexOf('--record-fixtures')) {
  RECORD_FIXTURES = true
  try {
    fs.mkdirSync('fixtures')
  } catch (e) {
    console.log(e.message)
  }
}

wss.on('connection', ws => {
  const consumer = feed.subscribe(data => {
    if (!data) {
      return
    }

    ws.send(JSON.stringify(data))

    if (RECORD_FIXTURES) {
      Object.keys(data).forEach(key => {
        const row = data[key]
        let { bid, ask } = row
        if (bid && ask) {
          bid = <number>bid + (Math.random() / 10) * (Math.random() < 0.5 ? -1 : 1)
          ask = <number>ask + (Math.random() / 10) * (Math.random() < 0.5 ? -1 : 1)
          const exportData = `${bid},${ask}\n`
          fs.appendFileSync(`fixtures/${key}.csv`, exportData)
        }
      })
    }
  })

  ws.on('close', () => {
    consumer.unsubscribe()
  })
})

server.listen(3000, function () {
  console.log('Serving app on port 3000!')
})
