import type { Browser } from 'puppeteer-core'
import process from 'node:process'
import puppeteer from 'puppeteer-core'
import { BehaviorSubject, firstValueFrom, from, Observable, of, Subject } from 'rxjs'
import { delay, distinctUntilChanged, filter, shareReplay, switchMap, tap, withLatestFrom } from 'rxjs/operators'
import which from 'which'

const keepalive = +(process.env.BROWSER_KEEPALIVE || '30000')
const executablePath = process.env.BROWSER_EXECUTABLE || ['chrome-headless-shell', 'chromium', 'chromium-browser', 'google-chrome-stable', 'google-chrome']
  .map(name => which.sync(name, { nothrow: true }))
  .find(ex => !!ex)
if (!executablePath) throw new Error('No suitable browser executable found.')

// Shared browser instance created on demand, closed after `keepalive` milliseconds of inactivity
const browser$ = (function sharedBrowser(): Observable<Browser> {
  const request$ = new Subject<boolean>()
  const instance$ = new BehaviorSubject<Browser | null>(null)
  request$.pipe(
    withLatestFrom(instance$),
    switchMap(([requested, instance]) => {
      if (requested ? !!instance : !instance /* !XOR */) return of(instance)
      return requested
        ? from(puppeteer.launch({
            headless: true,
            executablePath,
            args:     [
              '--disable-web-security', // Circumvent hypermodern CORS policies even w/ local file://
              '--no-sandbox',
              '--disable-setuid-sandbox',
            ],
          })).pipe(tap(async browser => console.info('Spawned', await browser.version())))
        : of(null).pipe(delay(keepalive), tap(() => instance?.close()))
    }),
    distinctUntilChanged(),
  ).subscribe(instance$)
  return new Observable<Browser>((observer) => {
    instance$.pipe(filter(instance => !!instance)).subscribe(observer)
    request$.next(true)
    return () => request$.next(false)
  }).pipe(shareReplay({ bufferSize: 1, refCount: true }))
})()

export function withBrowser<T>(fn: (browser: Browser) => Promise<T>): Promise<T> {
  return firstValueFrom(browser$.pipe(switchMap(fn)))
}
