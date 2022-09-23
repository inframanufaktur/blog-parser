import { parseHTML } from 'linkedom'
import got from 'got'
import chalk from 'chalk'

let postInfo = {}

function parseSiteContent(rawContent) {
  return parseHTML(rawContent).document
}

function getSiteContent(document) {
  const { elements } = postInfo

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
    meta: {
      title: document.title.trim(),
    },
  }
}

function getPostContent(post) {
  const { elements } = postInfo

  let postInformation = {
    title: post.querySelector(elements.postTitle).innerText,
    url: new URL(post.querySelector(elements.postURL).href, postInfo.url),
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

export async function getBlog({ url, elements }) {
  postInfo = { url, elements }

  let data = await got.get(url).text()
  const document = parseSiteContent(data)

  const { posts, meta } = getSiteContent(document, elements)

  return { posts: parsePosts(posts), meta }
}
