const fs = require('fs');
const { Parser } = require('json2csv');
const Canvas = require('@kth/canvas-api').default;
require('dotenv').config();

const canvasApiUrl = process.env.CANVAS_API_URL;
const canvasApiToken = process.env.CANVAS_API_TOKEN;

// Replace with your array of account IDs
const accountIds = [59, 60]; // Example account IDs

// Replace with your array of enrollment terms (SIS IDs and Names)
const enrollmentTerms = [
  { sisId: '20251', name: '2025 VT' },
  { sisId: '20242', name: '2024 HT' },
  { sisId: '20241', name: '2024 VT' },
  { sisId: '20232', name: '2023 HT' }
];

// Function to fetch courses from a specific account and filter by enrollment term SIS ID
async function fetchCourses(canvas, accountId, term) {
  try {
    const params = {
      enrollment_term_id: term.sisId
    };
    const { body: courses } = await canvas.get(`accounts/${accountId}/courses`, { searchParams: params });
    return courses.map(course => ({
      'Account ID': accountId,
      'Term Name': term.name,
      'Course Code': course.course_code,
      'Course URL': `https://${new URL(canvasApiUrl).hostname}/courses/${course.id}`,
      'Course Name': course.name,
      'Public Course': course.is_public,
      'Institution Level': course.is_public_to_auth_users
    }));
  } catch (error) {
    console.error(`Error fetching courses for account ${accountId} and term ${term.name}:`, error);
    return [];
  }
}

// Function to parse courses from all accounts and generate CSV
async function generateCSV() {
  const canvas = new Canvas(canvasApiUrl, canvasApiToken);
  const allCourses = [];

  for (const accountId of accountIds) {
    for (const term of enrollmentTerms) {
      const courses = await fetchCourses(canvas, accountId, term);
      allCourses.push(...courses);
    }
  }

  // Define CSV fields
  const fields = ['Account ID', 'Term Name', 'Course Code', 'Course URL', 'Course Name', 'Public Course', 'Institution Level'];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(allCourses);

  // Write CSV to file
  fs.writeFileSync('courses.csv', csv);
  console.log('CSV file has been generated successfully.');
}

// Run the script
generateCSV();
