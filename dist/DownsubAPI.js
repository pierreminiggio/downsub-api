"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
class DownsubAPI {
    constructor() {
        this.puppeteerOptions = {
            args: ['--no-sandbox']
        };
    }
    async getSubs(videoLink) {
        let browser;
        try {
            browser = await puppeteer_1.default.launch(this.puppeteerOptions);
        }
        catch (browserLaunchError) {
            throw browserLaunchError;
        }
        try {
            const pages = await browser.pages();
            const page = pages.length > 0 ? pages[0] : await browser.newPage();
            await page.goto('https://downsub.com/?url=' + videoLink);
            const lineSelector = '.layout.justify-start';
            const firstLineSelector = lineSelector + ':first-child';
            await page.waitForSelector(firstLineSelector);
            const languagesLinesSelector = firstLineSelector + ', ' + firstLineSelector + '+' + lineSelector;
            const languages = await page.evaluate(languagesLinesSelector => {
                const elements = Array.from(document.querySelectorAll(languagesLinesSelector));
                const subtitles = [];
                for (const element of elements) {
                    subtitles.push({
                        name: element.querySelector('.text-left').innerText.trim()
                    });
                }
                return subtitles;
            }, languagesLinesSelector);
            const subtitles = [];
            await new Promise(async (resolve) => {
                const responseHandler = async (response) => {
                    const url = response.url();
                    if (!url.includes('https://subtitle.downsub.com/')
                        && !url.includes('https://subtitle2.downsub.com/')) {
                        return;
                    }
                    const endFunction = () => {
                        page.off('response', responseHandler);
                        resolve(undefined);
                    };
                    if (languages.length === 0) {
                        return endFunction();
                    }
                    const language = languages.shift();
                    if (!language) {
                        return endFunction();
                    }
                    subtitles.push({
                        language,
                        file: url
                    });
                };
                page.on('response', responseHandler);
                await page.client().send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: './' });
                await page.evaluate(async (languagesLinesSelector) => {
                    const elements = Array.from(document.querySelectorAll(languagesLinesSelector));
                    for (const element of elements) {
                        element.querySelector('button').click();
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }, languagesLinesSelector);
                await page.waitForTimeout(5000);
                resolve(undefined);
            });
            if (languages.length) {
                await browser.close();
                throw new Error('Incomplete subtitles : ' + JSON.stringify(subtitles));
            }
            await browser.close();
            return subtitles;
        }
        catch (puppeteerError) {
            await browser.close();
            throw puppeteerError;
        }
    }
}
exports.default = DownsubAPI;
