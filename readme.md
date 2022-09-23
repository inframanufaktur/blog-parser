# @inframanufaktur/blog-parser

Blog Parser is a utility designed to scrape post information from blog homepages.

This will _not_ (and never will) parse the complete post content. Its sole use is to collect post information to e.g. build an RSS feed for blogs which have none.

Hence, it will only get the first page and blog posts on it. If you want to have caching it must be build on top.

## Post Data

Example post data to get content from a blog:

```js
const blogData = {
  url: 'https://www.somewebsite.com/blog/',
  elements: {
    posts: 'article.c-listing__item',
    postTitle: '.c-card__title',
    postURL: '.c-card__title',
    postDate: '.c-card__extra-meta',
  },
}
```

All items in `elements` must be valid CSS selector strings, as they are used by `querySelector`.

The result of `postURL` will parsed using `new URL` and `postDate` using `new Date`.

## Usage

```js
const { getBlog } = require('@inframanufaktur/blog-parser')

await getBlog(blogData)
// returns an Array of posts and, additionally, meta data of the site
```

The module shows a warning in the console if no posts could be found using the `elements.posts` selector string.

A project by Cyber Design Inframanufaktur. Copyleft 2022.
