import * as t from './types'
import { Observable, BehaviorSubject } from "rxjs";
import CurrencyPairFeed from "./CurrencyPairFeed";
import getCurrencyPair from "./getCurrencyPair";

type SourcedPair = {
  symbol: string,
  providers: t.I_Provider[],
  computed?: void,
  ttl?: number,
  significantDigits?: number,
}

type ComputedPair = {
  symbol: string,
  computed: true,
  providers?: void,
  significantDigits?: number,
}

type CurrencyPairConfig = (
  SourcedPair | ComputedPair
)

type Payload = { [name: string]: t.I_CurrencyPair | t.I_CurrencyPairWithError }

export default class TickerFeed extends Observable<Payload> {
  readonly source: Observable<Payload>
  readonly sourcedPairs: SourcedPair[]
  readonly computedPairs: ComputedPair[]

  constructor(currencyPairs: CurrencyPairConfig[]) {
    super()

    this.sourcedPairs = <SourcedPair[]>currencyPairs.filter(pair => pair.providers)
    this.computedPairs = <ComputedPair[]>currencyPairs.filter(pair => pair.computed)

    this.source = Observable
      .combineLatest(...this.sourcedPairs.map(pair => new CurrencyPairFeed(pair)))
      .map(pairs => {
        let out: Payload = {}
        pairs.forEach(pair => {
          out[`${pair.baseCurrency}${pair.quoteCurrency}`] = pair
        })
        return out
      })
      .map(pairs => {
        let out: Payload = { ...pairs }
        this.computedPairs.forEach(pair => {
          const { significantDigits = 5 } = pair
          const data = getCurrencyPair(pair.symbol, pairs)
          if (data.ask && data.bid) {
            data.ask = Number(data.ask.toFixed(significantDigits))
            data.bid = Number(data.bid.toFixed(significantDigits))
          }
          out[pair.symbol] = data
        })
        return out
      })
      .auditTime(100)
      .publishBehavior(undefined)
      .refCount()
  }
}