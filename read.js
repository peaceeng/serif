const fs = require("fs");

const jsonFile = "./output.json";
const locationFile = "./location.json";
const stats = fs.statSync(jsonFile);
const fileSizeInBytes = stats.size;

function extractLocationUrls(jsonFile) {
  const stream = fs.createReadStream(jsonFile, { encoding: "utf8" });
  const writeStream = fs.createWriteStream(locationFile);
  let urlMapping = {};
  let bytesRead = 0;
  let startTime = new Date();

  stream.on("data", (data) => {
    const lines = data.split("\n");
    bytesRead += data.length;

    // Splits by line

    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      //   console.log("hello" + line.length + " " + line.slice(-150) + "\n");
      if (line.length > 0) {
        try {
          //   const obj = JSON.parse(line);
          //   extractUrlsFromObject(obj);
          const keysAndValues = line.split(/{|}/).filter((item) => item.length);
          keysAndValues
            .filter((item) => item.includes('"description"'))
            .forEach((item) => {
              const words = item.split(/["]+|[,]/);
              if (
                (words[3].includes("NY") || words[3].includes("New York")) &&
                words[3].includes("PPO")
              ) {
                if (!urlMapping[words[8]]) urlMapping[words[8]] = true;
                writeStream.write(words[8] + "\n");
              }
            });
        } catch (error) {
          console.error("Error parsing JSON object:", error);
        }
      }
      break;
    }

    const progress = (bytesRead / fileSizeInBytes) * 100;
    console.log(
      `Progress: ${progress.toFixed(2)}%`,
      convertBytes(bytesRead),
      "/",
      convertBytes(fileSizeInBytes)
    );
    console.log(`Curent Location Count: ${Object.keys(urlMapping).length}`);
  });

  stream.on("end", () => {
    writeStream.end();
    // Process the last remaining JSON object in the buffer, if any
    try {
      console.log(`${(new Date() - startTime) / 1000}s Elapsed`);
    } catch (error) {
      console.error("Error parsing JSON object:", error);
    }
  });
}

function convertBytes(bytes) {
  if (bytes >= 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  } else if (bytes >= 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  } else if (bytes >= 1024) {
    return (bytes / 1024).toFixed(2) + " KB";
  } else {
    return bytes + " bytes";
  }
}

// Example usage
extractLocationUrls(jsonFile);
