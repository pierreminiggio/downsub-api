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
        }
        catch (puppeteerError) {
            await browser.close();
            throw puppeteerError;
        }
    }
}
exports.default = DownsubAPI;
