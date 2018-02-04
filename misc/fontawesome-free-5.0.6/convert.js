const yaml = require('js-yaml')
const fs = require('fs')

let res = {}
let doc = yaml.safeLoad(fs.readFileSync('advanced-options/metadata/icons.yml', 'utf8'))

Object.keys(doc).forEach((iconId) => {
  let iconDsc = doc[iconId]
  iconDsc.styles.forEach(style => {
    if (!(style in res)) {
      res[style] = {}
    }
    res[style][iconId] = iconDsc.unicode
    if (iconDsc.label) {
      res[style][iconDsc.label] = iconDsc.unicode
    }
  })
})

Object.keys(res).forEach(style => {
  fs.writeFileSync('fa-' + style + '.map', JSON.stringify(res[style]))
})
