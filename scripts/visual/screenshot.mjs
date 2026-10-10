// Visual smoke: screenshots of the homepage at phone/tablet/desktop widths, plus the configurator with WebGL.
// Usage: node scripts/visual/screenshot.mjs http://localhost:3123 out-dir
const pw = await import(process.env.PW_MODULE ?? 'playwright')
const chromium = pw.chromium ?? pw.default.chromium
import { mkdirSync } from 'node:fs'

const [base = 'http://localhost:3123', out = 'test_reports/visual'] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const errors = []
for (const [name, width, height] of [['phone', 390, 844], ['tablet', 768, 1024], ['desktop', 1440, 900]]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${name}: console ${m.text().slice(0, 160)}`) })
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.screenshot({ path: `${out}/home-${name}.png`, fullPage: true })
  const stage = page.locator('#configurator')
  if (await stage.count()) {
    await stage.scrollIntoViewIfNeeded()
    await page.waitForTimeout(2500)
    await stage.screenshot({ path: `${out}/configurator-${name}.png` })
    const hasCanvas = await stage.locator('canvas').count()
    console.log(`${name}: configurator canvas=${hasCanvas}`)
  }
  await page.close()
}
await browser.close()
console.log(errors.length ? `PAGE_ERRORS=${errors.length}\n${errors.join('\n')}` : 'PAGE_ERRORS=0')
