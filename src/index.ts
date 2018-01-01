import * as puppeteer from 'puppeteer'
import * as fs from 'fs'

type GameLink = {
  href: string,
  text: string,
}

type GameDetail = {
  url: string,
  name: string,
  category: string | null,
  appid: number | null
}

export function start(url: string, outpath?: string): Promise<void> {
  return fetch(url).then((list) => {
    if (outpath) {
      fs.writeFileSync(outpath, JSON.stringify(list), 'utf8')
    }
  })
}

async function fetch(url: string): Promise<GameDetail[]> {
  const browser = await puppeteer.launch()
  try {
    const page = await browser.newPage()
    await page.goto(url)
    await page.setViewport({ width: 800, height: 30000 })
    await autoScroll(page)
    const links = await extractURL(page)
    return extractGameDetailsFrom(links)
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

function extractURL(page: puppeteer.Page): Promise<GameLink[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('a'))
      .filter(elm => elm.href.match(/^https?:\/\/store\.steampowered\.com\//))
      .map(elm => {
        return {
          href: elm.href,
          text: elm.textContent,
        }
      })
  )
}

function extractGameDetailsFrom(links: GameLink[]): GameDetail[] {
  return links.map(link => {
    const result = link.href.match(/https?:\/\/[-\+;:&@=\$,\.\w_]+\/(\w+)\/(\d+)/)
    const category = ((result instanceof Array) && result[1]) ? result[1] : ''
    const appid = ((result instanceof Array) && result[2]) ? parseInt(result[2]) : null
    return {
      url: link.href,
      name: link.text,
      category: category,
      appid: appid
    }
  })
}
