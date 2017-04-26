import * as WebSocket from 'reconnecting-websocket'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Ticker from './Ticker'

const root = document.getElementById('root')
const update = props => ReactDOM.render(<Ticker {...props} />, root)

const ws = new WebSocket('ws://localhost:3000/ticker');

ws.addEventListener('open', () => {
  update({ status: 'connected' })
})

ws.addEventListener('message', event => {
  const data = JSON.parse(event.data)
  update({ status: 'live', data })
})

ws.addEventListener('close', () => {
  update({ status: 'connecting' })
})

window.addEventListener('DOMContentLoaded', () => {
  update({ status: 'connecting' })
})
