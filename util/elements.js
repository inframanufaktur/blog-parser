import { consoleWarning } from './notification.js'

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
export function getPostDate(parent, elementSelector) {
  // don't expect posts to have a usable date
  if (elementSelector === null) return null

  const $element = parent.querySelector(elementSelector)

  if ($element === null) {
    consoleWarning(
      `No element for \`postDate\` found using selector «${elementSelector}». Please check markup structure.`,
    )

    return null
  }

  let date

  if ($element.hasAttribute('datetime')) {
    date = new Date($element.getAttribute('datetime'))
  } else if ($element.hasAttribute('dateTime')) {
    date = new Date($element.getAttribute('dateTime'))
  } else {
    date = new Date($element.innerText)
  }

  if (date.toString().toLowerCase() === 'invalid date') return null

  return date
}
