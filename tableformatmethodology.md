## Methodology

### Step 1
Generate CSV of Contributions from Public Github Repo by running script in `contrib-csv.js` 

[script](./contrib-csv.js)

Run it three times, leaving two of these function calls commented out, so only one runs at a time (to avoid github.com throttling).

```js
try {
  // assembleCSV("apache/iceberg", "011323");
  // assembleCSV("apache/hudi", "011323")
  assembleCSV("delta-io/delta","011323");
} catch (error) {
  console.log(error);
}
```

Step 2

Make cleanup efforts.

- Make sure the company names are consistent so tabulations are correct
- Lookup employers of contributors so tabulations are accurate
- For those with 10+ contributions parse out whether contributions stretched across time at multiple companies.
- For parsing out based on employement, I use the contrib2db.js script in this repo to populate a postgres table with all commits by every contributor then use aggregation queries to determine which commits below to the tenure at each company based on the contributors linkedIn profile.

Step 3

Create a pivot table that aggregates contributions among all contributors by company then make a chart from the pivot table.