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
            await page.goto('https://snaptik.app/en');
            const urlInputSelector = '#url';
            await page.waitForSelector(urlInputSelector);
            await page.evaluate((urlInputSelector, videoLink) => document.querySelector(urlInputSelector).value = videoLink, urlInputSelector, videoLink);
            const submitButtonSelector = '#submiturl';
            await page.waitForSelector(submitButtonSelector);
            await page.click(submitButtonSelector);
            const highDefinitionDownloadLink = '[title="Download Server 02"]';
            try {
                await page.waitForSelector(highDefinitionDownloadLink);
            }
            catch (noDownloadLinkFoundError) {
                const errorMessageSelector = '.msg-error';
                const errorMessage = await page.evaluate(errorMessageSelector => { var _a; return (_a = document.querySelector(errorMessageSelector)) === null || _a === void 0 ? void 0 : _a.innerText; }, errorMessageSelector);
                await browser.close();
                throw new Error('Probably a bad video link : ' + errorMessage);
            }
            const downloadLink = await page.evaluate(highDefinitionDownloadLink => { var _a; return (_a = document.querySelector(highDefinitionDownloadLink)) === null || _a === void 0 ? void 0 : _a.href; }, highDefinitionDownloadLink);
            await browser.close();
            if (downloadLink) {
                return downloadLink;
            }
            throw new Error('No download link :\'(');
        }
        catch (puppeteerError) {
            await browser.close();
            throw puppeteerError;
        }
    }
}
exports.default = DownsubAPI;
