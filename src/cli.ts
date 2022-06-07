import DownsubAPI from './DownsubAPI';

const args = process.argv
const argsLength = args.length

if (argsLength < 3) {
    console.log('Use like this : node dist/cli.js <youtubeVideoLink>')
    process.exit()
}

const link = args[2];

(async() => {
    const api = new DownsubAPI()

    const downloadLink = await api.getSubs(link)
    console.log(JSON.stringify(downloadLink))
})()
