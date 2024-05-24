const express = require("express");
const router = express.Router();
const path = require("path");

const { spawn } = require("child_process");

const pythonScriptPath =
  "C:\\Users\\Legion\\Desktop\\learn-node.js\\final_project\\AI\\diab.py";

router.post("/", async (req, res) => {
  const input_data = req.body;
  const childPython = spawn("conda", [
    "run",
    "-n",
    "base",
    "python",
    pythonScriptPath,
    JSON.stringify(input_data),
  ]);

  let output = "";

  childPython.stdout.on("data", (data) => {
    output += data;
  });

  childPython.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  return new Promise((resolve, reject) => {
    childPython.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python script exited with code ${code}`));
      } else {
        const result = parseInt(output.trim());
        res.status(200).json({ result });
        resolve();
      }
    });
  });
});

router.post("/anemia", async (req, res) => {
  const pythonScriptPath =
    "C:\\Users\\Legion\\Desktop\\learn-node.js\\final_project\\AI\\anemia.py"; // Replace with the actual path to your Python script

  const inputData = req.body.inputData; // Assuming inputData is an object

  const childPython = spawn("python", [
    pythonScriptPath,
    ...Object.values(inputData),
  ]);

  let output = "";

  childPython.stdout.on("data", (data) => {
    output += data.toString();
  });

  childPython.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  return new Promise((resolve, reject) => {
    childPython.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python script exited with code ${code}`));
      } else {
        try {
          const result = JSON.parse(output); // Parse the output as JSON
          res.status(200).json({ result }); // Send the result object as the response data
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  });
});

const multer = require("multer");

// Configure multer
const storage = multer.diskStorage({
  destination:
    "C:\\Users\\Legion\\Desktop\\learn-node.js\\final_project\\AI\\uploads", // Replace with the actual path to save uploads
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/skinill", upload.single("file"), (req, res) => {
  const pythonScriptPath =
    "C:\\Users\\Legion\\Desktop\\learn-node.js\\final_project\\AI\\test_skin.py"; // Replace with the actual path to your Python script

  const imageFilePath = req.file.path; // Get the uploaded file path

  const childPython = spawn("python", [pythonScriptPath, imageFilePath]);

  let output = "";

  childPython.stdout.on("data", (data) => {
    output += data.toString();
  });

  childPython.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  childPython.on("close", (code) => {
    if (code !== 0) {
      res.status(500).json({ error: `Python script exited with code ${code}` });
    } else {
      // Send the output as a plain string
      res.status(200).send(output);
    }
  });
});

module.exports = router;
