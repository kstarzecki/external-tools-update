const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { parse } = require('json2csv');

// Define the input and output file paths
const inputFilePath = path.join(__dirname, 'output_courses.csv');
const outputFilePath = path.join(__dirname, 'output_courses_with_dates.csv');

// Define a regex pattern to extract the date in [YYYY-MM-DD] format
const datePattern = /\[(\d{4}-\d{2}-\d{2})\]/;

// Read the input CSV file
const rows = [];
fs.createReadStream(inputFilePath)
  .pipe(csv())
  .on('data', (row) => {
    // Extract the date from the Course Name column
    const match = datePattern.exec(row['Course Name']);
    row['Date'] = match ? match[1] : '';
    rows.push(row);
  })
  .on('end', () => {
    // Define the fields for the output CSV
    const fields = Object.keys(rows[0]);
    const opts = { fields };

    try {
      // Convert JSON to CSV
      const csv = parse(rows, opts);
      // Write the output CSV file
      fs.writeFileSync(outputFilePath, csv);
      console.log(`Dates extracted and written to ${outputFilePath}`);
    } catch (err) {
      console.error(err);
    }
  });