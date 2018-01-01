#!/usr/bin/env node
const { start } = require("../lib/index");
const meow = require("meow");

const cli = meow(`
    Usage
      $ stackgamesempire-gift-list-fetch <url> --output <path>

    Options
      --output Output to write gift list json file

    Examples
      $ stackgamesempire-gift-list-fetch "http://exmaple/path/to" --output result.json
`);

start(cli.input[0], cli.flags.output)
  .then(() => {
    console.log("Done");
  })
  .catch(error => {
    console.error(error);
  });
