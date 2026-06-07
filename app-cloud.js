import { connect } from 'puppeteer-real-browser'
import express from 'express'
import chalk from 'chalk'
import chokidar from 'chokidar'
import 'dotenv/config'
import fs from 'fs'

const port = process.env.PORT || 3009
const app = express()
const testUrl = process.env.TEST_URL
const testFileName = process.env.TEST_PATH + '/index.js'
app.use('/files', express.static('build'))

app.get('/', async (req, res) => {
  const browser = await connect({
    headless: false,

    customConfig: {},
    args: ['--start-maximized'],
    // fingerprint: true,
    // turnstile: true,
    connectOption: {
      defaultViewport: null
    }
  })
  const code = fs.readFileSync(`build/${testFileName}`, 'utf-8')
  await browser.page.evaluateOnNewDocument(code)
  await browser.page.goto(testUrl)
  console.log(chalk.greenBright('Browser started!'))
  const watcher = chokidar.watch(`build/${testFileName}`, {
    persistent: true
  })

  watcher.on('change', async () => {
    console.log(chalk.yellow('File changed!'))
    await browser.page.reload()
    console.log(chalk.yellow('Page reloaded!'))
  })
  res.send('Browser launched!')
})

app.listen(port, console.log(chalk.green(`Example app listening on port http://localhost:${port}`)))
