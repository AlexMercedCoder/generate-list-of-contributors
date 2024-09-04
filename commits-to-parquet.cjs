const axios = require('axios');
const parquet = require('parquetjs-lite');
const fs = require('fs');

// Replace with your repository details
const owner = 'apache';
const repo = 'iceberg';
const githubToken = process.env.GIT_TOKEN;
const filename = `iceberg-commits-${new Date().toISOString()}.parquet`;

// Define the Parquet schema
const schema = new parquet.ParquetSchema({
  date: { type: 'UTF8' },
  githubEmail: { type: 'UTF8' },
  name: { type: 'UTF8' },
  commitMessage: { type: 'UTF8' }
});

// Function to fetch commits from GitHub API
async function fetchCommits(page = 1) {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
      params: { per_page: 100, page },
      headers: { Authorization: `token ${githubToken}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching commits:', error);
    return [];
  }
}

// Function to delay execution for a specified time
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function to fetch all commits, build the rows in memory, and then save them
async function main() {
  let page = 1;
  let commits;
  let rows = [];

  do {
    commits = await fetchCommits(page);
    if (commits.length > 0) {
      for (const commit of commits) {
        const author = commit.commit.author;
        const committer = commit.commit.committer;

        rows.push({
          date: author.date,
          githubEmail: author.email,
          name: author.name,
          commitMessage: commit.commit.message
        });
      }
    }
    page++;
    await delay(1000); // Wait for 1 second before making the next request
  } while (commits.length === 100);

  // Write all rows to the Parquet file
  const writer = await parquet.ParquetWriter.openFile(schema, filename);
  for (const row of rows) {
    await writer.appendRow(row);
  }
  await writer.close();

  console.log(`Commits saved to ${filename}`);
}

main();

