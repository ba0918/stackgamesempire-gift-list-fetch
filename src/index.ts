import * as puppeteer from 'puppeteer'
import * as fs from 'fs'

type GameDetail = {
  url: string,
  category: string | null,
  appid: number | null
}

export function start(url: string, outpath?: string): Promise<void> {
  return fetch(url).then((list) => {
    if (outpath) {
      fs.writeFileSync(outpath, JSON.stringify(list), 'utf-8')
    }
  })
}

async function fetch(url: string): Promise<GameDetail[]> {
  const browser = await puppeteer.launch()
  try {
    const page = await browser.newPage()
    await page.goto(url)
    await page.setViewport({ width: 800, height: 10000 })
    await autoScroll(page)
    const urls = await extractURL(page)
    return extractGameDetailsFrom(urls)
  } finally {
    await browser.close()
  }
}

function autoScroll(page: puppeteer.Page): Promise<any> {
  return page.evaluate(() => {
    return new Promise(resolve => {
      let totalHeight = 0
      const distance = 100
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight
        totalHeight += distance
        if (totalHeight >= scrollHeight) {
          clearInterval(timer)
          resolve()
        }
      })
    })
  })
}

function extractURL(page: puppeteer.Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('a'))
      .filter(elm => elm.href.match(/^https?:\/\/store\.steampowered\.com\//))
      .map(elm => elm.href)
  )
}

function extractGameDetailsFrom(urls: string[]): GameDetail[] {
  return urls.map(url => {
    const result = url.match(/https?:\/\/.*\/(\w+)\/(\d+)/)
    const category = ((result instanceof Array) && result[1]) ? result[1] : ''
    const appid = ((result instanceof Array) && result[2]) ? parseInt(result[2]) : null
    return {
      url,
      category: category,
      appid: appid
    }
  })
}
