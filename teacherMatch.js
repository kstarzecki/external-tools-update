require('dotenv').config()
const Canvas = require('@kth/canvas-api')
const ObjectsToCsv = require('objects-to-csv')
const csv = require('csvtojson')
const cliProgress = require('cli-progress')

const token = process.env.CANVAS_API_TOKEN
const url = process.env.CANVAS_API_URL
const canvas = Canvas(url, token)

const input = './members-short.csv'
const output = './matched-list.csv'

const canvasEmailList = []
const teachArr = []
const studArr = []
const designArr = []
const taArr = []

async function saveUniqueToCsv (arr, file) {
  const uArr = arr.reduce((unique, o) => {
    if (!unique.some(obj => obj.Name === o.Name && obj.Email === o.Email)) {
      unique.push(o)
    }
    return unique
  }, [])
  const csv = new ObjectsToCsv(uArr)
  await csv.toDisk(file)

  console.log('-------------------------------------------------------')
  console.log('Done printing contents of ' + file + '.')
  console.log('-------------------------------------------------------')
  console.log('')
}

async function getUserRoles (emails) {
  const bar = new cliProgress.SingleBar({
    hideCursor: true
  }, cliProgress.Presets.shades_classic)
  console.log('Matching Users... \n')
  bar.start(emails.length, 0)
  for (const email of emails) {
    try {
      const users = await canvas.list(`accounts/1/users?search_term=${email}`).toArray()
      for (const user of users) {
        if (user.login_id === email) {
          try {
            const enrols = await canvas.list(`users/${user.id}/enrollments`).toArray()
            const userObj = {
              Name: user.sortable_name,
              Email: user.login_id,
              Role: ''
            }
            if (enrols.some(e => e.type === 'TeacherEnrollment')) {
              userObj.Role = 'Teacher'
              teachArr.push(userObj)
              bar.increment()
            } else {
              if (enrols.some(e => e.type === 'TaEnrollment')) {
                userObj.Role = 'TA'
                taArr.push(userObj)
                bar.increment()
              } else {
                if (enrols.some(e => e.type === 'DesignerEnrollment')) {
                  userObj.Role = 'Designer'
                  designArr.push(userObj)
                  bar.increment()
                } else {
                  userObj.Role = 'Student'
                  studArr.push(userObj)
                  bar.increment()
                }
              }
            }
            // bar.increment()
          } catch (e) {
            console.error(`Can't get enrol for ${user.id}. "${e}". Continuing...`)
            bar.increment()
          }
        }
      }
    } catch (e) {
      console.error(`Cannot get ID for ${email}. "${e}". Continuing...`)
      bar.increment()
    }
  }
  bar.stop()
}

async function isolateEmails (arr) {
  arr.forEach(element => {
    canvasEmailList.push(element.Email)
  })
}

async function concatUsers (arr1, arr2, arr3, arr4) {
  const cArr = arr1.concat(arr2, arr3, arr4)
  return cArr
}

async function start () {
  const jsonArray = await csv().fromFile(input)
  await isolateEmails(jsonArray)
  await getUserRoles(canvasEmailList, jsonArray)
  const exportArr = await concatUsers(designArr, teachArr, taArr, studArr)
  console.log(`\n= Results ======= \n
  * Designers:  ${designArr.length}, \n
  * Teachers:   ${teachArr.length}, \n
  * TA's:       ${taArr.length}, \n
  * Students:   ${studArr.length} \n`)
  await saveUniqueToCsv(exportArr, output)
}

start()
