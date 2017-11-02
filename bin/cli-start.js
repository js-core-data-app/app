#! /usr/bin/env node
const program = require("commander");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const getPort = require("get-port");
const exitHook = require("exit-hook");

const database = require("../lib/database");
const api = require("../lib/api");
const seed = require("../lib/seed");

let app = express();

app.use(
  cors({
    allowedHeaders: "Content-Range,Content-Type,Range,Authorization",
    exposedHeaders: "Content-Range"
  })
);
app.use(bodyParser.json());
app.use(api(database));

const start = async port => {
  try {
    await seed.import(database, "startup");
  } catch (e) {}

  port = await getPort({ port: port });
  if (process.env.NODE_ENV !== "production") {
    console.log("migating/syncing database");
    await database.syncSchema({
      automigration: true,
      ignoreMissingVersion: true
    });
  }

  console.log("starting api");
  const server = app.listen(port, err => {
    console.log(`listening on ${port}, err: ${err}`);
  });

  exitHook(function() {
    console.log("detected exit, stopping server");
    server.close();
  });
};

program.option("-p, --port [port]", "specify port").parse(process.argv);

start(process.env.PORT || program.port || 80);
