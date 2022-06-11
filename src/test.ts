import DownsubAPI from './DownsubAPI';

(async() => {
    const api = new DownsubAPI()
    api.puppeteerOptions.headless = false

    const downloadLink = await api.getSubs('https://www.youtube.com/watch?v=RRY1jrIDhvU')
    console.log(JSON.stringify(downloadLink))
})()
