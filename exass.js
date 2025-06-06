require('dotenv').config()
const Canvas = require('@kth/canvas-api')
const sanitizeHtml = require('sanitize-html')
const extractUrls = require('extract-urls')
const { createWriteStream } = require('fs')
const fs = require('fs')
const got = require('got')
const convert = require('xml-js')
const sanitize = require('sanitize-filename')
const replaceSpecialCharacters = require('replace-special-characters')

// const token = process.env.CANVAS_API_TOKEN
// const url = process.env.CANVAS_API_URL
const token = process.env.CANVAS_API_TOKEN_TEST
const url = process.env.CANVAS_API_URL_TEST
const canvas = Canvas(url, token)

// https://www.npmjs.com/package/stripchar ?
// https://www.npmjs.com/package/bee-queue ?

const config = {
  account: '', // for later
  courseId: '23019', // single course
  list: [23019, 23022, 23025, 23027, 23031, 23033, 23034, 23126, 24167] // batch of courses
}

// create folders if they don't exist
function handleDirectory (dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true }, err => { console.error(`Error handling folders: ${err}`) })
  }
}

// extract file ids from urls
function reStripAndReconstruct (re, arr, oarr) {
  arr.forEach(element => {
    try {
      if (re.exec(element) !== null) {
        oarr.push(re.exec(element)[1])
      }
    } catch (e) {
      console.error('- CAUGHT AN ERROR DIR: ' + e + '. Continuing...')
    }
  })
}

// remove duplicate file id entries
function onlyUnique (value, index, self) {
  return self.indexOf(value) === index
}

// process the file urls
function getUniqueFileUrls (string) {
  const urls = extractUrls(string)
  const re = / *\/files\/(\d+)/
  const oarr = []
  if (typeof urls !== 'undefined') {
    reStripAndReconstruct(re, urls, oarr)
    const unique = oarr.filter(onlyUnique)
    return unique
  } else {
    return []
  }
}

// save new xml file
function saveXML (courseId, arr, dir, eDir, kursSpecName) {
  try {
    arr.forEach(element => {
      const path = `${eDir}${dir}/${kursSpecName}.xml`
      const buffer = Buffer.from(element, 'utf-8')
      fs.open(path, 'w', function (e, fd) {
        if (e) {
          console.error(`- CID: ${courseId} - XML FILE ERR: ${e}`)
        }
        fs.write(fd, buffer, 0, buffer.length, null, function (e) {
          if (e) console.error(`- CID: ${courseId} - XML WRITE ERROR: ${e}`)
          fs.close(fd, function () {
            console.info(`- CID: ${courseId} - XML OK: ${eDir}${dir}/${kursSpecName}.xml`)
            console.info(`@ CID: ${courseId} - DONE`)
          })
        })
      })
    })
  } catch (e) {
    console.error(`- CID: ${courseId} - XML ERROR: ${e}. Continuing...`)
  }
}

// get assignment id from array
function getAssignmentDetails (arr) {
  const arrOut = []
  arr.forEach(element => {
    arrOut.push(element.id)
  })
  return arrOut
}

// create sort version of assignment object
function createAssignmentObject (id, name, description, fileObjArr, updated, type) {
  const assignmentObj = {
    id: id,
    name: sanitize(name),
    updated: updated,
    type: type,
    description: description,
    fileList: {
      ids: [],
      names: []
    }
  }

  fileObjArr.forEach(element => {
    assignmentObj.fileList.names.push(element.name)
  })
  fileObjArr.forEach(element => {
    assignmentObj.fileList.ids.push(element.id)
  })

  return assignmentObj
}

// convert date to readable format
function convertDate (date, opt) {
  const cDate = new Date(date)
  const localD = cDate.toLocaleDateString('sv')
  const localT = cDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // cDate.toLocaleTimeString('sv')
  const local = cDate.toLocaleString('sv')
  const iso = cDate.toISOString()
  if (opt === 'dt') {
    return (`${localD} ${localT}`)
  } if (opt === 'd') {
    return (localD)
  } if (opt === 'i') {
    return (iso)
  } else {
    return (local)
  }
}

// check if files are downloaded and/or added to locked files list
function ifFilesDoneMakeXML (i, j, filesListLength, courseId, courseInfo, attachmentList, attachmentDate, dir, eDir) {
  if (i + j === filesListLength) {
    if (j > 0) { // if there are any locked files add them to attachment list
      attachmentList.push('lockedFiles.txt')
      attachmentDate.push(convertDate(Date.now(), 'i'))
    }
    console.log(`- CID: ${courseId} - ALL FILES DONE. Downloaded: ${i} of ${filesListLength} files. Locked or missing: ${j}`)
    makeXml(courseInfo, attachmentList, attachmentDate, dir, eDir)
  }
}

// create assignment txt files
async function saveAssignments (courseId, parsedAssignments, dir, eDir, attachmentList, attachmentDate) {
  try {
    parsedAssignments.forEach(element => {
      const sanitizedElementName = replaceSpecialCharacters(sanitize(element.name))
      let prefix = ''
      if (element.type === 'online_upload') {
        prefix = 'UPPGIFT_'
      }
      if (element.type === 'online_quiz') {
        prefix = 'QUIZ_'
      }
      const path = `${eDir}${dir}/${prefix}${element.id}_${sanitizedElementName}.txt` // actual path to save file
      const xmlPath = `${prefix}${element.id}_${sanitizedElementName}.txt` // path for the archive xml file (for batch exports)
      const assignment = ( // compose assignment text file
        `ASSIGNMENT NAME: ${element.name}`).concat('\n',
        `LAST UPDATED AT: ${convertDate(element.updated, 'dt')}`, '\n',
        '====== ASSIGNMENT DESCRIPTION BEGIN ======', '\n',
        element.description, '\n',
        '====== ASSIGNMENT DESCRIPTION END ======', '\n',
        'Canvas File included [ordered list]:', '\n',
        `IDs: ${element.fileList.ids}`, '\n',
        `Names: ${element.fileList.names}`
      )
      const buffer = Buffer.from(assignment)
      attachmentList.push(xmlPath)
      attachmentDate.push(element.updated)
      fs.open(path, 'w', function (e, fd) {
        if (e) {
          console.error(`- CID: ${courseId} - Could not open file: ${e}`)
        }
        fs.write(fd, buffer, 0, buffer.length, null, function (e) {
          if (e) console.error(`- CID: ${courseId} could not write file: ${e}`)
          fs.close(fd, function () {
            console.info(`- CID: ${courseId} - SAVE OK: ${eDir}${dir}/${prefix}${element.id}_${sanitizedElementName}.txt`)
          })
        })
      })
    })
  } catch (e) {
    console.error(`- CID: ${courseId} - SAVE ERROR: ' + e + '. Continuing...`)
  }
}

// process course
async function getCourse (courseId) {
  console.info(`@ CID: ${courseId} - BEGIN`)
  const attachmentList = []
  const attachmentDate = []
  const fileDownloadList = []
  const parsedAssignments = []
  const courseInfo = await canvas.get(`courses/${courseId}`)
  const assignments = await canvas.get(`courses/${courseId}/assignments`)
  const assIds = getAssignmentDetails(assignments.body)
  const eDir = './Export'
  const dir = `/${replaceSpecialCharacters(sanitize(courseInfo.body.name))}`
  const aDir = ''
  handleDirectory(`${eDir}${dir}`)
  handleDirectory(`${eDir}${dir}${aDir}`)
  await getAssignments(courseId, assIds, parsedAssignments, fileDownloadList)
  await saveAssignments(courseId, parsedAssignments, dir, eDir, attachmentList, attachmentDate)
  await downloadAttachmentsAndMakeXml(fileDownloadList, dir, aDir, eDir, attachmentList, attachmentDate, courseInfo)
}

// process an assignment
async function getAssignments (courseId, assIds, parsedAssignments, fileDownloadList) {
  for (const assignmentId of assIds) {
    try {
      const assignment = await canvas.get(`courses/${courseId}/assignments/${assignmentId}`)
      if (assignment.body.workflow_state === 'published') { // if published
        if (assignment.body.submission_types.includes('online_upload') || assignment.body.is_quiz_assignment) { // if upload or classic quiz
          if (assignment.body.submission_types.includes('online_upload')) { // for upload
            const sanitizedDescription = sanitizeHtml(assignment.body.description, {
              allowedTags: ['img', 'a', 'em'],
              allowedAttributes: {
                a: ['href'],
                img: ['src', 'alt', 'data-api-endpoint']
              }
            })
            let fileIdList = getUniqueFileUrls(sanitizedDescription)
            console.log(`- CID: ${courseId} - Getting Assignment ID: ${assignment.body.id}: ${assignment.body.name}`)
            if (fileIdList !== [] && fileIdList !== undefined) { // can be undefined for a number of reasons
              var fileObjArr = await processFiles(courseId, fileIdList) // var on purpose
              if (fileObjArr !== [] && fileObjArr !== undefined) { // can be undefined for a number of reasons
                fileObjArr.forEach(file => {
                  fileDownloadList.push(file)
                })
              } else {
                fileObjArr = []
              }
            } else {
              fileIdList = []
            }
            const currentAss = createAssignmentObject(assignment.body.id, assignment.body.name, sanitizedDescription, fileObjArr, assignment.body.updated_at, 'online_upload')
            parsedAssignments.push(currentAss)
          } else { // for classic quiz
            const quizId = assignment.body.quiz_id
            console.log(`- CID: ${courseId} - Getting Quiz - Assignment ID: ${assignment.body.id}: ${assignment.body.name} Quiz ID: ${quizId}`)
            const quizQuestionsArr = []
            const quizQuestions = await canvas.get(`courses/${courseId}/quizzes/${quizId}/questions`)

            for (const quizQuestion of quizQuestions.body) {
              const quizQuestionAnswersArr = []
              for (const quizAnswers of quizQuestion.answers) {
                quizQuestionAnswersArr.push((`'${quizAnswers.text}'`).concat(` with weight:${quizAnswers.weight}`))
              }
              const processedQuestion = {
                name: quizQuestion.question_name,
                type: quizQuestion.question_type,
                text: sanitizeHtml(quizQuestion.question_text, {
                  allowedTags: ['img', 'a', 'em'],
                  allowedAttributes: {
                    a: ['href'],
                    img: ['src', 'alt', 'data-api-endpoint']
                  }
                }),
                answers: quizQuestionAnswersArr.join(', ')
              }
              const processedQuestionString = (
                `Question Name: ${processedQuestion.name}`).concat('\n',
                `Quiz Question Type: ${processedQuestion.type}`, '\n',
                '------ QUIZ QUESTION TEXT BEGIN ------', '\n',
                processedQuestion.text, '\n',
                '------ QUIZ QUESTION TEXT END ------', '\n',
                `Possible Answers: ${processedQuestion.answers}`, '\n'
              )
              quizQuestionsArr.push(processedQuestionString)
            }

            const quizQuestionsString = quizQuestionsArr.join('\n')
            let qFileIdList = getUniqueFileUrls(quizQuestionsString)
            console.log(`- CID: ${courseId} - Getting Assignment ID: ${assignment.body.id}: ${assignment.body.name}`)
            if (qFileIdList !== [] && qFileIdList !== undefined) { // can be undefined for a number of reasons
              var qFileObjArr = await processFiles(courseId, qFileIdList) // var on purpose
              if (qFileObjArr !== [] && qFileObjArr !== undefined) { // can be undefined for a number of reasons
                qFileObjArr.forEach(file => {
                  fileDownloadList.push(file)
                })
              } else {
                qFileObjArr = []
              }
            } else {
              qFileIdList = []
            }
            const currentQuiz = createAssignmentObject(assignment.body.id, assignment.body.name, quizQuestionsString, qFileObjArr, assignment.body.updated_at, 'online_quiz')
            parsedAssignments.push(currentQuiz)
            // console.log(currentQuiz)
          }
        }
        if (assignment.body.submission_types.includes('external_tool') && assignment.body.external_tool_tag.attributes.url == 'https://kth.quiz-lti-dub-prod.instructure.com/lti/launch'){ //New Quiz condition
          
        }
      }
    } catch (e) {
      console.error(`- CID: ${courseId} - GET ERROR: AssID: ${assignmentId}: "${e}". Continuing...`)
    }
  }
}

// process files
async function processFiles (courseId, arr) {
  const fileArr = []
  for (const element of arr) {
    try {
      const file = await canvas.get(`files/${element}`)
      const dlFile = {
        name: file.body.filename,
        url: file.body.url,
        lock: file.body.locked,
        lockExp: 'none given by Canvas',
        id: element,
        updated: file.body.updated_at
      }

      if (file.body.lock_explanation !== undefined) { // if it's not locked, this is undefined
        dlFile.lockExp = file.body.lock_explanation
      }

      fileArr.push(dlFile)
    } catch (e) {
      console.error(`- CID: ${courseId} - PF ERROR: ${element}: ${e.message}. Continuing...`)

      const failFile = {
        name: 'unknown',
        lock: true,
        lockExp: e.message,
        id: element
      }

      fileArr.push(failFile)
    }
  }
  return fileArr
}

// download all linked attachments and create the xml file
async function downloadAttachmentsAndMakeXml (filesList, dir, aDir, eDir, attachmentList, attachmentDate, courseInfo) {
  const courseId = courseInfo.body.id
  if (filesList.length === 0) {
    makeXml(courseInfo, attachmentList, attachmentDate, dir, eDir)
  } else {
    const lockFilePath = `${eDir}${dir}${aDir}/lockedFiles.txt`
    if (fs.existsSync(lockFilePath)) {
      fs.open(lockFilePath, 'w', function (e, id) {
        fs.write(id, '', null, 'utf8', function () {
          fs.close(id, function () {
            console.log(`- CID: ${courseId} - Lock file cleared before re-writing.`)
          })
        })
      })
    }
    for (const obj of filesList) { // files list is array of objects that contains file info
      try {
        var i = 0 // var on purpose
        var j = 0 // var on purpose
        const normalizedName = replaceSpecialCharacters(obj.name) // remove special characters like å, ä, ö

        if (obj.lock === false) { // some files in Canvas can be locked, which results in no download url, causing an error
          const dlFromCanvas = function (retryCount = 0) { // added retry
            const downloadStream = got.stream(obj.url) // obj.url is the download url obtained from API call
            downloadStream.retryCount = retryCount
            const filepath = `${eDir}${dir}${aDir}/FILE_${obj.id}_${normalizedName}`
            const fileWriterStream = createWriteStream(filepath)
            // eDir is general Export directory
            // dir is current course directory
            // aDir is attachment directory
            // obj holds file name and id

            // download using GOT
            downloadStream
              .on('error', async (e) => {
                console.error(`- CID: ${courseId} - ERROR DL: ${e.message}, Retry count: ${downloadStream.retryCount}`)
                if (fileWriterStream) { // on fail, destroy fileWriteStream and remove file, update the lock file
                  fileWriterStream.destroy()
                }
                fs.unlinkSync(filepath)
                const fileMessage = `Failed to download file 'FILE_${obj.id}_${normalizedName}' with ID: ${obj.id}. Reason: ${e.message}, Retry count: ${downloadStream.retryCount}\n`
                fs.appendFile(lockFilePath, fileMessage, (err) => {
                  if (err) throw err
                  j++
                  ifFilesDoneMakeXML(i, j, filesList.length, courseId, courseInfo, attachmentList, attachmentDate, dir, eDir)
                })
              })
              .once('retry', dlFromCanvas) // on retry -> retry!

            fileWriterStream
              .on('error', async (e) => {
                console.error(`- CID: ${courseId} - ERROR DL WRITE: "${obj.id}_${normalizedName}" to system: ${e.message}`)
              })
              .on('finish', async () => {
                console.log(`- CID: ${courseId} - DOWNLOAD OK: ${filepath}`)
                attachmentList.push(`FILE_${obj.id}_${normalizedName}`)
                attachmentDate.push(obj.updated)
                i++
                ifFilesDoneMakeXML(i, j, filesList.length, courseId, courseInfo, attachmentList, attachmentDate, dir, eDir)
              })
            downloadStream.pipe(fileWriterStream)
          }
          dlFromCanvas()
        } else { // if file is locked, or missing, note it down
          const fileMessage = `Failed to download file '${normalizedName}' with ID: ${obj.id}. Reason: ${obj.lockExp}\n`
          fs.appendFile(lockFilePath, fileMessage, (err) => {
            if (err) throw err
            j++
            ifFilesDoneMakeXML(i, j, filesList.length, courseId, courseInfo, attachmentList, attachmentDate, dir, eDir) // if I don't put this here, xml is not made if there are no files to download. To be fixed?
          })
          console.info(`- CID: ${courseId} - FILE LOCK: "${normalizedName}" FILE ID: ${obj.id}. Continuing...`)
          ifFilesDoneMakeXML(i, j, filesList.length, courseId, courseInfo, attachmentList, attachmentDate, dir, eDir)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }
}

// create the xml file
async function makeXml (courseInfo, attachmentList, attachmentDate, dir, eDir) {
  // read empty xml, and make it a js object
  const courseId = courseInfo.body.id
  const xml = fs.readFileSync('kursSpecEmpty_2_1.xml', 'utf8')
  const readOptions = { ignoreComment: false, alwaysChildren: true }
  const kursSpec = convert.xml2js(xml, readOptions)

  // current timestamp in milliseconds
  const dateTs = convertDate(Date.now(), 'd')
  const kursKodRe = /[A-ZÅÄÖ]{2}\d{4}/
  const tentaKodRe = /_(.*?)_/
  let kursKod = courseInfo.body.course_code
  let tentaKod = courseInfo.body.sis_course_id
  if (kursKodRe.exec(courseInfo.body.sis_course_id) !== null) {
    tentaKod = (tentaKodRe.exec(courseInfo.body.sis_course_id))[1]
  }
  if (kursKodRe.exec(courseInfo.body.course_code) !== null) {
    kursKod = (kursKodRe.exec(courseInfo.body.course_code))[0]
  }

  // add export date, script info
  kursSpec.elements[1].elements[6].elements[0] = {
    type: 'text',
    text: `Exported: ${dateTs}`
  }
  kursSpec.elements[1].elements[20].elements[0] = {
    type: 'text',
    text: 'lms-scripts/canvas-tentalydelse-export'
  }
  kursSpec.elements[1].elements[22].elements[0] = {
    type: 'text',
    text: '0.0.1(alpha)'
  }

  // add course information
  // add course code
  kursSpec.elements[1].elements[37].elements[0].elements[0] = {
    type: 'text',
    text: kursKod
  }
  // add course name
  kursSpec.elements[1].elements[37].elements[2].elements[0] = {
    type: 'text',
    text: courseInfo.body.name
  }
  // add course offering
  kursSpec.elements[1].elements[37].elements[4].elements[0] = {
    type: 'text',
    text: courseInfo.body.sis_course_id
  }
  // add course activity
  kursSpec.elements[1].elements[37].elements[6].elements[0] = {
    type: 'text',
    text: '' // left blank for now
  }
  // Instead of regular SIS_ID for exam rooms in 2020, we now have LADOK ID.
  // Might be more meaningful in the future.

  const attachmentSnippet = JSON.parse(JSON.stringify(kursSpec.elements[1].elements[38])) // move attachment section of xml to variable
  kursSpec.elements[1].elements.splice(38, 1) // remove attachment section from xml

  for (let i = 0; i < attachmentList.length; i++) {
    const tObj = JSON.parse(JSON.stringify(attachmentSnippet)) // copy stencil

    tObj.elements[0].elements[0] = { // assign file name to field
      type: 'text',
      text: attachmentList[i]
    }
    tObj.elements[6].elements[0] = { // assign file modified date to field
      type: 'text',
      // spec says 'format 2001-12-17T09:30:47' but it's not any known standard
      // I'm putting in UTC to see if it works for them
      text: attachmentDate[i]
    }

    kursSpec.elements[1].elements.push(tObj) // push attachment to xml (it's ok since it's at the end of the array)
  }

  // write xml to file
  const writeOptions = { compact: false, ignoreComment: false, spaces: 4, fullTagEmptyElement: true }
  const kursSpecName = `Kursspecifikation-${kursKod}-(${tentaKod})-${dateTs}`
  const kursSpecArr = []
  kursSpecArr.push(convert.js2xml(kursSpec, writeOptions))
  saveXML(courseId, kursSpecArr, dir, eDir, sanitize(kursSpecName))
}

async function getCoursesFromList (list) {
  for (const courseId of list) {
    try {
      await getCourse(courseId) // main function
    } catch (e) {
      console.error(`- CID: ${courseId} - ERROR COURSE: ${e}. Continuing...`)
    }
  }
}

function start () {
  getCoursesFromList(config.list)
}

start()
