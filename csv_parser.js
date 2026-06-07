import fs from 'fs'
import csv from 'csv-parser'

const results = {}

fs.createReadStream('temp/blogs.csv')
  .pipe(
    csv({
      separator: ';'
    })
  )
  .on('data', data => {
    const path = data.path
    if (!results[path]) {
      results[path] = {
        header: data.header,
        bullets: []
      }
    }
    if (results[path].bullets.length === 0) {
      results[path].bullets.push(...data.bullets.split('- ').filter(bullet => bullet.trim() !== ''))
    }
  })
  .on('end', () => {
    const jsonString = JSON.stringify(results, null, 2)
    fs.writeFile('output.json', jsonString, err => {
      if (err) {
        console.error('Error writing file', err)
      } else {
        console.log('Successfully wrote file')
      }
    })
  })
