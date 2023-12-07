import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function getRepositoryStats(repoName, date, token) {
  const [owner, repo] = repoName.split("/");
  const currentDate = new Date(date);

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  async function fetchData(url) {
    const response = await axios.get(url, config);
    return response.data;
  }

  const [
    repoResponse,
    contributorsResponse,
    pullsResponse,
    issuesResponse,
    starsResponse,
  ] = await Promise.all([
    fetchData(`https://api.github.com/repos/${owner}/${repo}`),
    fetchData(`https://api.github.com/repos/${owner}/${repo}/contributors`),
    fetchData(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all`),
    fetchData(`https://api.github.com/repos/${owner}/${repo}/issues?state=all`),
    fetchData(`https://api.github.com/repos/${owner}/${repo}/stargazers`),
  ]);

  const thirtyDaysAgo = new Date(currentDate);
  thirtyDaysAgo.setDate(currentDate.getDate() - 30);

  const [issuesCreatedResponse, issuesClosedResponse, commitsResponse] =
    await Promise.all([
      fetchData(
        `https://api.github.com/repos/${owner}/${repo}/issues?state=all&since=${thirtyDaysAgo.toISOString()}`
      ),
      fetchData(
        `https://api.github.com/repos/${owner}/${repo}/issues?state=closed&since=${thirtyDaysAgo.toISOString()}`
      ),
      fetchData(
        `https://api.github.com/repos/${owner}/${repo}/commits?since=${thirtyDaysAgo.toISOString()}`
      ),
    ]);

  const repoData = repoResponse;
  const contributors = contributorsResponse;

  // Filter pull requests created on or before the specified date
  const mergedPullRequests = pullsResponse.filter(
    (pr) => pr.merged_at && new Date(pr.created_at) <= currentDate
  );
  const openPullRequests = pullsResponse.filter(
    (pr) => !pr.merged_at && new Date(pr.created_at) <= currentDate
  );

  // Filter issues created on or before the specified date
  const openIssues = issuesResponse.filter(
    (issue) => !issue.closed_at && new Date(issue.created_at) <= currentDate
  );

  const starsCount = starsResponse.length;

  // Filter issues created in the last 30 days
  const issuesCreatedCount = issuesCreatedResponse.filter(
    (issue) => new Date(issue.created_at) >= thirtyDaysAgo
  ).length;
  const issuesClosedCount = issuesClosedResponse.filter(
    (issue) => new Date(issue.created_at) >= thirtyDaysAgo
  ).length;
  const commitsCount = commitsResponse.filter(
    (commit) => new Date(commit.commit.author.date) >= thirtyDaysAgo
  ).length;

  const stats = {
    contributors: contributors.length,
    mergedPullRequests: mergedPullRequests.length,
    openPullRequests: openPullRequests.length,
    openIssues: openIssues.length,
    stars: starsCount,
    last30Days: {
      issuesCreated: issuesCreatedCount,
      issuesResolved: issuesClosedCount,
      commits: commitsCount,
    },
  };

  return stats;
}

// Example usage
const repoName = "apache/iceberg";
const date = "2023-08-23"; // Replace with your desired date
const githubToken = process.env.GIT_TOKEN; // Replace with your GitHub token
getRepositoryStats(repoName, date, githubToken)
  .then((stats) => {
    console.log(stats);
  })
  .catch((error) => {
    console.error("Error fetching repository stats:", error);
  });
