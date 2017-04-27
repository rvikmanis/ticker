import { BitStamp, BlockChain, Fixture } from './providers'
import TickerFeed from "./lib/TickerFeed";

const currencyPairs = [
	{
		symbol: 'EURUSD',
		providers: [BitStamp],
	},
	{
		symbol: 'BTCUSD',
		providers: [BitStamp, BlockChain]
	},
	{
		symbol: 'BTCEUR',
		computed: <true>true,
	}
]

export default new TickerFeed(currencyPairs)
