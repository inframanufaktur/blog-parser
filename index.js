import { parseHTML } from 'linkedom'
import got from 'got'
import chalk from 'chalk'

let pageInfo = {}

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

function getSiteContent(document) {
  const { elements } = pageInfo

  const posts = document.querySelectorAll(elements.posts)

  if (posts.length === 0) {
    console.warn(
      chalk.yellow(
        `${chalk.bold(
          '@inframanufaktur/parse-blog',
        )}: Could not find any posts on «${document.title.trim()}»`,
      ),
    )
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
    date: new Date(post.querySelector(elements.postDate).innerText),
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
