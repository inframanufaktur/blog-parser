import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'

import { mf2 } from 'microformats-parser'

import { consoleWarning } from './notification.js'

dayjs.extend(customParseFormat)

/**
 *
 *
 * @export
 * @param {Document} document
 * @param {*} { elements, url, useMicroformats }
 * @return {[]}
 */
export function getPosts(document, { elements, url, useMicroformats }) {
  if (useMicroformats) {
    const feedRoot = document.body.querySelector('.h-feed, .hfeed')

    if (!feedRoot) {
      consoleWarning(
        'Couldn’t find `.h-feed`. Trying to proceed with `elements.posts` or `document.body`.',
      )
    }

    const posts = elements?.posts && document.body.querySelector(elements.posts)

    const { items } = mf2((feedRoot || posts || document.body).innerHTML, {
      baseUrl: url,
    })

    if (items.length === 0) {
      consoleWarning(
        `Could not find any \`h-entry\` items on «${document.title.trim()}»`,
      )
    }

    return items
  }

  const posts = document.querySelectorAll(elements.posts)

  if (posts.length === 0) {
    consoleWarning(`Could not find any posts on «${document.title.trim()}»`)
  }

  return [...posts]
}

/**
 * Finds all RSS and ATOM feeds in the `head` of a Document
 *
 * @TODO Find way to check for JSON feeds v1.0
 *
 * @param {Document} document Document to search for feeds
 * @param {baseURL} string Base to add to feeds which have a relative `href`
 *
 * @returns {URL[]} All found feeds, converted to URLs
 */
export function getFeeds(document, baseURL) {
  const feedTypes = [
    'application/atom+xml',
    'application/rss+xml',
    'application/feed+json',
  ]
  const feedSelector = feedTypes.map((type) => `[type="${type}"]`).join(', ')

  return [...document.head.querySelectorAll(feedSelector)].map(
    (feed) => new URL(feed.href, baseURL),
  )
}

/**
 * Make sense of wibbly wobbly timey wimey things, aka dates on websites
 *
 * @param {HTMLElement} parent
 * @param {HTMLElement | null} elementSelector
 *
 * @return {Date | null}
 */
export async function getPostDate(
  parent,
  elementSelector,
  { locale = null, customParseFormat = false } = {},
) {
  // don't expect posts to have a usable date
  if (elementSelector === null) return null

  const $element = parent.querySelector(elementSelector)

  if ($element === null) {
    consoleWarning(
      `No element for \`postDate\` found using selector «${elementSelector}». Please check markup structure.`,
    )

    return null
  }

  if (locale) {
    await import(`dayjs/locale/${locale}.js`)

    dayjs.locale(locale)
  }

  let dateString

  if ($element.hasAttribute('datetime')) {
    dateString = $element.getAttribute('datetime')
  } else if ($element.hasAttribute('dateTime')) {
    dateString = $element.getAttribute('dateTime')
  } else {
    dateString = $element.innerText
  }

  let date

  if (customParseFormat) {
    date = dayjs(dateString, customParseFormat, locale)
  } else {
    date = dayjs(dateString)
  }

  if (!date.isValid()) return null

  return date.toDate()
}

export function getIcons(document, baseURL) {
  const { head } = document

  const iconRels = [
    'icon',
    'shortcut icon',
    'apple-touch-icon',
    'msapplication-TileImage',
  ]
  let icons = []

  for (const rel of iconRels) {
    const found = Array.from(head.querySelectorAll(`[rel="${rel}"]`))

    if (found.length) {
      icons = [
        ...icons,
        ...found.map((icon) => {
          const rel = icon.getAttribute('rel')
          const sizes = icon.getAttribute('sizes')

          return { url: new URL(icon.href, baseURL), rel, sizes }
        }),
      ]

      break
    }
  }

  return icons
}
