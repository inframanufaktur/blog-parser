import test from 'ava'
import { parseHTML } from 'linkedom'

import { getPostDate } from '../elements.js'

function parentFactory(dateElement = '<time>September 1999</time>') {
  const { document } = parseHTML(
    `<!doctype html><html><body><div data-test>${dateElement}</div></body></html>`,
  )

  return document.querySelector('[data-test]')
}

test('no selector string', async (t) => {
  t.is(await getPostDate(parentFactory(), null), null)
})

test('selected element not in parent', async (t) => {
  t.is(await getPostDate(parentFactory(), '.js-date'), null)
})

test('selected element has no parsable date', async (t) => {
  t.is(await getPostDate(parentFactory('<p>Yesterday, 20:22h</p>'), 'p'), null)
})

test('gets datetime if set', async (t) => {
  const $el = parentFactory(
    '<time datetime="2022-09-22T00:00:00+00:00">Yesterday, 20:22h</time>',
  )
  const value = await getPostDate($el, 'time')

  t.is(value.toUTCString(), 'Thu, 22 Sep 2022 00:00:00 GMT')
})

test('uses innerText if no datetime is set', async (t) => {
  const $el = parentFactory('<time><a href="#">2022-09-22</a></time>')

  const value = await getPostDate($el, 'time')

  t.truthy(value)
})

test('allows custom formats', async (t) => {
  const $el = parentFactory('<p>März 2022</p>')

  const value = await getPostDate($el, 'p', {
    locale: 'de',
    customParseFormat: 'MMMM YYYY',
  })

  t.is(value.toLocaleDateString('de'), '1.3.2022')
})
