import puppeteer, { Browser, BrowserConnectOptions, BrowserLaunchArgumentOptions, HTTPResponse, LaunchOptions, Product } from 'puppeteer'

type PuppeteerOptions = LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions & {
    product?: Product;
    extraPrefsFirefox?: Record<string, unknown>;
}

export type Language = {
    name: string
}

export type Subtitle = {
    language: Language,
    file: string
}

export default class DownsubAPI {

    public puppeteerOptions: PuppeteerOptions = {
        args: ['--no-sandbox']
    }

    async getSubs(videoLink: string): Promise<any>
    {
        let browser: Browser

        try {
            browser = await puppeteer.launch(this.puppeteerOptions)
        } catch (browserLaunchError: any) {
            throw browserLaunchError;
        }

        try {
            const pages = await browser.pages()
            const page = pages.length > 0 ? pages[0] : await browser.newPage()

            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36 OPR/87.0.4390.45')

            await page.goto('https://downsub.com/?url=' + videoLink)

            const lineClasseNames = ['layout', 'justify-start']
            const lineSelector = '.' + lineClasseNames.join('.')
            const firstLineSelector = lineSelector + ':first-child'

            await page.waitForSelector(firstLineSelector)
            await page.waitForSelector('#ds-qc-info')

            const languages: Language[]|null = await page.evaluate(
                (firstLineSelector, lineClasseNames) => {
                    let element = document.querySelector(firstLineSelector)

                    if (! element) {
                        return null
                    }

                    const languages: Language[] = []

                    while (true) {

                        if (! element) {
                            return languages
                        }

                        const name = element.querySelector('.text-left')?.innerText.trim()

                        if (! name) {
                           continue
                        }

                        languages.push({name})

                        const nextElement = element.nextElementSibling

                        for (const lineClasseName of lineClasseNames) {
                            if (! nextElement.classList.contains(lineClasseName)) {
                                return languages
                            }
                        }

                        element = nextElement
                    }
                },
                firstLineSelector,
                lineClasseNames
            )

            if (! languages) {
                throw new Error('No language. HTML : ' + await page.evaluate(() => document.head.outerHTML + document.body.outerHTML))
            }

            const subtitles: Subtitle[] = []

            await new Promise(async resolve => {
                const responseHandler = async (response: HTTPResponse) => {
                    const url = response.url()
    
                    if (
                        ! url.includes('https://subtitle.downsub.com/')
                        && ! url.includes('https://subtitle2.downsub.com/')
                    ) {
                        return
                    }

                    const endFunction = (): void => {
                        page.off('response', responseHandler)
                        resolve(undefined)
                    }
    
                    if (languages.length === 0) {
                        return endFunction()
                    }
                    
                    const language = languages.shift()

                    if (! language) {
                        return endFunction()
                    }
                    
                    subtitles.push({
                        language,
                        file: url
                    })
                }
    
                page.on('response', responseHandler)
    
                await page.client().send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: './'})
    
                await page.evaluate(
                    async (firstLineSelector, lineClasseNames) => {
                        let element = document.querySelector(firstLineSelector)
    
                        while (true) {

                            if (! element) {
                                return
                            }

                            const name = element.querySelector('.text-left')?.innerText.trim()
    
                            if (! name) {
                               continue
                            }
    
                            element.querySelector('button').click()
                            await new Promise(resolve => setTimeout(resolve, 2000))
    
                            const nextElement = element.nextElementSibling
    
                            for (const lineClasseName of lineClasseNames) {
                                if (! nextElement.classList.contains(lineClasseName)) {
                                    return
                                }
                            }
    
                            element = nextElement
                        }
                    },
                    firstLineSelector,
                    lineClasseNames
                )

                await page.waitForTimeout(5000)

                resolve(undefined)
            })

            if (languages.length) {
                await browser.close()
                throw new Error('Incomplete subtitles : ' + JSON.stringify(subtitles))
            }

            await browser.close()

            return subtitles

        } catch (puppeteerError: any) {
            await browser.close()
            throw puppeteerError;
        }
    }
}
