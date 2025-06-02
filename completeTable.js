require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');
const { parse } = require('json2csv');

const CANVAS_API_URL = process.env.CANVAS_API_URL;
const CANVAS_API_TOKEN = process.env.CANVAS_API_TOKEN;

axios.defaults.headers.common['Authorization'] = `Bearer ${CANVAS_API_TOKEN}`;

const inputFilePath = './input_courses.csv';
const outputFilePath = './output_courses.csv';

const fetchAccountName = async (accountId) => {
    try {
        const { data } = await axios.get(`${CANVAS_API_URL}/accounts/${accountId}`);
        return data.name;
    } catch (error) {
        console.error(`Error fetching account ${accountId}:`, error.message);
        return '';
    }
};

const fetchTermName = async (termId) => {
    try {
        const { data } = await axios.get(`${CANVAS_API_URL}/accounts/1/terms/${termId}`);
        return data.name;
    } catch (error) {
        console.error(`Error fetching term ${termId}:`, error.message);
        return '';
    }
};

const fetchCourseDetails = async (courseId) => {
    try {
        const { data } = await axios.get(`${CANVAS_API_URL}/courses/${courseId}`);
        const subaccountName = await fetchAccountName(data.account_id);
        const termName = data.enrollment_term_id ? await fetchTermName(data.enrollment_term_id) : '';
        return {
            'Course Code': data.course_code,
            'Course ID': data.id,
            'Term': termName,
            'Sub-Account Name': subaccountName,
            'Course Name': data.name
        };
    } catch (error) {
        console.error(`Error fetching course ${courseId}:`, error.message);
        return null;
    }
};

const processCourses = async () => {
    const courseIds = [];

    fs.createReadStream(inputFilePath)
        .pipe(csv())
        .on('data', (row) => {
            if (row.course_id) courseIds.push(row.course_id);
        })
        .on('end', async () => {
            console.log(`Fetched ${courseIds.length} course IDs.`);

            const coursesData = [];
            for (const courseId of courseIds) {
                const details = await fetchCourseDetails(courseId);
                if (details) coursesData.push(details);
            }

            const csvData = parse(coursesData, { fields: ['Course Code', 'Course ID', 'Term', 'Sub-Account Name', 'Course Name'] });

            fs.writeFileSync(outputFilePath, csvData);
            console.log(`Course details written to ${outputFilePath}`);
        });
};

processCourses();
