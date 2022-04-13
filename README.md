# JSON Parser

## How to run
- The program needs `node` to execute. You can download the latest `node` from [here](https://nodejs.org/en/).
- Run `npm install` from the root directory to install dependencies
- Run `npm start` from the root directory to transpile typescript and run the code

## Caveats
- The parser is not precise enough for string values.
  Strings that contain, for example, escaped double quotes (`"`) will lead to rejection.