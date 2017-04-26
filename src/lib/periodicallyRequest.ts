import request from './request'
import { Observable } from 'rxjs'

export default function periodicallyRequest(url: string, period: number, options = {}) {
  return Observable
    .timer(0, period)
    .concatMap(() =>
      request(url, { timeout: period, ...options })
        .map((data: any) => ({ data }))
        .catch((e: any) => Observable.of({ error: e }))
    )
}
