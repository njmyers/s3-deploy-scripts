// @flow
import program from 'commander';
import path from 'path';
import { getPackageJson, getDeployOptions, getGlobalOptions } from './config';

import { deploy } from './commands';

const packageJSON = getPackageJson();

program.version(packageJSON.version);

program
  .command('deploy [folder]')
  .description('deploy the specified folder to an AWS S3 bucket')
  // load global option
  .option('-B, --bucket <bucket>', 'specify aws bucket inline')
  .option(
    '-S, --secret-access-key <secret>',
    'specify amazon secret access key inline'
  )
  .option('-I, --access-key-id <id>', 'specify amazon access id inline')
  .option('-R --region <region>', 'the AWS region')
  .option('-D --debug', 'debugs the utility with verbose output')
  // individual
  .option('-F, --force', 'ignore all warnings')
  .option('-s, --silent', 'silent mode suppress feedback')
  .option('-m, --mime', 'add mime types to all files')
  .option('--app-root [root]', 'root path of your application')
  .option('--cache [value]', 'add cache control headers to all files')
  .option('--build-folder [folder]', 'specify build folder')
  .option('--keep-deploys [number]', 'how many deploys to keep')
  .option(
    '-C --cache-ignore <file,anotherFile>',
    'files to ignore adding cache control headers',
    (val) => val.split(',')
  )
  .action((env, options) => {
    const deployOptions = getDeployOptions(env, options);
    const globalOptions = getGlobalOptions(env, options);

    console.log({ ...deployOptions, ...globalOptions });
    console.log(globalOptions.appRoot.path);

    deploy({ ...deployOptions, ...globalOptions });
  });

program
  .command('revert [release]')
  .description('revert to a previous release by git sha or release id')
  // global options
  .option('-B, --bucket <bucket>', 'specify aws bucket inline')
  .option(
    '-S, --secret-access-key <secret>',
    'specify amazon secret access key inline'
  )
  .option('-I, --access-key-id <id>', 'specify amazon access id inline')
  .option('-D --debug', 'debugs the utility with verbose output')
  // individual
  .option('-g, --git <sha>', 'sha of the git commit you wish to revert to')
  .option(
    '-id, --release-id <id>',
    'id of the the release you wish to revert to'
  )
  .action((env, options) => {
    console.log(env);
  });

program
  .command('log')
  .description('show the deploy log from your s3 bucket')
  // global options
  .option('-B, --bucket <bucket>', 'specify aws bucket inline')
  .option(
    '-S, --secret-access-key <secret>',
    'specify amazon secret access key inline'
  )
  .option('-I, --access-key-id <id>', 'specify amazon access id inline')
  .option('-D --debug', 'debugs the utility with verbose output')
  // individual
  .option('-v, --verbose', 'show verbose printout')
  .action((env, options) => {
    console.log(typeof env); //, options);
  });

program.parse(process.argv);