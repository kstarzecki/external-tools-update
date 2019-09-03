require('dotenv').config();
const Canvas            = require('@kth/canvas-api'),
      inquirer          = require('inquirer'),
      token             = process.env.CANVAS_API_TOKEN_TEST,
      url               = process.env.CANVAS_API_URL_TEST,
      canvas            = Canvas(url, token),
      args              = process.argv.slice(2);

let foundExternalToolsList   = [],
    searchYear               = 0;

let queryToolName   = 'KTH Möbius',
    newToolName     = 'KTH Möbius!';
    
// set `OUTPUT` to false in .env to disable terminal output    
old_console_log = console.log;
console.log = function() {
    if ( process.env.OUTPUT ) {
        old_console_log.apply(this, arguments);
    }
}

// function nullToNA(obj) {
//     for (var key in obj) {
//         if (obj[key] !== null && obj[key] != ""){
//             return obj;
//         } else {
//             obj[key] = 'n/a';
//             return obj;
//         }
//     } 
// }

// async function saveToCsv(arr, file) {
//     let csv = new ObjectsToCsv(arr);
//     await csv.toDisk(file);
//     console.log(await csv.toString());
//     console.log('-------------------------------------------------------');
//     console.log('Done printing contents of '+file+'.');
//     console.log('-------------------------------------------------------');
//     console.log('');
// }

// const { createButton } = await inquirer.prompt({
//     type: 'confirm',
//     name: 'createButton',
//     message: 'Do you want to create a link in the menu?'
//   })
//   if (!createButton) {
//     return
//   }

function isNumber (value) {
    return typeof value === 'number' && isFinite(value);
}

function createShortObject (course, externalTool){
    let shortObject = new Object();
    shortObject.courseId        = course.id;
    shortObject.courseCode      = course.course_code;
    shortObject.toolId          = externalTool.id;
    shortObject.toolName        = externalTool.name;
    shortObject.toolDomain      = externalTool.domain;
    shortObject.toolUrl         = externalTool.url;
    shortObject.toolConsumerKey = externalTool.consumer_key;
    return shortObject
}

function saveTool (arr, course, externalTool){
    arr.push(createShortObject(course, externalTool));
}

function checkArgs (args){
    if (args[0] === 'year' || typeof args[0] === 'undefined'){
        if (args[0] === 'year') {
            args[2] = args[1]
            args[1] = args[0];
            args[0] = '1';
        } else {
            args[1] = args[0];
            args[0] = '1';
        }
    }
}

async function checkTools (course){
    for await (let externalTool of canvas.list('/courses/'+course.id+'/external_tools')){
        if (externalTool !== [] && externalTool.name === queryToolName) {
            await saveTool(foundExternalToolsList, course, externalTool)
        }
    };
}

async function updateTool (courseId, toolId) {
    const body = {
        // domain: null,
        // url: null,
        // consumer_key: null,
        name: newToolName
    }
    await canvas.requestUrl(`/courses/`+courseId+`/external_tools/`+toolId, 'PUT', body)
    console.log('Done with toolId: '+toolId+'! Performing Check.')
    let updatedTool = await canvas.requestUrl('/courses/'+courseId+'/external_tools/'+toolId)
    let course = await canvas.requestUrl('/courses/'+courseId)
    console.log(createShortObject(course.body, updatedTool.body))

}

async function searchCourses(courseSearchUrl) {
    for await (let course of canvas.list(courseSearchUrl)) {
        // if ((new Date(course.start_at)).getFullYear() >= searchYear){
        let yearStarted = (new Date(course.start_at)).getFullYear();
        if (yearStarted >= searchYear || course.start_at === null){
            // Courses with start date = null, get a 1970 in 'yearStarted' variable, hence direct check
            await checkTools(course)
        } else {
            continue;
        }
    }
}

async function start() {
    checkArgs(args);
    let acc = args[0];
    let courseSearchUrl = '/accounts/'+acc+'/courses';
    console.log('-------------------------------------------------------');
    console.log(`Scanning courses in "`+courseSearchUrl+`".`);
    console.log(`Searching for "`+queryToolName+`" external tool.`);
    if (args[1] === 'year'){
        if (isNumber(parseInt(args[2], 10))){
            searchYear = parseInt(args[2], 10);
            console.log('Omitting all courses started before '+searchYear+'.');
        } 
        else {
            console.log('Please define year correctly -> e.g. "year 2019" or omit "year" argument')
            return;
        }
    }
    await searchCourses(courseSearchUrl)
    console.log(foundExternalToolsList)
    await updateTool(foundExternalToolsList[0].courseId, foundExternalToolsList[0].toolId)
}

start();