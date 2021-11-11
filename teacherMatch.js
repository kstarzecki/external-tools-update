require('dotenv').config()
const Canvas = require('@kth/canvas-api')
const ObjectsToCsv = require('objects-to-csv')
const csv = require('csvtojson')
const _ = require('underscore')

const token = process.env.CANVAS_API_TOKEN_TEST
const url = process.env.CANVAS_API_URL_TEST
const canvas = Canvas(url, token)

const teacherFile = './teacherOutput.csv'
const studentFile = './studentOutput.csv'
const csvFilePath = './members-export.csv'

const canvasEmailList = []
const teacherArr = []
const studentArr = []

async function saveToCsv (arr, file) {
  const csv = new ObjectsToCsv(arr)
  await csv.toDisk(file)

  console.log('-------------------------------------------------------')
  console.log('Done printing contents of ' + file + '.')
  console.log('-------------------------------------------------------')
  console.log('')
}

async function getUserRoles (emails, arr) {
  for (const email of emails) {
    try {
      const users = await canvas.get(`accounts/1/users?search_term=${email}`)
      const userID = users.body[0].id
      try {
        const enrols = await canvas.get(`users/${userID}/enrollments`)
        var isteacher = false
        for (const enrol of enrols.body) {
          if (enrol.type === 'TeacherEnrollment') {
            isteacher = true
          }
        }
      } catch (e) {
        console.error(`Can't get enrol "${e}". Continuing...`)
      }
      if (isteacher) {
        teacherArr.push(_.where(arr, { Email: email })[0])
      } else {
        const role = _.where(arr, { Email: email })[0].Role
        if (role === 'user') {
          studentArr.push(_.where(arr, { Email: email })[0])
        }
      }
    } catch (e) {
      console.error(`"${e}". Continuing...`)
    }
  }
}

async function isolateEmails (arr) {
  arr.forEach(element => {
    canvasEmailList.push(element.Email)
  })
}

async function start () {
  const jsonArray = await csv().fromFile(csvFilePath)
  await isolateEmails(jsonArray)
  await getUserRoles(canvasEmailList, jsonArray)
  await saveToCsv(teacherArr, teacherFile)
  await saveToCsv(studentArr, studentFile)
}

start()
