import symbolObservable from 'symbol-observable'
import { Observable, Observer } from 'rxjs'
import * as lodash from 'lodash'
import * as t from './types'

import {
  DEFAULT_SIGNIFICANT_DIGITS,
  DEFAULT_TTL,
  GRACE_TIME
} from '../constants'


type CombinerOptions = {
  snapshots: t.I_CurrencyPairSourceData[],
  symbol: string,
  ttl: number,
  significantDigits: number
}

function combiner(options: CombinerOptions): t.I_CurrencyPair | t.I_CurrencyPairWithError {
  const { snapshots, symbol, ttl, significantDigits } = options


  function isExpired(pair: t.I_CurrencyPairBase) {
    const { timestamp } = pair
    const now = Number(new Date())

    if ((timestamp + ttl + GRACE_TIME) <= (now)) {
      return true
    }

    return false
  }

  function isActive(snapshot: t.I_CurrencyPairSourceData) {
    if (!snapshot.data) {
      return false
    }

    if (isExpired(snapshot.data)) {
      return false
    }

    return true
  }

  const active: t.I_CurrencyPairBase[] = <any>lodash.map(
    lodash.filter(snapshots, isActive),
    'data'
  )

  let bidResult = lodash.maxBy(
    active,
    'bid'
  )

  let askResult = lodash.minBy(
    active,
    'ask'
  )

  let result: t.I_CurrencyPairBase

  if (bidResult && askResult) {
    result = {
      bid: Number(bidResult.bid.toFixed(significantDigits)),
      ask: Number(askResult.ask.toFixed(significantDigits)),
      timestamp: lodash.max([bidResult.timestamp, askResult.timestamp])
    }
  }

  const sourceSnapshots = lodash.keyBy(snapshots, 'source')
  const sources = lodash.mapValues(sourceSnapshots, isActive)

  const baseCurrency = symbol.slice(0, 3)
  const quoteCurrency = symbol.slice(3, 6)

  if (result) {
    return <t.I_CurrencyPair>{
      ...result,
      baseCurrency,
      quoteCurrency,
      sources,
      ttl
    }
  }

  return <t.I_CurrencyPairWithError>{
    errors: lodash.mapValues(sourceSnapshots, s => s.error),
    baseCurrency,
    quoteCurrency,
    sources,
    ttl
  }
}

type FeedOptions = {
  symbol: string,
  providers?: t.I_Provider[],
  significantDigits?: number,
  ttl?: number
}

type Payload = t.I_CurrencyPair | t.I_CurrencyPairWithError

export default class CurrencyPairFeed extends Observable<Payload> {
  readonly symbol: string
  readonly source: Observable<Payload>
  readonly ttl: number

  constructor(options: FeedOptions) {
    super()

    let {
      symbol,
      providers = [],
      ttl = DEFAULT_TTL,
      significantDigits = DEFAULT_SIGNIFICANT_DIGITS
    } = options

    symbol = symbol.toUpperCase()

    this.symbol = symbol
    this.ttl = ttl

    if (providers.length === 0) {
      this.source = Observable.empty()
      return
    }

    const sources = providers.map(p =>
      p.createObservable({ symbol, ttl })
    )

    this.source = Observable
      .combineLatest(Observable.timer(0, ttl), ...sources)
      .map(([i, ...snapshots]) => combiner({ snapshots, symbol, ttl, significantDigits }))
  }
}