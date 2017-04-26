import * as t from './types'

const USDUSD = <t.I_CurrencyPair>{
  baseCurrency: 'USD',
  quoteCurrency: 'USD',
  ask: 1,
  bid: 1,
  timestamp: 0,
  sources: {},
  ttl: Infinity
}

export default function getCurrencyPair(symbol: string, state: t.I_CurrencyState) {
  symbol = symbol.toUpperCase()
  let pair = state[symbol]

  if (!pair) {
    const baseCurrency = symbol.slice(0, 3)
    const quoteCurrency = symbol.slice(3, 6)

    const basePair: t.I_CurrencyPair | t.I_CurrencyPairWithError = baseCurrency === 'USD'
      ? USDUSD
      : state[`${baseCurrency}USD`]

    const quotePair: t.I_CurrencyPair | t.I_CurrencyPairWithError = quoteCurrency === 'USD'
      ? USDUSD
      : state[`${quoteCurrency}USD`]

    if (!basePair) {
      throw new Error(`No such currency pair: ${baseCurrency}USD`)
    }

    if (!quotePair) {
      throw new Error(`No such currency pair: ${quoteCurrency}USD`)
    }

    const ttl = Math.min(basePair.ttl, quotePair.ttl)
    const sources = { ...basePair.sources, ...quotePair.sources }

    if (basePair.errors || quotePair.errors) {

      const errors = Object.assign({}, basePair.errors, quotePair.errors)
      pair = <t.I_CurrencyPairWithError>{
        baseCurrency,
        quoteCurrency,
        errors,
        ttl,
        sources,
      }

    } else {

      const timestamp = Math.max(<number>basePair.timestamp, <number>quotePair.timestamp)
      pair = <t.I_CurrencyPair>{
        baseCurrency,
        quoteCurrency,
        ask: (<number>basePair.ask) * (1 / (<number>quotePair.bid)),
        bid: (<number>basePair.bid) * (1 / (<number>quotePair.ask)),
        timestamp,
        ttl,
        sources,
      }

    }
  }

  return pair
}
