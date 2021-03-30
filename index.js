const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const glob = require('@actions/glob');
const fetch = require('node-fetch');
const FormData = require('form-data');

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

  const body = new FormData();

  body.append('sourcemap',       fs.createReadStream(sourcemap));
  body.append('service_version', core.getInput('service_version'));
  body.append('service_name',    core.getInput('service_name'));
  body.append('bundle_filepath', joinURLPath(core.getInput('bundle_url'), source_path));

  return fetch(
    joinURLPath(core.getInput('apm_node'), "/assets/v1/sourcemaps"),
    { 
      method: "POST",
      body, 
      headers: {
        Authorization: `Bearer ${core.getInput("token")}`
      }
    }
  );
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