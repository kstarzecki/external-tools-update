const fs = require('fs')
const convert = require('xml-js')
const inquirer = require('inquirer')

async function getCourseID () {
  await inquirer
    .prompt({
      type: 'input',
      name: 'courseID',
      message: 'Provide Canvas CourseID (https://canvas.kth.se/courses/XXX):',
      default: '9298',
      validate: function (answer) {
        if (answer.length < 1) {
          return 'You must specify the search term!'
        }
        return true
      }
    })
    .then(answers => {
      generateSEBConfig(answers.courseID)
    })
}

function generateSEBConfig (courseID) {
  const xml = fs.readFileSync('SebClientSettings.seb', 'utf8')
  const readOptions = { ignoreComment: false, alwaysChildren: true }
  const sebConfig = convert.xml2js(xml, readOptions)
  let ruleString = ''
  const ruleArr = []
  sebConfig.elements[1].elements[0].elements[3].elements[0].text = `https://canvas.kth.se/courses/${courseID}`// starturl
  sebConfig.elements[1].elements[0].elements[237].elements[1].elements[5].elements[0].text = `([\\w\\d]+\\.)?canvas\\.kth\\.se\\/courses\\/${courseID}$`// URLFilterRules1
  sebConfig.elements[1].elements[0].elements[237].elements[2].elements[5].elements[0].text = `([\\w\\d]+\\.)?canvas\\.kth\\.se\\/courses\\/${courseID}\\/assignments(\\/.*)?$` // URLFilterRules2
  sebConfig.elements[1].elements[0].elements[237].elements[3].elements[5].elements[0].text = `([\\w\\d]+\\.)?canvas\\.kth\\.se\\/courses\\/${courseID}\\/external_tools\\/retrieve\\?display=full_width&url=https%3A%2F%2Fkth.quiz-lti-dub-prod.instructure.com(.*)?$` // URLFilterRules3
  sebConfig.elements[1].elements[0].elements[237].elements[4].elements[5].elements[0].text = `([\\w\\d]+\\.)?canvas\\.kth\\.se\\/courses\\/${courseID}\\/modules(\\/.*)?$` // URLFilterRules4
  sebConfig.elements[1].elements[0].elements[237].elements[5].elements[5].elements[0].text = `([\\w\\d]+\\.)?canvas\\.kth\\.se\\/courses\\/${courseID}\\/modules/items/([0-9]+)?$` // URLFilterRules5
  sebConfig.elements[1].elements[0].elements[237].elements[6].elements[5].elements[0].text = `([\\w\\d]+\\.)?canvas\\.kth\\.se\\/courses\\/${courseID}\\/modules\\#module_([0-9]+)$` // URLFilterRules6
  sebConfig.elements[1].elements[0].elements[237].elements[7].elements[5].elements[0].text = `([\\w\\d]+\\.)?canvas\\.kth\\.se\\/courses\\/${courseID}\\/pages\\/([a-zA-Z0-9_.-]+)\\?module_item_id=([0-9]+)$` // URLFilterRules7
  sebConfig.elements[1].elements[0].elements[237].elements[8].elements[5].elements[0].text = `([\\w\\d]+\\.)?canvas\\.kth\\.se\\/courses\\/${courseID}\\/quizzes(\\/.*)?$` // URLFilterRules8
  sebConfig.elements[1].elements[0].elements[237].elements[9].elements[5].elements[0].text = `([\\w\\d]+\\.)?canvas\\.kth\\.se\\/courses\\/${courseID}\\/student_view(\\/.*)?$`// URLFilterRules9
  sebConfig.elements[1].elements[0].elements[237].elements[10].elements[5].elements[0].text = `([\\w\\d]+\\.)?canvas\\.kth\\.se\\/courses\\/${courseID}\\/test_student(\\/.*)?$` // URLFilterRules10
  sebConfig.elements[1].elements[0].elements[237].elements[18].elements[5].elements[0].text = `([\\w\\d]+\\.)?canvas\\.kth\\.se\\/courses\\/${courseID}\\/files\\/([a-zA-Z0-9_.-]+)\\?module_item_id=([0-9]+)$` // URLFilterRules11
  for (let i = 0; i < sebConfig.elements[1].elements[0].elements[237].elements.length; i++) {
    ruleArr.push(sebConfig.elements[1].elements[0].elements[237].elements[i].elements[5].elements[0].text)
    ruleString = ruleArr.join(';')
  }
  sebConfig.elements[1].elements[0].elements[245].elements[0].text = ruleString
  writeXML(sebConfig, courseID)
}

function writeXML (source, courseID) {
  // write xml to file
  const writeOptions = { compact: false, ignoreComment: false, spaces: 2, fullTagEmptyElement: true }
  const sebConfigName = `SebClientSettings-${courseID}`
  const file = convert.js2xml(source, writeOptions)
  const path = `${sebConfigName}.seb`
  const buffer = Buffer.from(file, 'utf-8')
  fs.open(path, 'w', function (e, fd) {
    if (e) {
      console.error(`XML FILE ERR: ${e}`)
    }
    fs.write(fd, buffer, 0, buffer.length, null, function (e) {
      if (e) console.error(`XML WRITE ERROR: ${e}`)
      fs.close(fd, function () {
        console.info(`XML OK: ${sebConfigName}.seb`)
      })
    })
  })
}

function start () {
  getCourseID()
}

start()
