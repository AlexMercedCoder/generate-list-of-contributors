## Generate List of Contributors

### Setup
- clone this repo
- run `npm install` to install dependencies

### editing contrib-csv.js

Things you need to edit before running the scripts

- put your github personal token on line 4

```js
const githubToken = "";
```

- adjust the url in this part of the script to determine which page you want to grab

```js
  // make api call
  const contribResponse = await axios.get(
    `https://api.github.com/repos/${repository}/contributors?per_page=100&page=2`,
    {
      headers: {
        Authorization: `token ${githubToken}`,
      },
    }
  );
```

*NOTE: You can have max 100 contributers on a page, so for repos with more than 100 contributors you'll need to piece together the full list from multiple of runs of the script. I'd make two csv, and copy the results from the generated csv to a blank one to assemble to full list*

- create an empty csv to write the data to, if you are targeting a repo called apache/iceberg the file should be called apache-iceberg.csv

- make sure to call the assembleCSV functions at the end of the script with your target repos name

```js
assembleCSV("apache/iceberg")
```