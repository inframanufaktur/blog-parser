const { parseHTML } = require('linkedom')
const got = require('got')
const chalk = require('chalk')

function parseSiteContent(rawContent) {
  return parseHTML(rawContent).document
}

function getSiteContent(document, elementSelectors) {
  const posts = document.querySelectorAll(elementSelectors.posts)

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

function getPostContent(post, elementSelectors) {
  return {
    title: post.querySelector(elementSelectors.postTitle).innerText,
    url: new URL(post.querySelector(elementSelectors.postURL).href),
    date: new Date(post.querySelector(elementSelectors.postDate).innerText),
  }
}

function parsePosts(posts, elementSelectors) {
  return [...posts].map((post) => getPostContent(post, elementSelectors))
}

async function getBlog({ url, elements }) {
  let data = await got.get(url).text()
  const document = parseSiteContent(data)

  const { posts, meta } = getSiteContent(document, elements)

  return { parsedPosts: parsePosts(posts), meta }
}

module.exports = { getBlog }
