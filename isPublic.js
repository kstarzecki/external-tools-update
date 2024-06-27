const fs = require('fs');
const { Parser } = require('json2csv');
const Canvas = require('@kth/canvas-api').default;
require('dotenv').config();

const canvasApiUrl = process.env.CANVAS_API_URL;
const canvasApiToken = process.env.CANVAS_API_TOKEN;

// Replace with your array of account IDs
const accountIds = [59, 60]; // Example account IDs

// Replace with your array of course terms to filter by
const courseTerms = ['VT23', 'HT24', 'VT24']; // Example terms

// Function to fetch and filter courses from a specific account
async function fetchAndFilterCourses(canvas, accountId, terms) {
  try {
    const courseGenerator = canvas.listItems(`accounts/${accountId}/courses`);
    const filteredCourses = [];

    for await (const course of courseGenerator) {
      if (!course.name.includes("DO NOT USE") && terms.some(term => course.course_code.includes(term))) {
        filteredCourses.push({
          'Account ID': course.account_id,
          'Term Name': terms.find(term => course.course_code.includes(term)),
          'Course Code': course.course_code,
          'Course URL': `https://${new URL(canvasApiUrl).hostname}/courses/${course.id}`,
          'Course Name': course.name,
          'Public Course': course.is_public,
          'Institution Level': course.is_public_to_auth_users
        });
      }
    }

    return filteredCourses;
  } catch (error) {
    console.error(`Error fetching courses for account ${accountId}:`, error);
    return [];
  }
}

// Function to parse courses from all accounts and generate CSV
async function generateCSV() {
  const canvas = new Canvas(canvasApiUrl, canvasApiToken);
  const allFilteredCourses = [];

  for (const accountId of accountIds) {
    const filteredCourses = await fetchAndFilterCourses(canvas, accountId, courseTerms);
    allFilteredCourses.push(...filteredCourses);
  }

  // Define CSV fields
  const fields = ['Account ID', 'Term Name', 'Course Code', 'Course URL', 'Course Name', 'Public Course', 'Institution Level'];
  const json2csvParser = new Parser({ fields });
  const filteredCsv = json2csvParser.parse(allFilteredCourses);

  // Write filtered CSV to file
  fs.writeFileSync('filtered_courses.csv', filteredCsv);
  console.log('Filtered CSV file has been generated successfully.');
}

// Run the script
generateCSV();
