import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'

import { consoleWarning } from './notification.js'

dayjs.extend(customParseFormat)
// dayjs.extend(utc)

export function getPosts(document, selector) {
  const posts = document.querySelectorAll(selector)

  if (posts.length === 0) {
    consoleWarning(`Could not find any posts on «${document.title.trim()}»`)
  }

  return posts
}

/**
 *
 * @TODO Find way to check for JSON feeds
 *
 * @param {Document} document
 */
export function getFeeds(document, baseURL = '') {
  const feedTypes = ['application/atom+xml', 'application/rss+xml']

  let feeds = []

  feedTypes.forEach((type) => {
    feeds.push([...document.head.querySelectorAll(`[type="${type}"]`)])
  })

  return feeds.flat().map((feed) => new URL(feed.href, baseURL))
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

export function getIcon(document, baseURL) {
  const { head } = document

  const iconRels = ['icon', 'shortcut icon', 'apple-touch-icon']
  let icon = null

  for (const rel of iconRels) {
    const found = head.querySelector(`[rel="${rel}"]`)

    if (found) {
      const { href } = found

      icon = {
        href: new URL(href, baseURL),
      }

      break
    }
  }

  return icon
}
