#!/usr/bin/env node
'use strict';

const path = require('path');
const chalk = require('chalk');
const program = require('commander');
const latestVersion = require('latest-version');
const { version } = require('../package');
const getDefaultLibraryParams = require('./get-default-library-params');
const createLibrary = require('./create-library');
const promptLibraryParams = require('./prompt-library-params');

module.exports = async () => {
  const _version = await latestVersion('krul-cli');
  if (String(_version) != String(version)) {
    console.log('please update the latest version\r\n');
    console.log(`your current version：${version}\r\n`);
    console.log(`latest version：${_version}\r\n`);
    return;
  }
  const defaults = await getDefaultLibraryParams();

  program
    .name('krul-cli')
    .version(version)
    .usage('[options] [package-name]')
    .option('-d, --desc <string>', 'Package description')
    .option('-a, --author <string>', 'Author\'s github handle', defaults.author)
    .option('-l, --license <string>', 'Package license', defaults.license)
    .option('-r, --repo <string>', 'Package repo path')
    .option('-g, --no-git', 'Generate without git init')
    .option('-m, --manager <npm|yarn>', 'Package manager to use', /^(npm|yarn)$/, defaults.manager)
    .option('-t, --typescript', 'Add TypeScript support to the generated template')
    .option('-s, --skip-prompts', 'Skip all prompts (must provide package-name via cli)')
    .parse(process.argv);

  const opts = {
    description: program.desc,
    author: program.author,
    license: program.license,
    repo: program.repo,
    manager: program.manager,
    skipPrompts: program.skipPrompts,
    typescript: program.typescript,
    git: program.git
  };

  Object.keys(opts).forEach((key) => {
    if (!opts[key] && defaults[key]) {
      opts[key] = defaults[key];
    }
  });

  if (program.args.length === 1) {
    opts.name = program.args[0];
  } else if (program.args.length > 1) {
    console.error('invalid arguments');
    program.help();
    process.exit(1);
  }

  const params = await promptLibraryParams(opts);
  const dest = await createLibrary(params);

  console.log(`
  🤘project is created on ${dest}\r\r
  ☕️happy hacking...
`);


  return dest;
};

module.exports()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
