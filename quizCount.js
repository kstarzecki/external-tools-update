require('dotenv').config()
const Canvas = require('@kth/canvas-api')
const ObjectsToCsv = require('objects-to-csv')

const token = process.env.CANVAS_API_TOKEN
const url = process.env.CANVAS_API_URL
const canvas = Canvas(url, token)

const output = './quiz-courseList-2021.csv'

const courseArr = []
const exclArr = [104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116]

const config = {
  year: 2021,
  account: '1'
}

async function saveUniqueToCsv (arr, file) {
  const uArr = arr.reduce((unique, o) => {
    if (!unique.some(obj => obj.CourseSIS === o.CourseSIS)) {
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

async function searchCourses () {
  const courseSearchUrl = `accounts/${config.account}/courses`
  try {
    for await (const course of canvas.list(courseSearchUrl)) {
      const yearStarted = (new Date(course.start_at)).getFullYear()
      if (yearStarted >= config.year || course.start_at === null) {
        if (course.workflow_state === 'available' || course.workflow_state === 'completed') {
          if (!exclArr.includes(course.account_id)) {
            if (course.sis_course_id != null) {
              for await (const quiz of canvas.list(`courses/${course.id}/quizzes`)) {
                if (!quiz.unpublishable) {
                  for await (const user of canvas.list(`courses/${course.id}/users?enrollment_role_id=9`)) {
                    if (user !== 'undefined') {
                      const courseObj = {
                        CourseID: course.id,
                        CourseSIS: course.sis_course_id,
                        CourseName: course.name,
                        CourseResponsibleName: user.name,
                        CourseResponsibleEmail: user.email
                      }
                      courseArr.push(courseObj)
                      console.log(courseObj)
                    } else {
                      const courseObj = {
                        CourseID: course.id,
                        CourseSIS: course.sis_course_id,
                        CourseName: course.name,
                        CourseResponsibleName: 'no course responsible',
                        CourseResponsibleEmail: 'no course responsible'
                      }
                      courseArr.push(courseObj)
                      console.log(courseObj)
                    }
                  }
                  break
                }
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.log('CAUGHT AN ERROR: ' + e + '. Continuing...')
  }
}

async function start () {
  await searchCourses()
  await saveUniqueToCsv(courseArr, output)
}

start()
