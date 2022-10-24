import { parseHTML } from 'linkedom'
import got from 'got'
import { getPosts, getFeeds, getIcons } from './util/elements.js'
import { getPostContent, microformatsParser } from './util/parser.js'

let pageInfo = {}

function parseSiteContent(rawContent) {
  return parseHTML(rawContent).document
}

function getSiteContent(document) {
  return {
    posts: getPosts(document, pageInfo),
    feeds: getFeeds(document, pageInfo.url),
    meta: {
      title: document.title.trim(),
      description: document.head
        .querySelector('[name="description"]')
        ?.getAttribute('content'),
      icons: getIcons(document, pageInfo.url),
    },
  }
}

function parsePosts(posts) {
  const { useMicroformats } = pageInfo

  return Promise.all(
    [...posts].map(async (post) =>
      useMicroformats
        ? microformatsParser(post)
        : await getPostContent(post, pageInfo),
    ),
  )
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
