import test from 'ava'

import { getPosts } from '../elements.js'
import { makeDoc } from './shared.js'

test('returns an empty array if no h-entry are found', (t) => {
  const posts = getPosts(
    makeDoc({ head: '<title>Test Page</title>', body: '<div></div>' }),
    {
      useMicroformats: true,
      url: 'https://test.com',
    },
  )

  t.is(posts.length, 0)
})
