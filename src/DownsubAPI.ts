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

            await page.goto('https://downsub.com/?url=' + videoLink)

            const lineSelector = '.layout.justify-start'
            const firstLineSelector = lineSelector + ':first-child'

            await page.waitForSelector(firstLineSelector)
            const languagesLinesSelector = firstLineSelector + ', ' + firstLineSelector + '+' + lineSelector

            const languages: Language[] = await page.evaluate(
                languagesLinesSelector => {
                    const elements = Array.from(document.querySelectorAll(languagesLinesSelector))
                    const subtitles = []
                    for (const element of elements) {
                        subtitles.push({
                            name: element.querySelector('.text-left').innerText.trim()
                        })
                    }

                    return subtitles
                },
                languagesLinesSelector
            )

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
                    async languagesLinesSelector => {
                        const elements = Array.from(document.querySelectorAll(languagesLinesSelector))
                        for (const element of elements) {
                            element.querySelector('button').click()
                            await new Promise(resolve => setTimeout(resolve, 2000))
                        }
                    },
                    languagesLinesSelector
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
