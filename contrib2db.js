import dotenv from "dotenv";
import axios from "axios";
import knex from "knex";
dotenv.config();
const { GIT_TOKEN, CONNECTION } = process.env;

const pg = knex({
  client: "pg",
  connection: CONNECTION,
});

const githubToken = GIT_TOKEN;

const assembleData = async (repository, table, cpages) => {
  console.count()
  // The below loop, loops per page of contributors
  // Loops through each contributors on each page
  // Aggregates their commits into target database schema
  // commits that page to the database


  for (let p = 1; p <= cpages; p += 1) {
    // make api call for next 100 contributors and aggregate commits
    console.count("outloop")
    const contribResponse = await axios.get(
      `https://api.github.com/repos/${repository}/contributors?per_page=100&page=${p}`,
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
      const contributions = [];

      const pages = Math.ceil(c.contributions / 100);

      for (let i = 1; i <= pages; i += 1) {
        console.count("innerloop")
        const res = await axios.get(
          `https://api.github.com/repos/${repository}/commits?author=${c.login}&per_page=100&page=${i}`,
          {
            headers: {
              Authorization: `token ${githubToken}`,
            },
          }
        );

        const commits = await res.data;

        for (let commit of commits) {
          console.count("commit loop")
          const { name, email, date } = commit.commit.author;
          console.log(name, email, date)
          const d = new Date(date);
          contributions.push({
            name: name,
            email: email,
            month: d.getMonth(),
            year: d.getFullYear(),
          });
        }
      }
      return contributions;
    });

    const contribs = await Promise.all(contributorsDetails);
    // console.log(contribs[0])
    for (let detail of contribs) {
      console.count("insert loop")
      console.log(detail)
      if(detail.length > 0){
        await pg(table).insert(detail);
      }
      
    }
  }

  pg.destroy();
  console.log("done");
};

try {
  assembleData("apache/iceberg", "iceberg_cont_2023", 4);
  // assembleData("apache/hudi", "hudi_cont_2023", 4);
  // assembleData("delta-io/delta", "delta_cont_2023", 3);
} catch (error) {
  console.log(error);
}
