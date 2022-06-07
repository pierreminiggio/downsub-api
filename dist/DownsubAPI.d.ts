import { BrowserConnectOptions, BrowserLaunchArgumentOptions, LaunchOptions, Product } from 'puppeteer';
declare type PuppeteerOptions = LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions & {
    product?: Product;
    extraPrefsFirefox?: Record<string, unknown>;
};
export declare type Language = {
    name: string;
};
export declare type Subtitle = {
    language: Language;
    file: string;
};
export default class DownsubAPI {
    puppeteerOptions: PuppeteerOptions;
    getSubs(videoLink: string): Promise<any>;
}
export {};
