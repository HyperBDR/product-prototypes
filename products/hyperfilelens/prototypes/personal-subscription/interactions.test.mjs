import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { Script, runInNewContext } from 'node:vm'

const read = name => readFileSync(new URL(name, import.meta.url), 'utf8')
const entry = read('./index.html').split('<script id="prototype-entry">')[1].split('</script>')[0]
const checkout = read('./index.html').split('<script>')[1].split('</script>')[0]
const restore = read('./personal-subscription-recovery.html').split('<script>')[1].split('</script>')[0]
const model = checkout.slice(0, checkout.indexOf('const copy ='))

test('both prototype entries parse as standalone scripts', () => {
  assert.doesNotThrow(() => new Script(checkout))
  assert.doesNotThrow(() => new Script(restore))
})

test('opens the full localized homepage by default without replacing console deep links', () => {
  function destination(hash, language = 'en-US', search = '') {
    const redirects = []
    const location = { hash, search, replace: target => redirects.push(target) }
    runInNewContext(entry, { location, navigator: { language }, URLSearchParams })
    return redirects
  }
  assert.deepEqual(destination(''), ['./website-en.html'])
  assert.deepEqual(destination('', 'zh-CN'), ['./website-zh.html'])
  assert.deepEqual(destination('', 'en-US', '?lang=es'), ['./website-es.html'])
  assert.deepEqual(destination('#/configuration/account/subscription'), [])
  assert.deepEqual(destination('#/configuration/account/subscription?view=website-entry&plan=pro'), [])
  assert.deepEqual(destination('#/configuration/account/subscription?view=checkout&order=HFL-0001'), [])
})

test('each website locale keeps the complete homepage and relative checkout links', () => {
  for (const language of ['en', 'es', 'zh']) {
    const homepage = read(`./website-${language}.html`)
    for (const section of ['hero-title', 'use-cases', 'how-it-works', 'personal-plans', 'open-source', 'blog', 'contact']) {
      assert.ok(homepage.includes(`id="${section}"`), `${language}: ${section}`)
    }
    assert.match(homepage, /<footer>/)
    assert.equal([...homepage.matchAll(/data-plan="(?:free|plus|pro|max)"/g)].length, 4)
    assert.match(homepage, /\.\/index\.html#\/configuration\/account\/subscription\?view=website-entry/)
    assert.match(homepage, /class="plan-demo-link" href="\.\/index\.html#\/configuration\/account\/subscription\?lang=(?:zh|en)"/)
    assert.doesNotMatch(homepage, /127\.0\.0\.1|localhost|src="\//)
  }
  assert.doesNotThrow(() => new Script(read('./assets/website.js')))
})

test('keeps USD plan and tax arithmetic consistent', () => {
  assert.equal(runInNewContext(`${model}\nplanPrice({ plan: 'plus', cycle: 'yearly' })`), 58.1)
  assert.equal(runInNewContext(`${model}\nJSON.stringify(demoCheckoutTaxBreakdown(58.1))`), '{"subtotal":52.82,"tax":5.28}')
})

test('recovery stages and the Free storage threshold match the subscription rules', () => {
  const result = runInNewContext(`${model}
    const account = newAccount();
    account.subscription = { status: 'expired', end: '2026-12-11' };
    account.today = '2027-01-09';
    const before = recoveryFor(account);
    account.storage = 1.01;
    const rejected = switchToFree(account);
    account.storage = 1;
    const accepted = switchToFree(account);
    JSON.stringify({ before, rejected, accepted, storage: account.storage });
  `)
  assert.deepEqual(JSON.parse(result), {
    before: { deadline: '2027-01-10', days: 1, stage: 'lastDay' }, rejected: false, accepted: true, storage: 1,
  })
})

test('keeps the UTC instant while localizing the recovery deadline', () => {
  const result = runInNewContext(`${model}\nformatRecoveryDeadline('2027-01-10','en','America/Los_Angeles')`)
  assert.match(result, /Jan 9, 2027.*16:00 \(UTC-08:00\)/)
})
