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
    postIntro: '.c-card__intro',
  },
}
```

All items in `elements` must be valid CSS selector strings, as they are used by `querySelector`.

Note: `postIntro` can be omitted or set to `null`. `postDate` can be `null`.

The result of `postURL` will parsed using `new URL` and `postDate` using `new Date`.

### Microformats

If the page you are scraping has embedded spec-conformant microformats, you can omit the `elements` from `parserInfo` and instead set `useMicroformats`:

```js
const blogData = {
  url: 'https://ind.ie/blog/',
  useMicroformats: true,
}
```

Note: For this to work, the page must have a) a root element with the `.h-feed` or `.hfeed` class and b) `.h-entry` elements which must have `.p-name` and `.u-url` set. `.dt-published` and `.p-summary` are optional.

### Parsing Dates

Additionally to the basic format above, you can add date handling.

```js
const blogData = {
  url: 'https://www.somewebsite.com/blog/',
  elements: {
    posts: 'article.c-listing__item',
    postTitle: '.c-card__title',
    postURL: '.c-card__title',
    postDate: '.c-card__extra-meta',
    postIntro: '.c-card__intro',
  },
  dateParseOptions: {
    locale: 'de',
    customParseFormat: 'MMMM YYYY'
  }
}
```

The date parsing uses [dayjs](https://day.js.org/) to allow for more flexibility than the native JavaScript Date.

Say, you are scraping a German website which only displays «März 2022» as their date. Thanks to dayjs’ [`customParseFormat` plugin](https://day.js.org/docs/en/plugin/custom-parse-format) we can make sense of this.

Please check the [list of all available parsing options](https://day.js.org/docs/en/parse/string-format#list-of-all-available-parsing-tokens) to see how strings can be parsed.

If `locale` is set, this will be imported and used. Check the [list of available locales](https://github.com/iamkun/dayjs/tree/dev/src/locale) if you want to know if your locale is supported.

## Usage

```js
const { getBlog } = require('@inframanufaktur/blog-parser')

await getBlog(blogData)
// returns an Array of posts and, additionally, meta data of the site
```

### What it returns

#### Posts

An array of all posts on the page.

```js
[
  {
    title: <String>,
    url: <URL>,
    date: <Date | null>,
    postIntro?: <String>
  }
]
```

Note: `date` might be `null` if no element selector was given or if the date on the page couldn’t be parsed with `new Date()`.

`postIntro` is only included if `elements.postIntro` was provided.

#### Meta

```js
{
  title: <String>
}
```

#### Feeds

Get all `application/atom+xml` and `application/rss+xml` feeds. Returns an array of URL interfaces.

Note: Does not work for JSON feeds at the moment.

```js
[
  <URL>
]
```

### Empty pages

The module shows a warning in the console if no posts could be found using the `elements.posts` selector string.

---

A project by Cyber Design Inframanufaktur. Copyleft 2022.
