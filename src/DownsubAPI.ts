import puppeteer, { Browser, BrowserConnectOptions, BrowserLaunchArgumentOptions, LaunchOptions, Page, Product } from 'puppeteer'

type PuppeteerOptions = LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions & {
    product?: Product;
    extraPrefsFirefox?: Record<string, unknown>;
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

        } catch (puppeteerError: any) {
            await browser.close()
            throw puppeteerError;
        }
    }
}
