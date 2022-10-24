import test from 'ava'
import { makeDoc } from './shared.js'

import { getFeeds } from '../elements.js'

test('finds atom feeds', (t) => {
  const found = getFeeds(
    makeDoc({
      head: '<link rel="alternate" href="/feed.xml" type="application/atom+xml" />',
    }),
    'https://test.com',
  )

  t.is(found.length, 1)
})

test('finds rss feeds', (t) => {
  const found = getFeeds(
    makeDoc({
      head: '<link rel="alternate" href="/feed" type="application/rss+xml" />',
    }),
    'https://test.com',
  )

  t.is(found.length, 1)
})

test('finds json 1.1 feeds', (t) => {
  const found = getFeeds(
    makeDoc({
      head: '<link rel="alternate" href="/feed.json" type="application/feed+json" />',
    }),
    'https://test.com',
  )

  t.is(found.length, 1)
})

test.failing('finds json 1.0 feeds', (t) => {
  const found = getFeeds(
    makeDoc({
      head: '<link rel="alternate" href="/feed.json" type="application/json" />',
    }),
    'https://test.com',
  )

  t.is(found.length, 1)
})

test('finds multiple feeds', (t) => {
  const found = getFeeds(
    makeDoc({
      head: `
        <link rel="alternate" href="/feed" type="application/rss+xml" />
        <link rel="alternate" href="/feed-alternate" type="application/rss+xml" />
      `,
    }),
    'https://test.com',
  )

  t.is(found.length, 2)
})

test('finds multiple feeds of different types', (t) => {
  const found = getFeeds(
    makeDoc({
      head: `
        <link rel="alternate" href="/feed" type="application/rss+xml" />
        <link rel="alternate" href="/feed.xml" type="application/atom+xml" />
      `,
    }),
    'https://test.com',
  )

  t.is(found.length, 2)
})

test('returns url and feed type', (t) => {
  const { url, type } = getFeeds(
    makeDoc({
      head: `
        <link rel="alternate" href="/feed" type="application/rss+xml" />
      `,
    }),
    'https://test.com',
  )[0]

  t.true(url instanceof URL)
  t.is(type, 'application/rss+xml')
})

test('converts relative feed href to absolute URLs', (t) => {
  const found = getFeeds(
    makeDoc({
      head: `
        <link rel="alternate" href="/feed" type="application/rss+xml" />
      `,
    }),
    'https://test.com',
  )

  t.is(found[0].url.toString(), 'https://test.com/feed')
})
