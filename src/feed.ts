import { BitStamp, Fixture } from './providers'
import TickerFeed from "./lib/TickerFeed";

const currencyPairs = [
  {
    symbol: 'EURUSD',
    ttl: 2000,
    providers: [BitStamp, Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
	Fixture,
],
  },
  {
    symbol: 'BTCUSD',
    providers: [BitStamp]
  },
  {
    symbol: 'BTCEUR',
    computed: <true>true,
  },
  {
    symbol: 'USDEUR',
    computed: <true>true,
  }
]

export default new TickerFeed(currencyPairs)
