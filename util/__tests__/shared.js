import { parseHTML } from 'linkedom'

export function makeDoc({ head = '', body = '' }) {
  return parseHTML(
    `<!doctype html><html><head>${head}</head><body>${body}</body></html>`,
  ).document
}

export function getTestContent(testContent = '<time>September 1999</time>') {
  return makeDoc({ body: `<div data-test>${testContent}</div>` }).querySelector(
    '[data-test]',
  )
}
