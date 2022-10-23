import test from 'ava'

import { microformatsParser } from '../parser.js'

const mfPostBase = {
  type: ['h-entry'],
  properties: {
    name: ['Post title'],
    url: ['https://test.com/blog/slug'],
  },
}

const mfPostComplete = {
  type: ['h-entry'],
  properties: {
    published: ['2022-03-22 17:00'],
    name: ['Post title'],
    url: ['https://test.com/blog/slug'],
    summary: ['A summary'],
  },
}

test('converts microformats post to package post', (t) => {
  const parsed = microformatsParser(mfPostBase)

  t.true(parsed.url instanceof URL)
  t.is(parsed.title, 'Post title')
})

test('adds intro and date if possible', (t) => {
  const parsed = microformatsParser(mfPostComplete)

  t.true(parsed.date instanceof Date)
  t.is(parsed.postIntro, 'A summary')
})
