# Elastic APM Sourcemap Action

Save sourcemaps for use with Kibana APM.

**Requires source maps are named the same as their bundle with `.map` appended.**

## Inputs

### `apm_node`
**Required** Elastic APM Endpoint.

### `service_version`
**Required** The service version used in the RUM Agent.

### `service_name`
**Required** The service name used in the RUM Agent.

### `sourcemap_buld_directory`
**Required** Local directory where sourcemaps are bundled to (`build`, `dist` or similar).

### `sourcemap_pattern`
**Required** Sourcemap pattern match. Default `"**/*.map"`.

### `bundle_url`
**Required** Base URL where sourcemaps are deployed to.

### `token`
**Required** Your elastic API Token / Secret.

## Example usage

```
- name: Publish sourcemaps
  uses: strikelabs/elastic-sourcemap-action@v1.0
  with:
      apm_node: https://localhost:8200
      bundle_url: "https://foo.bar/assets"
      service_name: 'website'
      service_version: 1.0.0
      sourcemap_build_directory: './build'
      token: ${{ secrets.APM_TOKEN }}
```