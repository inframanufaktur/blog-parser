import { getPostDate } from './elements.js'

export async function getPostContent(post, pageInfo) {
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

export function microformatsParser(entry) {
  return {
    title: entry.properties.name[0],
    url: new URL(entry.properties.url[0]),
    ...(entry.properties.summary && { postIntro: entry.properties.summary[0] }),
    ...(entry.properties.published && {
      date: new Date(entry.properties.published[0]),
    }),
  }
}
