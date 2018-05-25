#!/usr/bin/env node

import yargs = require("yargs")

import pay from './pay'
import init from './init'

let argv = yargs
  .command(pay)
  .command(init)
  .showHelpOnFail(true)
  .demandCommand(1, '')
  .argv
