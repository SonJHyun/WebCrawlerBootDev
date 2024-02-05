const { JSDOM } = require('jsdom')

async function crawlPage(baseURL, currentURL, pages) {
    const baseURLObj = new URL(baseURL)
    const currentURLObj = new URL(currentURL)

    if (baseURLObj.hostname !== currentURLObj.hostname) {
        return pages
    }

    const normalizedCurrentURL = normalizeURL(currentURL)
    if (pages[normalizedCurrentURL] > 0) {
        pages[normalizedCurrentURL]++
        return pages
    } else {
        pages[normalizedCurrentURL] = 1
    }

    console.log(`actively crawling: ${currentURL}`)

    let htmlBody = ''
    try {
      const resp = await fetch(currentURL)
      if (resp.status > 399){
        console.log(`Got HTTP error, status code: ${resp.status}`)
        return pages
      }
      const contentType = resp.headers.get('content-type')
      if (!contentType.includes('text/html')){
        console.log(`Got non-html response: ${contentType}`)
        return pages
      }
      htmlBody = await resp.text()
    } catch (err){
      console.log(err.message)
    }

    const nextURLs = getURLsFromHTML(htmlBody, baseURL)
    for (const nextURL of nextURLs){
      pages = await crawlPage(baseURL, nextURL, pages)
    }

    return pages
}

const getURLsFromHTML = (htmlBody, baseURL) => {
    const urls = [];
    const dom = new JSDOM(htmlBody);
    const aElements = dom.window.document.querySelectorAll('a');
    for (const aElement of aElements) {
        if (aElement.href.slice(0, 1) === '/') {
            try {
                urls.push(new URL(aElement.href, baseURL).href);
            } catch (err) {
                console.log(`${err.message}: ${aElement.href}`);
            }
        } else {
            try {
                urls.push(new URL(aElement.href).href);
            } catch (err) {
                console.log(`${err.message}: ${aElement.href}`)
            }
        }
    }

    return urls;
}

const normalizeURL = (urlString) => {
    const url = require('node:url');
    const myUrl = new URL(urlString);
    let normalizedURL = myUrl.hostname + myUrl.pathname;
    if (normalizedURL[normalizedURL.length - 1] === '/') {
        normalizedURL = normalizedURL.substring(0, normalizedURL.length - 1);
    }
    return normalizedURL;
}

module.exports = {
    normalizeURL,
    getURLsFromHTML,
    crawlPage
}
  