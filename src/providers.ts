import * as fs from 'fs'
import periodicallyRequest from './lib/periodicallyRequest'
import { Observable } from 'rxjs'
import PeriodicHttpCurrencyPairProvider from "./lib/PeriodicHttpCurrencyPairProvider";

function shuffle(a) {
  for (let i = a.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]];
  }
}

export const Fixture = {
  createObservable({ symbol, ttl }: { symbol: string, ttl: number }) {
    const rnd = String(Math.random())
    const lines = fs.readFileSync(`fixtures/${symbol}.csv`, 'utf8').split('\n')
    shuffle(lines)

    const line$ = Observable
      .timer(0, ttl)
      .delayWhen(v =>
        Observable.timer(Math.floor((v % 5) * 500 * Math.random()))
      )
      .map(i => lines[i % lines.length])
      .filter(line => !!line)

    return line$.map(line => {
      const [ask, bid] = line.split(',').map(Number)
      const timestamp = Number(new Date())

      let result: any = {
        source: `fixture:${rnd}:${symbol}`,
        data: { bid, ask, timestamp }
      }

      if (Math.random() > 0.85) {
        delete result.data
        result.error = new Error('Some error')
      }

      return result
    })
  }
}

export const BitStamp = new PeriodicHttpCurrencyPairProvider({
  configurator(config) {
    const { symbol, ttl } = config

    return {
      url: `https://www.bitstamp.net/api/v2/ticker/${symbol.toLowerCase()}/`,
      period: ttl,
      source: `bitstamp:${symbol}`,
    }
  },

  mapper(snap) {
    const { data: rawData, error } = snap

    if (error) {
      throw error
    }

    let { timestamp, bid, ask } = JSON.parse(<string>rawData)
    timestamp = Number(timestamp) * 1000
    bid = Number(bid)
    ask = Number(ask)

    if (isNaN(timestamp) || isNaN(bid) || isNaN(ask)) {
      throw new Error(`Cannot parse data: ${rawData}`)
    }

    return { timestamp, bid, ask }
  }
})
