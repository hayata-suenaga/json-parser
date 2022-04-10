import {readFileSync} from "fs";
import { jsonParse } from "./json-parser";

/* Edit here to change the file path to the json file */
const FILE_PATH = "medium_test.json";

const jsonStr = readFileSync(FILE_PATH, "utf8");
const result = jsonParse(jsonStr);
console.dir(result);