require(`dotenv`).config();
const Canvas    = require(`@kth/canvas-api`),
      inquirer  = require(`inquirer`),
      token     = process.env.CANVAS_API_TOKEN_TEST,
      url       = process.env.CANVAS_API_URL_TEST,
    //   token     = process.env.CANVAS_API_TOKEN_PROD,
    //   url       = process.env.CANVAS_API_URL_PROD,
      canvas    = Canvas(url, token),
      args      = process.argv.slice(2);

let foundToolsList = [],
    config         = {
                        year: 0,
                        account:``, 
                        toolName:``, 
                        toolFields:``
                     };
  
var inquirerQuestions = [
    {
        type: `input`,
        name: `year`,
        message: `Omit courses starting before year: (0 or Enter to scan all courses)`,
        default: 0
    },
    {
        type: `input`,
        name: `account`,
        message: `Which account you want to search?`,
        default: 1
    },
    {
        type: `text`,
        name: `toolName`,
        message: `Which tool you want to modify?`,
        validate: function(answer) {
            if (answer.length < 1) {
                return `You must choose at least one field.`;
            }
            return true;
        }
    },
    {
        type: `checkbox`,
        message: `Select External Tool Fields to Modify`,
        name: `toolFields`,
        choices: [
            new inquirer.Separator(`External Tool Fields`),
            {
                name: `name`
            },
            {
                name: `url`
            },
            {
                name: `domain`
            }
        ],
        validate: function(answer) {
            if (answer.length < 1) {
                return `You must choose at least one field.`;
            }
            return true;
        }
    }
    
];

// function nullToNA(obj) {
//     for (var key in obj) {
//         if (obj[key] !== null && obj[key] != ""){
//             return obj;
//         } else {
//             obj[key] = `n/a`;
//             return obj;
//         }
//     } 
// }

// async function saveToCsv(arr, file) {
//     let csv = new ObjectsToCsv(arr);
//     await csv.toDisk(file);
//     console.log(await csv.toString());
//     console.log(`-------------------------------------------------------`);
//     console.log(`Done printing contents of `+file+`.`);
//     console.log(`-------------------------------------------------------`);
//     console.log(``);
// }

function isNumber (value) {
    return typeof value === `number` && isFinite(value);
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

async function updateTool (courseId, toolId) {
    const body = config.toolFields
    await canvas.requestUrl(`/courses/`+courseId+`/external_tools/`+toolId, `PUT`, body)
    console.log(`Done with toolId: `+toolId+`! Results below:`)
    let updatedTool = await canvas.requestUrl(`/courses/`+courseId+`/external_tools/`+toolId)
    let course = await canvas.requestUrl(`/courses/`+courseId)
    console.log(createShortObject(course.body, updatedTool.body))
}

async function sanityCheck (foundToolsList){
    await inquirer
        .prompt({
            type: `confirm`,
            name: `checked`,
            message: `Are you sure you want to apply changes to `+foundToolsList.length+` external tools?`,
            default: false
        })
        .then(answers => {
            if (answers.checked === false){
                return
            }
        });
}

async function checkTools (course, queryToolName){
    for await (let externalTool of canvas.list(`/courses/`+course.id+`/external_tools`)){
        if (externalTool !== [] && externalTool.name === queryToolName) {
            await saveTool(foundToolsList, course, externalTool)
        }
    };
}

async function searchCourses() {
    let courseSearchUrl = `/accounts/`+config.account+`/courses`;
    for await (let course of canvas.list(courseSearchUrl)) {
        let yearStarted = (new Date(course.start_at)).getFullYear();
        if (yearStarted >= config.year || course.start_at === null){
            // Courses with start date = null, get a 1970 in `yearStarted` variable, hence direct check
            await checkTools(course, config.toolName)
        } else {
            continue;
        }
    }    
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}

async function getNewToolFields (){
    await asyncForEach(Object.keys(config.toolFields), async (key) => {
        await inquirer
        .prompt({
            type: `input`,
            name: `newValue`,
            message: `Enter new value for `+key+`:`
        })
        .then(answers => {
            config.toolFields[key] = answers.newValue
        });
    });
}

async function getConfig(){
    await inquirer
        .prompt(inquirerQuestions)
        .then(answers => {
            Object.assign(config, answers)
            var answersObj = {}
            answers.toolFields.forEach((key) => answersObj[key] = ``);
            config.toolFields = answersObj
          });
}

async function start() {
    await getConfig()
    await getNewToolFields()
    console.log(`-------------------------------------------------------------------------------`);
    console.log(`Scanning courses in an account with ID: "`+config.account+`".`);
    console.log(`Searching for "`+config.toolName+`" external tool. This might take a while...`);
    if (config.year !== 0){
        if (isNumber(parseInt(args[2], 10))){
            searchYear = parseInt(args[2], 10);
            console.log(`Omitting all courses started before `+searchYear+`.`);
        } 
        else {
            console.log(`Please define year correctly -> e.g. "year 2019" or omit "year" argument`)
            return;
        }
    }
    await searchCourses()
    console.log(`-------------------------------------------------------------------------------`);
    if (foundToolsList.length !== 0){
        console.log(`Printing list of found Tools...`)
        console.log(foundToolsList)
        console.log(`-------------------------------------------------------------------------------`);
        await sanityCheck(foundToolsList)
        await asyncForEach(foundToolsList, async (foundTool) => {
            console.log(`-------------------------------------------------------------------------------`);
            await updateTool(foundTool.courseId, foundTool.toolId)
        });
        console.log(`-------------------------------------------------------------------------------`);
        console.log(`Done and done. Exiting..`)
    } else {
        console.log(`No external tools of name: "`+config.toolName+`" found. Quitting..`)
        return;
    }
}

start();