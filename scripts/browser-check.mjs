import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'

if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync('.playwright-browsers')) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = '.playwright-browsers'
}
const { chromium } = await import('playwright')

const port = process.env.PORT || '3110'
const url = `http://127.0.0.1:${port}`
try {
  await fetch(url, { signal: AbortSignal.timeout(1000) })
  throw new Error(`Port ${port} is already in use.`)
} catch (error) {
  if (error instanceof Error && error.message.includes('already in use')) throw error
}

const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', port, '-H', '127.0.0.1'], {
  stdio: 'pipe',
  windowsHide: true,
})
let serverLog = ''
server.stdout.on('data', (chunk) => { serverLog += chunk })
server.stderr.on('data', (chunk) => { serverLog += chunk })
let browser

try {
  let ready = false
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(serverLog)
    try {
      if ((await fetch(url)).ok) { ready = true; break }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  assert(ready, `Production server failed to become ready: ${serverLog}`)
  browser = await chromium.launch({ headless: true })
  await mkdir('test-results', { recursive: true })

  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport, reducedMotion: 'reduce' })
    const runtimeErrors = []
    page.on('pageerror', (error) => runtimeErrors.push(error.message))
    await page.goto(url)

    assert((await page.title()).includes('AgingTrajectory'))
    const body = await page.locator('body').innerText()
    assert(!body.includes('GrimAge'))
    assert(!body.toLowerCase().includes('rapamycin'))
    assert.equal(await page.getByRole('button', { name: 'Fixed biomarkers', exact: true }).getAttribute('aria-pressed'), 'true')
    assert.equal(await page.getByRole('button', { name: 'Selected values increase', exact: true }).count(), 1)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Page overflows horizontally')

    const year = page.getByRole('slider', { name: 'Inspect year', exact: true })
    await year.fill('5')
    const glucose = page.getByRole('spinbutton', { name: 'Glucose (mg/dL)', exact: true })
    await glucose.fill('')
    await page.getByRole('button', { name: 'Apply values from year 5', exact: true }).click()
    assert(await page.getByText('Enter a number.', { exact: true }).isVisible())
    await glucose.fill('150')
    await page.getByRole('button', { name: 'Apply values from year 5', exact: true }).click()
    assert(await page.getByRole('button', { name: 'Reset all edits', exact: true }).isVisible())
    assert(!(await page.getByText(/Edited minus baseline:/).innerText()).includes('+0.0'))

    const horizon = page.getByRole('slider', { name: 'Simulation horizon', exact: true })
    await horizon.fill('6')
    await horizon.fill('12')
    await year.fill('5')
    assert.equal(await glucose.evaluate((element) => element.value), '150')

    await page.getByText('View chart data as a table', { exact: true }).click()
    assert(await page.getByRole('table').isVisible())
    await page.screenshot({ path: `test-results/page-${viewport.width}.png`, fullPage: true })
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
    const enlargedOverflow = await page.evaluate(() => ({
      fits: document.documentElement.scrollWidth <= innerWidth,
      viewport: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      elements: [...document.querySelectorAll('*')]
        .filter((element) => {
          const rect = element.getBoundingClientRect()
          return rect.right > innerWidth + 1 || rect.left < -1
        })
        .slice(0, 8)
        .map((element) => ({ tag: element.tagName, className: element.getAttribute('class'), text: element.textContent?.trim().slice(0, 80) })),
    }))
    assert.equal(enlargedOverflow.fits, true, `200% text overflows horizontally: ${JSON.stringify(enlargedOverflow)}`)
    assert.deepEqual(runtimeErrors, [], 'Browser runtime errors')
    await page.close()
    console.log(`Passed ${viewport.width}px: validation, editing, horizon persistence, data table, layout, and text enlargement`)
  }
} finally {
  await browser?.close()
  server.kill()
}
