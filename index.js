const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const glob = require('@actions/glob');
const httpm = require('@actions/http-client');

const http = new httpm.HttpClient();

/**
 * Upload a single sourcemap to elastic
 * @param {string} map 
 */
async function upload(sourcemap) {
  const url = sourcemap
    .split(core.getInput('sourcemap_build_directory'))[1]
    .replace('.map', ''); // TODO: Not everything ends in .map '~'

  const response = await http.post(core.getInput('elastic_node'), {
    sourcemap: fs.createReadStream(sourcemap),
    service_version: core.getInput('service_version'),
    service_name: core.getInput('service_name'),
    bundle_filepath: path.join(core.getInput('bundle_url'), url),
  }, {
    Authorization: `Bearer ${core.getInput("token")}`
  });

  if(response.message.statusCode > 400) {
    const body = await response.readBody();
    throw Error(`Failed to upload sourcemap ${sourcemap}`, response.statusCode, body);
  }
}

async function run() {
  try {
    const globber = await glob.create(path.join(
      core.getInput('sourcemap_build_directory'),
      core.getInput('sourcemaps')
    ));
    
    const sourcemaps = await globber.glob();
    const promises = [];

    sourcemaps.forEach(map => {
      promises.push(upload(map));
    });

    await Promise.all(promises);
  } catch(e) {
    core.setFailed(e);
  }
}

run();