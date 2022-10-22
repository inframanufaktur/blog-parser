import { parseHTML } from 'linkedom'
import got from 'got'
import { getPosts, getFeeds, getPostDate } from './util/elements.js'

let pageInfo = {}

function parseSiteContent(rawContent) {
  return parseHTML(rawContent).document
}

function getSiteContent(document) {
  const { elements } = pageInfo

  return {
    posts: getPosts(document, elements.posts),
    feeds: getFeeds(document, pageInfo.url),
    meta: {
      title: document.title.trim(),
      description: document.head
        .querySelector('[name="description"]')
        ?.getAttribute('content'),
    },
  }
}

async function getPostContent(post) {
  const { elements, dateParseOptions = {} } = pageInfo

  let postInformation = {
    title: post.querySelector(elements.postTitle).innerText,
    url: new URL(post.querySelector(elements.postURL).href, pageInfo.url),
    date: await getPostDate(post, elements.postDate, dateParseOptions),
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
  return Promise.all([...posts].map(async (post) => await getPostContent(post)))
}

export async function getBlog(infos) {
  pageInfo = infos

  let data = await got.get(infos.url).text()
  const document = parseSiteContent(data)

  const { posts, meta, feeds } = getSiteContent(document)

  return {
    posts: await parsePosts(posts),
    meta,
    feeds,
  }
}
