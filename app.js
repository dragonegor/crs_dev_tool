import puppeteer from 'puppeteer'
import express from 'express'
import chalk from 'chalk'
import chokidar from 'chokidar'
import 'dotenv/config'

const port = process.env.PORT || 3009
const app = express()
const testUrl = process.env.TEST_URL
const testFileName = process.env.TEST_PATH + '/index.js'

app.use('/files', express.static('build'))

app.get('/', async (req, res) => {
  const browser = await puppeteer.launch({
    headless: false,
    // devtools: true,
    defaultViewport: null,
    args: ['--start-maximized']
  })
  const page = await browser.newPage()
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  )
  await page.setExtraHTTPHeaders({
    'accept-language': 'en-US,en;q=0.9'
  })
  await page.evaluateOnNewDocument(
    (fileName, p) => {
      const check = setInterval(() => {
        if (document.head) {
          clearInterval(check)
          const scriptTest = document.createElement('script')
          scriptTest.src = `http://localhost:${p}/files/${fileName}`
          scriptTest.async = true
          if (window === window.top) {
            document.head.appendChild(scriptTest)
          }
        }
      })
    },
    testFileName,
    port
  )
  await page.goto(testUrl)
  console.log(chalk.greenBright('Browser started!'))
  const watcher = chokidar.watch(`build/${testFileName}`, {
    persistent: true
  })

  watcher.on('change', async () => {
    console.log(chalk.yellow('File changed!'))
    await page.reload()
    console.log(chalk.yellow('Page reloaded!'))
  })
  res.send('Browser launched!')
})

app.listen(port, console.log(chalk.green(`Example app listening on port http://localhost:${port}`)))
