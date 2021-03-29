const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const glob = require('@actions/glob');
const httpm = require('@actions/http-client');

const http = new httpm.HttpClient();

/**
 * @param {string} a 
 * @param {string} b 
 */
function joinURLPath(a, b) {
  return a.replace(/\/$/, "") + "/" + b.replace(/^\//, "");
}

/**
 * Upload a single sourcemap to elastic
 * @param {string} map 
 */
async function upload(sourcemap) {
  const sourcemap_path = sourcemap.split(path.join(core.getInput('sourcemap_build_directory')))[1];
  const source_path = sourcemap_path.replace('.map', ''); // TODO: Not everything ends in .map '~'

  const response = await http.post(
    joinURLPath(core.getInput('apm_node'), "/assets/v1/sourcemaps"),
    {
      sourcemap: fs.createReadStream(sourcemap),
      service_version: core.getInput('service_version'),
      service_name: core.getInput('service_name'),
      bundle_filepath: joinURLPath(core.getInput('bundle_url'), source_path),
    },
    {
      Authorization: `Bearer ${core.getInput("token")}`
    }
  );

  if(response.message.statusCode >= 400) {
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