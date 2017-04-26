import * as React from 'react';
import * as t from '../lib/types'
import { GRACE_TIME } from '../constants'

type Props = {
  status: 'connecting' | 'connected' | 'live',
  data?: void | t.I_CurrencyState
}

function isExpired(pair: any) {
  const { timestamp, ttl } = pair
  const now = Number(new Date())

  if ((timestamp + ttl + GRACE_TIME) <= (now)) {
    return true
  }

  return false
}

function CurrencyList(props: { data: void | t.I_CurrencyState }) {
  if (!props.data) {
    return null
  }

  return <ul>
    {Object.keys(props.data).map(key => {
      const pair = props.data[key]
      let style = {}

      if (isExpired(pair)) {
        style = { color: 'gray' }
      }

      const sources = Object.keys(pair.sources).map(key => pair.sources[key])
      const activeSourcesCount = sources.filter(Boolean).length
      const sourcesCount = sources.length

      const errors = activeSourcesCount === 0
        ? <div className='errors'>Feed has errors</div>
        : null

      return <li key={key} style={style}>
        <div className='symbol'>{pair.baseCurrency}/{pair.quoteCurrency}</div>
        <div className='info'>
          <div className='value'>{pair.ask}</div>
          sources: {activeSourcesCount} of {sourcesCount}
          {errors}
        </div>
      </li>
    })}
  </ul>
}

export default class Ticker extends React.Component<Props, null> {
  render() {
    return <div>
      <p>status: {this.props.status}</p>
      <CurrencyList data={this.props.data} />
    </div>
  }
}