import * as puppeteer from "puppeteer";
import * as fs from "fs";

export type GameLink = {
  href: string;
  text: string;
};

export type GameDetail = {
  url: string;
  name: string;
  category: string | null;
  appid: number | null;
};

export function start(url: string, outpath: string): Promise<void> {
  return fetch(url).then(list => {
    if (outpath) {
      fs.writeFileSync(outpath, JSON.stringify(list), "utf8");
    }
  });
}

export async function fetch(url: string): Promise<GameDetail[]> {
  const browser = await puppeteer.launch({ headless: false });
  try {
    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({ width: 800, height: 30000 });
    await page.waitFor(5000);
    const links = await extractURL(page);
    return extractGameDetailsFrom(links);
  } finally {
    await browser.close();
  }
}

async function extractURL(page: puppeteer.Page): Promise<GameLink[]> {
  const result = [];
  let lastUrl = "";
  let failedCount = 0;

  await page.keyboard.down("ArrowDown");
  await page.keyboard.down("ArrowRight");

  while (true) {
    const context = await page.evaluate(() => {
      const elm: any = Array.from(document.querySelectorAll(".string"));
      if (elm.length != 2) {
        return null;
      }

      const url = elm[0].textContent.replace(/^"+|"+$/g, "");
      const title = elm[1].textContent.replace(/^"+|"+$/g, "");
      if (/^https?:\/\/store\.steampowered\.com\//.test(url)) {
        return {
          href: url,
          text: title
        };
      }
      return null;
    });

    if (!context) {
      failedCount++;
    } else if (context.href === lastUrl) {
      failedCount++;
    } else {
      result.push(context);
      lastUrl = context.href;
    }

    if (failedCount >= 5) {
      break;
    }

    await page.keyboard.down("ArrowDown");
  }

  return result;
}

function extractGameDetailsFrom(links: GameLink[]): GameDetail[] {
  return links.map(link => {
    const result = link.href.match(
      /https?:\/\/[-\+;:&@=\$,\.\w_]+\/(\w+)\/(\d+)/
    );
    const category = result instanceof Array && result[1] ? result[1] : "";
    const appid =
      result instanceof Array && result[2] ? parseInt(result[2]) : null;
    return {
      url: link.href,
      name: link.text,
      category: category,
      appid: appid
    };
  });
}
