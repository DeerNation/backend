#!/usr/bin/env node

let filestocopy = [{
  'res/drawable-mdpi/deer.png':
    'platforms/android/app/src/main/res/drawable-mdpi/deer.png'
}, {
  'res/drawable-hdpi/deer.png':
    'platforms/android/app/src/main/res/drawable-hdpi/deer.png'
}, {
  'res/drawable-xhdpi/deer.png':
    'platforms/android/app/src/main/res/drawable-xhdpi/deer.png'
}, {
  'res/drawable-xxhdpi/deer.png':
    'platforms/android/app/src/main/res/drawable-xxhdpi/deer.png'
}, {
  'res/drawable-xxxhdpi/deer.png':
    'platforms/android/app/src/main/res/drawable-xxxhdpi/deer.png'
}]

const fs = require('fs')
const path = require('path')

// no need to configure below
const rootdir = process.argv[2]

filestocopy.forEach(function (obj) {
  Object.keys(obj).forEach(function (key) {
    let val = obj[key]
    let srcfile = path.join(rootdir, key)
    let destfile = path.join(rootdir, val)
    let destdir = path.dirname(destfile)
    if (fs.existsSync(srcfile) && fs.existsSync(destdir)) {
      console.log('copying ' + srcfile + ' to ' + destfile)
      fs.createReadStream(srcfile).pipe(
        fs.createWriteStream(destfile))
    }
  })
})
