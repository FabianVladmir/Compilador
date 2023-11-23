import express from "express";
import cors from "cors";
import { savePythonCode, executePythonCode } from "./utils.js";
const app = express();
const port = 8080;
const FILE_PATH = "./script.py";

app.use(express.json());
app.use(cors())

app.post("/submit_code", async (req, res) => {
    // console.log(req)
	const codeSubmitData  = req.body;
	console.log("[POST] /submit_code", codeSubmitData);

	const srcCode = decodeURIComponent(codeSubmitData.src_code);

	await savePythonCode(srcCode, FILE_PATH);

	const output = await executePythonCode(FILE_PATH);
    
	res.json({
		output,
	});
    // res.json({
	// 	salida:"ff"
	// });
});

app.listen(port, () => {
	return console.log(`Express is listening at http://localhost:${port}`);
});