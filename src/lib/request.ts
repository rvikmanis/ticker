import * as httpRequest from 'request'
import { Observable, Observer } from 'rxjs'

export default function request(url: string, options = {}) {
  function onSubscribe(observer: Observer<any>) {
    httpRequest(url, options, (error, response, body) => {
      if (response && response.statusCode >= 400 && response.statusCode <= 599) {
        error = new Error(`Response status: ${response.statusCode}`)
        error.response = response
      }

      if (error) {
        observer.error(error)
      } else {
        observer.next(body)
        observer.complete()
      }
    })
  }

  return Observable.create(onSubscribe)
}