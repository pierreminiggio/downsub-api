import { BrowserConnectOptions, BrowserLaunchArgumentOptions, LaunchOptions, Product } from 'puppeteer';
declare type PuppeteerOptions = LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions & {
    product?: Product;
    extraPrefsFirefox?: Record<string, unknown>;
};
export default class DownsubAPI {
    puppeteerOptions: PuppeteerOptions;
    getSubs(videoLink: string): Promise<any>;
}
export {};
