const https = require("https");
const zlib = require("zlib");
const fs = require("fs");

const url =
  "https://antm-pt-prod-dataz-nogbd-nophi-us-east1.s3.amazonaws.com/anthem/2024-01-01_anthem_index.json.gz"; // Replace with the HTTPS URL of the gzipped file
const outputFilePath = "output.json"; // Path to the output JSON file

const writeStream = fs.createWriteStream(outputFilePath);

let startTime = null;
let elapsedTime = null;
let estimatedTime = null;
let threshold = 0.01;

https
  .get(url, (res) => {
    const contentLength = parseInt(res.headers["content-length"], 10);
    let downloadedSize = 0;
    let lastProgress = 0;

    startTime = new Date();

    res
      .on("data", (chunk) => {
        downloadedSize += chunk.length;
        const progress = ((downloadedSize / contentLength) * 100).toFixed(2);

        if (progress - lastProgress >= threshold) {
          console.log(
            `Progress: ${progress}%, Elapsed Time: ${getElapsedTime()}, Estimated Time: ${getEstimatedTime(
              progress
            )}`
          );
          lastProgress = progress;
        }
      })
      .pipe(zlib.createGunzip())
      .pipe(writeStream)
      .on("finish", () => {
        console.log(
          `File extraction completed. Total Time: ${getElapsedTime()}`
        );

        // Now you can read the extracted JSON file and process it further if needed.
        fs.readFile(outputFilePath, "utf8", (err, data) => {
          if (err) {
            console.error("Failed to read the output file:", err);
            return;
          }

          try {
            const json = JSON.parse(data);
            console.log("JSON data:", json);

            // Perform any additional processing with the JSON data here
          } catch (error) {
            console.error("Failed to parse JSON:", error);
          }
        });
      })
      .on("error", (error) => {
        console.error("Error occurred during file extraction:", error);
      });
  })
  .on("error", (error) => {
    console.error("Error occurred while retrieving the file:", error);
  });

function getElapsedTime() {
  if (!startTime) return "N/A";

  elapsedTime = Math.floor((new Date() - startTime) / 1000);

  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  return `${minutes}m ${seconds}s`;
}

function getEstimatedTime(progress) {
  if (!elapsedTime || progress <= 0) return "N/A";

  estimatedTime = elapsedTime / (progress / 100) - elapsedTime;

  const minutes = Math.floor(estimatedTime / 60);
  const seconds = Math.floor(estimatedTime % 60);

  return `${minutes}m ${seconds}s`;
}
