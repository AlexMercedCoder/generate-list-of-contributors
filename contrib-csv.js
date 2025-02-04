import csvWriter from "csv-writer";
import axios from "axios";
import dotenv from "dotenv";
import { writeFileSync, existsSync } from "fs";

dotenv.config();
const createCsvWriter = csvWriter.createObjectCsvWriter;
const githubToken = process.env.GIT_TOKEN;

const createWriter = (repository, date) => {
  const filePath = `./${repository.replace("/", "-")}-${date}.csv`;

  if (!existsSync(filePath)) {
    writeFileSync(filePath, "");
  }

  return createCsvWriter({
    path: filePath,
    header: [
      { id: "id", title: "customer_id" },
      { id: "username", title: "username" },
      { id: "name", title: "name" },
      { id: "company", title: "company" },
      { id: "location", title: "location" },
      { id: "blog", title: "blog" },
      { id: "email", title: "email" },
      { id: "contributions", title: "contributions" },
    ],
  });
};

const assembleCSV = async (repository, date) => {
  // create CSV writer
  const writer = createWriter(repository, date);

  async function getSomeContributors(page) {
    // make api call
    const contribResponse = await axios.get(
      `https://api.github.com/repos/${repository}/contributors?per_page=100&page=${page}`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
        },
      }
    );

    // parse json from response
    const contributors = await contribResponse.data;

    // loop through each contributor to fetch details
    const contributorsDetails = contributors.map(async (c) => {
      const res = await axios.get(`https://api.github.com/users/${c.login}`, {
        headers: {
          Authorization: `token ${githubToken}`,
        },
      });
      return await res.data;
    });

    // wait for all fetch requests to complete
    const contributorsArray = await Promise.all(contributorsDetails);

    // map array of contributors to match csv schema
    const finalContributors = contributorsArray.map((contributor, index) => {
      return {
        id: contributor.id,
        username: contributor.login,
        name: contributor.name,
        company: contributor.company,
        location: contributor.location,
        email: contributor.email,
        blog: contributor.blog,
        contributions: contributors[index].contributions,
      };
    });

    return finalContributors;
  }

  let p = 1;
  let loop = true;
  let contributorsDetails = [];

  while (loop) {
    let result = await getSomeContributors(p);
    if (result.length < 100) {
      loop = false;
    }
    console.log(p);
    p += 1;
    contributorsDetails.push(...result);
  }

  // Write CSV
  writer
    .writeRecords(contributorsDetails) // returns a promise
    .then(() => {
      console.log(`${repository}... Done`);
    });
};

try {
  assembleCSV("apache/iceberg", "020425");
  assembleCSV("apache/polaris", "020425");
  // assembleCSV("apache/hudi", "120623")
  // assembleCSV("delta-io/delta", "090324");
  // assembleCSV("opensearch-project/OpenSearch", "082323");
} catch (error) {
  console.log();
}
