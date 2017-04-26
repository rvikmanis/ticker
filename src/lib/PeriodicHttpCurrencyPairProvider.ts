import * as t from './types'
import periodicallyRequest from './periodicallyRequest'

type Configurator = (config: { symbol: string, ttl: number }) => {
  url: string,
  period: number,
  source: string
}

type Snap = (
  { data: any, error: void } |
  { error: Error, data: void }
)

type Mapper = (snap: Snap) => {
  timestamp: number,
  ask: number,
  bid: number
}

type Options = {
  configurator: Configurator,
  mapper: Mapper
}

export default class PeriodicHttpCurrencyPairProvider implements t.I_Provider {
  private mapper: Mapper
  private configurator: Configurator

  constructor(options: Options) {
    this.mapper = options.mapper
    this.configurator = options.configurator
  }

  createObservable({ symbol, ttl }: { symbol: string, ttl: number }) {
    const { url, period, source } = this.configurator({ symbol, ttl })

    let result = periodicallyRequest(url, period)
      .map((snap: Snap) => {
        let output

        try {
          output = { data: this.mapper(snap) }
        } catch (error) {
          output = { error }
        }

        return { ...output, source }
      })

    return result
  }

}