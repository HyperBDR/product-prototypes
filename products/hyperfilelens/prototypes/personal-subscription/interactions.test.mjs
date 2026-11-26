import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { Script, runInNewContext } from 'node:vm'

const read = name => readFileSync(new URL(name, import.meta.url), 'utf8')
const checkout = read('./index.html').split('<script>')[1].split('</script>')[0]
const restore = read('./personal-subscription-recovery.html').split('<script>')[1].split('</script>')[0]
const model = checkout.slice(0, checkout.indexOf('const copy ='))

test('both prototype entries parse as standalone scripts', () => {
  assert.doesNotThrow(() => new Script(checkout))
  assert.doesNotThrow(() => new Script(restore))
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
