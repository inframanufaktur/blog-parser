import test from 'ava'

import { getPostDate } from '../elements.js'
import { getTestContent } from './shared.js'

test('no selector string', async (t) => {
  t.is(await getPostDate(getTestContent(), null), null)
})

test('selected element not in parent', async (t) => {
  t.is(await getPostDate(getTestContent(), '.js-date'), null)
})

test('selected element has no parsable date', async (t) => {
  t.is(await getPostDate(getTestContent('<p>Yesterday, 20:22h</p>'), 'p'), null)
})

test('gets datetime if set', async (t) => {
  const $el = getTestContent(
    '<time datetime="2022-09-22T00:00:00+00:00">Yesterday, 20:22h</time>',
  )
  const value = await getPostDate($el, 'time')

  t.is(value.toUTCString(), 'Thu, 22 Sep 2022 00:00:00 GMT')
})

test('uses innerText if no datetime is set', async (t) => {
  const $el = getTestContent('<time><a href="#">2022-09-22</a></time>')

  const value = await getPostDate($el, 'time')

  t.truthy(value)
})

test('allows custom formats', async (t) => {
  const $el = getTestContent('<p>März 2022</p>')

  const value = await getPostDate($el, 'p', {
    locale: 'de',
    customParseFormat: 'MMMM YYYY',
  })

  t.is(value.toLocaleDateString('de'), '1.3.2022')
})
