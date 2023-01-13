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

Step 3

Create a chart that counts each contributors contributions against their employer and measures them as a % against all contributions.