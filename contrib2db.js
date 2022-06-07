import dotenv from "dotenv";
import axios from "axios";
import knex from "knex";
dotenv.config();
const {GIT_TOKEN, CONNECTION} = process.env

const pg = knex({
  client: 'pg',
  connection: CONNECTION,
});


const githubToken = GIT_TOKEN;

const assembleData = async (repository, table) => {

  // make api call for top 10 contributors
  const contribResponse = await axios.get(
    `https://api.github.com/repos/${repository}/contributors?per_page=10&page=1`,
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

    const contributions = []

    const pages = Math.ceil(c.contributions / 100)

    for(let i = 1; i <= pages; i += 1){
      const res = await axios.get(`https://api.github.com/repos/${repository}/commits?author=${c.login}&per_page=100&page=${i}`, {
        headers: {
          Authorization: `token ${githubToken}`,
        },
      });

      const commits = await res.data

      for (let commit of commits){
        const {name, email, date} = commit.commit.author
        // console.log(name, email, date)
        const d = new Date(date)
        contributions.push({
          name: name,
          email: email,
          month: d.getMonth(),
          year: d.getFullYear()
        })
      }
    
    }
    return contributions

  });

  const contribs = await Promise.all(contributorsDetails)
  // console.log(contribs[0])
    for (let detail of contribs){
      await pg(table).insert(detail)
    }
    pg.destroy()
    console.log("done")
};

try {
  // assembleData("apache/iceberg", "iceberg_contributors");
  assembleData("apache/hudi", "hudi_contributors")
  // assembleData("delta-io/delta", "delta_contributors");
} catch (error) {
  console.log(error);
}
