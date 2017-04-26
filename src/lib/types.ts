import { Observable } from "rxjs";

export type I_CurrencyPairBase = {
  ask: number,
  bid: number,
  timestamp: number
}

export type I_CurrencyPairSourceData = (
  { source: string } & (
    { data: I_CurrencyPairBase, error: void } |
    { error: any, data: void }
  )
)

export type I_CurrencyPair = {
  sources: { [name: string]: boolean },
  ttl: number,
  baseCurrency: string,
  quoteCurrency: string,
  ask: number,
  bid: number,
  timestamp: number,
  errors: void,
}

export type I_CurrencyPairWithError = {
  sources: { [name: string]: boolean },
  ttl: number,
  baseCurrency: string,
  quoteCurrency: string,
  errors: { [name: string]: Error },
  timestamp: void,
  bid: void,
  ask: void,
}

export type I_CurrencyState = {
  [symbol: string]: I_CurrencyPair | I_CurrencyPairWithError,
}

export interface I_Provider {
  createObservable(options: {
    symbol: string,
    ttl: number
  }): Observable<I_CurrencyPairSourceData>
}