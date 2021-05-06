require('dotenv').config()
const Canvas = require('@kth/canvas-api')
const sanitizeHtml = require('sanitize-html')
const extractUrls = require('extract-urls')
const { createWriteStream } = require('fs')
const fs = require('fs')
const got = require('got')
const convert = require('xml-js')
const sanitize = require('sanitize-filename')

const token = process.env.CANVAS_API_TOKEN_TEST
const url = process.env.CANVAS_API_URL_TEST
const canvas = Canvas(url, token)

const config = {
  account: '', // for later
  courseId: '23019'
}

// create folders if they don't exist
function handleDirectory (dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true }, err => { console.log(`Error handling folders: ${err}`) })
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
      console.error('CAUGHT AN ERROR DIR: ' + e + '. Continuing...')
    }
  })
}

// remove duplicate file id entries
function onlyUnique (value, index, self) {
  return self.indexOf(value) === index
}

// process the file urls
function getUniqueFileUrls (string) {
  var urls = extractUrls(string)
  var re = / *\/files\/(\d+)/
  var oarr = []
  if (typeof urls !== 'undefined') {
    reStripAndReconstruct(re, urls, oarr)
    var unique = oarr.filter(onlyUnique)
    return unique
  } else {
    return []
  }
}

// save new xml file
function saveXML (arr, dir, eDir, courseId) {
  try {
    arr.forEach(element => {
      const path = `${eDir}${dir}/${courseId}.xml`
      const buffer = Buffer.from(element, 'utf-8')
      fs.open(path, 'w', function (e, fd) {
        if (e) {
          console.error(`Could not open file: ${e}`)
        }
        fs.write(fd, buffer, 0, buffer.length, null, function (e) {
          if (e) console.error(`could not write file: ${e}`)
          fs.close(fd, function () {
            console.log(`Successfully wrote "${courseId}.xml" to ${eDir}${dir}/`)
          })
        })
      })
    })
  } catch (e) {
    console.error('CAUGHT AN ERROR XML: ' + e + '. Continuing...')
  }
}

// get assignment id from array
function getAssignmentDetails (arr) {
  var arrOut = []
  arr.forEach(element => {
    arrOut.push(element.id)
  })
  return arrOut
}

// create sort version of assignment object
function createAssignmentObject (id, name, description, fileObjArr, updated) {
  const assignmentObj = {}
  var fileNameList = []
  var fileIdList = []

  fileObjArr.forEach(element => {
    fileNameList.push(element.name)
  })
  fileObjArr.forEach(element => {
    fileIdList.push(element.id)
  })

  assignmentObj.id = id
  assignmentObj.name = sanitize(name)
  assignmentObj.updated = updated
  assignmentObj.description = description
  assignmentObj.uniqueUrls = fileIdList
  assignmentObj.uniqueNames = fileNameList

  return assignmentObj
}

// convert date to readable format
function convertDate (date, opt) {
  const cDate = new Date(date)
  const localD = cDate.toLocaleDateString('sv')
  const localT = cDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // cDate.toLocaleTimeString('sv')
  const local = cDate.toLocaleString('sv')
  if (opt === 't') {
    return (`${localD} ${localT}`)
  } if (opt === 'd') {
    return (localD)
  } else {
    return (local)
  }
}

// create assignment txt files
async function saveAssignments (parsedAssignments, dir, eDir, attachmentList, attachmentDate) {
  try {
    parsedAssignments.forEach(element => {
      const sanitizedElementName = sanitize(element.name)
      const path = `${eDir}${dir}/UPPGIFT_${element.id}_${sanitizedElementName}.txt` // actual path to save file
      const xmlPath = `UPPGIFT_${element.id}_${sanitize(element.name)}.txt` // path for the archive xml file (for batch exports)
      const assignment = ( // compose assignment text file
        `ASSIGNMENT NAME: ${element.name}`).concat('\n',
        `LAST UPDATED AT: ${convertDate(element.updated, 't')}`, '\n',
        '====== ASSIGNMENT DESCRIPTION BEGIN ======', '\n',
        element.description, '\n',
        '====== ASSIGNMENT DESCRIPTION END ======'
      )
      const buffer = Buffer.from(assignment)
      attachmentList.push(xmlPath)
      attachmentDate.push(element.updated)
      fs.open(path, 'w', function (e, fd) {
        if (e) {
          console.error(`Could not open file: ${e}`)
        }
        fs.write(fd, buffer, 0, buffer.length, null, function (e) {
          if (e) console.error(`could not write file: ${e}`)
          fs.close(fd, function () {
            console.log(`Successfully wrote "${element.id}_${sanitizedElementName}.txt" to ${eDir}${dir}/`)
          })
        })
      })
    })
  } catch (e) {
    console.error('CAUGHT AN ERROR SAVE: ' + e + '. Continuing...')
  }
}

// process course
async function getCourse (config) { //, attachmentList) {
  var attachmentList = []
  var attachmentDate = []
  var fileDownloadList = []
  const parsedAssignments = []
  const courseInfo = await canvas.get(`courses/${config.courseId}`)
  const assignments = await canvas.get(`courses/${config.courseId}/assignments`)
  const assIds = getAssignmentDetails(assignments.body)
  var eDir = './Export'
  var dir = `/${sanitize(courseInfo.body.name)}`
  var aDir = ''
  handleDirectory(`${eDir}${dir}`)
  handleDirectory(`${eDir}${dir}${aDir}`)
  await getAssignments(config, assIds, parsedAssignments, fileDownloadList)
  await saveAssignments(parsedAssignments, dir, eDir, attachmentList, attachmentDate)
  await downloadAttachmentsAndMakeXml(fileDownloadList, dir, aDir, eDir, attachmentList, attachmentDate, courseInfo)
}

// process an assignment
async function getAssignments (config, assIds, parsedAssignments, fileDownloadList) {
  for (const assignmentId of assIds) {
    try {
      const assignment = await canvas.get(`courses/${config.courseId}/assignments/${assignmentId}`)
      if (assignment.body.workflow_state === 'published') {
        if (assignment.body.submission_types[0] === 'online_upload') {
          var sanitizedDescription = sanitizeHtml(assignment.body.description, {
            allowedTags: ['img', 'a', 'em'],
            allowedAttributes: {
              a: ['href'],
              img: ['src', 'alt', 'data-api-endpoint']
            }
          })
          var fileIdList = getUniqueFileUrls(sanitizedDescription)
          console.log(`Processing Assignment ID:${assignment.body.id}: ${assignment.body.name}`)
          if (fileIdList !== [] && fileIdList !== undefined) { // can be undefined for a number of reasons
            var fileObjArr = await processFiles(fileIdList)
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
          var currentAss = createAssignmentObject(assignment.body.id, assignment.body.name, sanitizedDescription, fileObjArr, assignment.body.updated_at)
          parsedAssignments.push(currentAss)
        }
      }
    } catch (e) {
      console.error('CAUGHT AN ERROR GET: ' + assignmentId + ' ' + e + fileObjArr + '. Continuing...')
    }
  }
}

// process files
async function processFiles (arr) {
  const fileArr = []
  for (const element of arr) {
    try {
      const file = await canvas.get(`files/${element}`)
      const dlFile = {}
      dlFile.name = file.body.filename
      dlFile.url = file.body.url
      dlFile.lock = file.body.locked
      if (file.body.lock_explanation === undefined) { // if it's not locked, this is undefined
        dlFile.lockExp = 'none'
      } else {
        dlFile.lockExp = file.body.lock_explanation
      }
      dlFile.id = element
      dlFile.updated = (file.body.updated_at)
      fileArr.push(dlFile)
    } catch (e) {
      console.error('CAUGHT AN ERROR PF: ' + e + '. Continuing...')
    }
  }
  return fileArr
}

// download all linked attachments and create the xml file
async function downloadAttachmentsAndMakeXml (filesList, dir, aDir, eDir, attachmentList, attachmentDate, courseInfo) {
  if (filesList.length === 0) {
    makeXml(courseInfo, attachmentList, attachmentDate, dir, eDir)
  } else {
    for (const obj of filesList) { // files list is array of objects that contains file info
      var i = 0
      if (obj.lock === false) { // some files in Canvas can be locked, which results in no download url, causing an error
        const downloadStream = got.stream(obj.url) // obj.url is the download url obtained from API call
        const fileWriterStream = createWriteStream(`${eDir}${dir}${aDir}/FILE_${obj.id}_${obj.name}`)
        // eDir is general Export directory
        // dir is current course directory
        // aDir is attachment directory
        // obj holds file name and id

        // download using GOT
        downloadStream
          .on('error', async (e) => {
            console.error(`Download failed: ${e.message}`)
          })

        fileWriterStream
          .on('error', async (e) => {
            console.error(`Could not write file "${obj.id}_${obj.name}" to system: ${e.message}`)
          })
          .on('finish', async () => {
            console.log(`Successfully downloaded "${obj.id}_${obj.name}" to ${eDir}${dir}${aDir}/`)
            attachmentList.push(`${obj.id}_${obj.name}`)
            attachmentDate.push(obj.updated)
            i++
            if ((i) === (filesList.length)) {
              console.log(`Completed download of attachments: ${i} of ${filesList.length}`)
              makeXml(courseInfo, attachmentList, attachmentDate, dir, eDir)
            }
          })
        downloadStream.pipe(fileWriterStream)
      } else { // if file is locked, note it down
        console.log(`File "${obj.name}" ID: ${obj.id} is locked. Continuing...`)
        fs.open(`${eDir}${dir}${aDir}/lockedFiles.txt`, 'w', function (e, id) {
          fs.write(id, `Failed to download file "${obj.name}" with ID: ${obj.id}. Reason: ${obj.lockExp}` + '\n', null, 'utf8', function () {
            fs.close(id, function () {
              attachmentList.push(`${aDir}/lockedFiles.txt`)
              attachmentDate.push(Date.now())
              makeXml(courseInfo, attachmentList, attachmentDate, dir, eDir)
              console.log('Lock file is updated.')
            })
          })
        })
      }
    }
  }
}

// create the xml file
async function makeXml (courseInfo, attachmentList, attachmentDate, dir, eDir) {
  // read empty xml, and make it a js object
  var xml = fs.readFileSync('kursSpecEmpty.xml', 'utf8')
  var readOptions = { ignoreComment: false, alwaysChildren: true }
  var kursSpec = convert.xml2js(xml, readOptions)

  // current timestamp in milliseconds
  const dateTs = convertDate(Date.now(), 't')
  const kursKodRe = /[A-ZÅÄÖ]{2}\d{4}/
  const tentaKodRe = /_(.*?)_/
  var kursKod = courseInfo.body.course_code
  var tentaKod = courseInfo.body.sis_course_id
  if (kursKodRe.exec(courseInfo.body.sis_course_id) !== null) {
    tentaKod = (tentaKodRe.exec(courseInfo.body.sis_course_id))[1]
  }
  if (kursKodRe.exec(courseInfo.body.course_code) !== null) {
    kursKod = (kursKodRe.exec(courseInfo.body.course_code))[0]
  }
  // add export date
  kursSpec.elements[0].elements[0].elements[0].elements[0].elements[3].elements[0].elements[0].elements[0].text = `Exported: ${dateTs}`
  // add course code
  kursSpec.elements[0].elements[0].elements[0].elements[0].elements[19].elements[0].elements[0].elements[0].elements[0].elements[0].elements[0].text = kursKod
  // add course name
  kursSpec.elements[0].elements[0].elements[0].elements[0].elements[19].elements[0].elements[0].elements[1].elements[0].elements[0].elements[0].text = courseInfo.body.name
  // add course offering
  kursSpec.elements[0].elements[0].elements[0].elements[0].elements[19].elements[0].elements[0].elements[2].elements[0].elements[0].elements[0].text = courseInfo.body.sis_course_id
  // This might be actually an issue, as instead of regular SIS_ID for exam rooms in 2020, we now have LADOK ID there
  // Might, since it could actually be more meaningful.

  // save part of xml object as stencil
  const attachmentSnippet = kursSpec.elements[0].elements[0].elements[0].elements[0].elements[20].elements[0].elements[0]
  var tempXmlArr = []

  // make an xml snippet for each attachment entry using stencil and save to array
  for (var i = 0; i < attachmentList.length; i++) {
    var tObj = JSON.parse(JSON.stringify(attachmentSnippet)) // copy stencil
    tObj.elements[0].elements[0].elements[0].elements[0].text = attachmentList[i]
    tObj.elements[3].elements[0].elements[0].elements[0].text = convertDate(attachmentDate[i], 't')
    tempXmlArr.push(tObj)
  }

  // inject combined snippets into xml file
  kursSpec.elements[0].elements[0].elements[0].elements[0].elements[20].elements[0].elements = tempXmlArr
  // write xml to file
  var writeOptions = { compact: false, ignoreComment: false, spaces: 4 }
  var kursSpecName = `Kursspecifikation-${kursKod}-(${tentaKod})-${dateTs}`
  var kursSpecArr = []
  kursSpecArr.push(convert.js2xml(kursSpec, writeOptions))
  saveXML(kursSpecArr, dir, eDir, kursSpecName)
}

function start () {
  getCourse(config) // main function
}

start()
