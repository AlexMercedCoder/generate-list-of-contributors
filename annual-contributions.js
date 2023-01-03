import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const { GIT_TOKEN } = process.env;

async function totalAnnualContributions({repo, year}){
    let total = 0
    let page = 1
    let loop = true

    while(loop){
        const commits = await axios.get(
            `https://api.github.com/repos/${repo}/commits?since=${year}-01-01T01:01:01Z&until=${year}-12-31T59:59:59Z&per_page=100&page=${page}`,
            {
              headers: {
                Authorization: `token ${GIT_TOKEN}`,
              },
            }
          );
        
        total += commits.data.length

        if(commits.data.length < 100){
            loop = false
        }

        page += 1
        console.log("Running Total:", total)
        console.log("Next Page:", page)
    }
    
    console.log(`total commits for ${repo} in ${year} is ${total}`)

    return total
}

totalAnnualContributions({repo: "apache/iceberg", year: 2017})