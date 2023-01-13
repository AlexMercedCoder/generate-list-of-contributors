## Methodology

Step 1 - Generate CSV of Contributions from Public Github Repo by running script in `contrib-csv.js` 

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