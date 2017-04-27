import * as React from 'react';
import * as t from '../lib/types'
import { GRACE_TIME } from '../constants'

type Props = {
  status: 'connecting' | 'connected' | 'live',
  data?: void | t.I_CurrencyState
}

function CurrencyList(props: { data: void | t.I_CurrencyState }) {
  if (!props.data) {
    return null
  }

  return <ul>
    {Object.keys(props.data).map(key => {
      const pair = props.data[key]

      const sources = Object.keys(pair.sources).map(key => pair.sources[key])
      const activeSourcesCount = sources.filter(Boolean).length
      const sourcesCount = sources.length

      const errors = activeSourcesCount === 0
        ? <div className='errors'>Feed has errors</div>
        : null

      const sourcesLine = ((sourcesCount === 1) && ('computed' in pair.sources))
        ? 'computed'
        : `sources: ${activeSourcesCount} of ${sourcesCount}`

      return <li key={key}>
        <div className='symbol'>{pair.baseCurrency}/{pair.quoteCurrency}</div>
        <div className='info'>
          <div className='value'>{pair.ask}</div>
          {sourcesLine}
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