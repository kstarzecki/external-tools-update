require('dotenv').config()
const Canvas = require('@kth/canvas-api')
const ObjectsToCsv = require('objects-to-csv')
const csv = require('csvtojson')
const cliProgress = require('cli-progress')

const token = process.env.CANVAS_API_TOKEN
const url = process.env.CANVAS_API_URL
const canvas = Canvas(url, token)

const input = './2021.csv'
const output = './out-2021.csv'

const teachArr = []
const retryArr = []

async function saveUniqueToCsv (arr, file) {
  const uArr = arr.reduce((unique, o) => {
    if (!unique.some(obj => obj.Name === o.Name && obj.Email === o.Email && obj.CourseID === o.CourseID)) {
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

async function getTeachers (courseIds, retry) {
  const bar = new cliProgress.SingleBar({
    hideCursor: true
  }, cliProgress.Presets.shades_classic)
  console.log('Processing Courses... \n')
  bar.start(courseIds.length, 0)
  if (retry) {
    bar.stop()
  }
  for (const courseId of courseIds) {
    try {
      const enrollments = await canvas.list(`courses/${courseId.courseID}/enrollments?type=TeacherEnrollment`).toArray()
      for (const enrollment of enrollments) {
        const course = await canvas.get(`courses/${courseId.courseID}`)
        const userObj = {
          CourseID: courseId.courseID,
          CourseName: course.body.name,
          Name: enrollment.user.sortable_name,
          Email: enrollment.user.login_id,
          Role: enrollment.role
        }
        teachArr.push(userObj)
      }
      if (!retry) {
        bar.increment()
      }
    } catch (e) {
      console.error(`\n Cannot get ID for ${courseId.courseID}. "${e}". Continuing...`)
      if (!retry) {
        retryArr.push({ courseID: courseId.courseID })
      } else {
        console.error(`\n Course with ID: ${courseId.courseID} Not found.`)
      }
      if (!retry) {
        bar.increment()
      }
    }
  }
  bar.stop()
}

async function start () {
  const jsonArray = await csv().fromFile(input)
  await getTeachers(jsonArray)
  await getTeachers(retryArr, true)
  await saveUniqueToCsv(teachArr, output)
}

start()
