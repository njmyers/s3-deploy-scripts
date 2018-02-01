#!/usr/bin/env node

const chalk = require('chalk');
const { putDirectoryToS3, putDeployLog, getDirectoryFromS3, deleteObjects } = require('./lib/s3');
const { mergeDeployLog } = require('./lib/log');
const { readDirectory, stripAllExceptKey } = require('./lib/dir');
const { validateRelease, validateCredentials, logTask, consoleOutput, enforcePolicy, enforceWebsite } = require('./deploy');

function validateResolutions(resolutions) {
	return resolutions;
}

async function deploy() {

	console.log(chalk.yellow('deploying your build to S3...'));

	try {
		
		logTask('validating release', 'started');
		const { Bucket, log, release, cwd } = await validateRelease();
		logTask('validating release', 'completed');
		await enforceWebsite({ Bucket });

		logTask('reading old deploy', 'started');
		const oldContainers = await getDirectoryFromS3({
			Bucket,
			Prefix: 'current'
		});
		logTask('reading old deploy', 'completed');

		// console.log(oldContainers);
		if (oldContainers.length > 0) {

			// put last deploy streams to S3 in new directory
			logTask('archiving old deploy', 'started');
			const resolve = await putDirectoryToS3({
				Bucket,
				containers: oldContainers,
				dest: `releases/${log.current.id}`,
				stub: 'current'
			});
			logTask('archiving old deploy', 'completed');

			logTask('deleting old deploy', 'started');
			const deleted = await deleteObjects({
				Bucket,
				Delete: {
					Objects: stripAllExceptKey(oldContainers)
				}
			});
			logTask('deleting old deploy', 'completed');
		}

		// read build directory recursively & synchronously then creates readable streams
		logTask('reading build directory', 'started');
		const containers = readDirectory(`${cwd}/build`);
		logTask('reading build directory', 'completed');

		// put streams to S3 and rename to current
		logTask('uploading current build', 'started');
		const resolutions = await putDirectoryToS3({
			Bucket,
			containers,
			dest: 'current',
			stub: 'build'
		});
		validateResolutions(resolutions);
		logTask('uploading current build', 'completed');


		logTask('merging and uploading new log', 'started');
		const newLog = mergeDeployLog(log, release);
		const resolution = await putDeployLog({
			Bucket,
			Body: JSON.stringify(newLog, null, 4)
		});
		logTask('merging and uploading new log', 'completed');

		validateResolutions(resolution);

		logTask('enforcing policy', 'started');
		const policy = await enforcePolicy({ Bucket })
		logTask('enforcing policy', 'completed');
		
		consoleOutput(release);

	} catch(e) {
		console.log(chalk.red(e));		
	}
}

deploy();

async function taskManager(cb) {

}

/*
	log task
	run function

 */