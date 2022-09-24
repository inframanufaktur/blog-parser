import { parseHTML } from 'linkedom'
import got from 'got'
import chalk from 'chalk'

let pageInfo = {}

function consoleWarning(message) {
  console.warn(
    chalk.yellow(`${chalk.bold('@inframanufaktur/parse-blog')}: ${message}`),
  )
}

function parseSiteContent(rawContent) {
  return parseHTML(rawContent).document
}

/**
 *
 * @TODO Find way to check for JSON feeds
 *
 * @param {Document} document
 */
function getFeeds(document) {
  const feedTypes = ['application/atom+xml', 'application/rss+xml']

  let feeds = []

  feedTypes.forEach((type) => {
    feeds.push([...document.head.querySelectorAll(`[type="${type}"]`)])
  })

  return feeds.flat().map((feed) => new URL(feed.href, pageInfo.url))
}

/**
 * Make sense of wibbly wobbly timey wimey things, aka dates on websites
 *
 * @param {HTMLElement} parent
 * @param {HTMLElement | null} elementSelector
 *
 * @return {Date | null}
 */
function getPostDate(parent, elementSelector) {
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

  if ($element.hasAttribute('dateTime')) {
    date = new Date($element.getAttribute('dateTime'))
  } else {
    date = new Date($element.innerText)
  }

  if (date.toString() === 'Invalid date') return null

  return date
}

function getSiteContent(document) {
  const { elements } = pageInfo

  const posts = document.querySelectorAll(elements.posts)

  if (posts.length === 0) {
    consoleWarning(`Could not find any posts on «${document.title.trim()}»`)
  }

  return {
    posts,
    feeds: getFeeds(document),
    meta: {
      title: document.title.trim(),
    },
  }
}

function getPostContent(post) {
  const { elements } = pageInfo

  let postInformation = {
    title: post.querySelector(elements.postTitle).innerText,
    url: new URL(post.querySelector(elements.postURL).href, pageInfo.url),
    date: getPostDate(post, elements.postDate),
  }

  if (elements.postIntro) {
    Object.defineProperty(postInformation, 'postIntro', {
      enumerable: true,
      writable: false,
      value: post.querySelector(elements.postIntro)?.innerHTML,
    })
  }

  return postInformation
}

function parsePosts(posts) {
  return [...posts].map((post) => getPostContent(post))
}

export async function getBlog(infos) {
  pageInfo = infos

  let data = await got.get(infos.url).text()
  const document = parseSiteContent(data)

  const { posts, meta, feeds } = getSiteContent(document)

  return {
    posts: parsePosts(posts),
    meta,
    feeds,
  }
}
