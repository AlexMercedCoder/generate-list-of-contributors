import csvWriter from "csv-writer";
import axios from "axios";
import dotenv from "dotenv"
import {writeFileSync, existsSync} from "fs"

dotenv.config()
const createCsvWriter = csvWriter.createObjectCsvWriter;
const githubToken = process.env.GIT_TOKEN;

const createWriter = (repository, date) => {

  const filePath = `./${repository.replace("/", "-")}-${date}.csv`

  if (!existsSync(filePath)){
    writeFileSync(filePath, "")
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

  // make api call
  const contribResponse = await axios.get(
    `https://api.github.com/repos/${repository}/contributors?per_page=100&page=3`,
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

  // Write CSV
  writer
    .writeRecords(finalContributors) // returns a promise
    .then(() => {
      console.log(`${repository}... Done`);
    });
};

try {
  // assembleCSV("apache/iceberg", "011323");
  assembleCSV("apache/hudi", "011323")
  // assembleCSV("delta-io/delta","011323");
} catch (error) {
  console.log(error);
}
