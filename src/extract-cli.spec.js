/**
 * Functional Testing of the Extract CLI
 *
 * Pay attention when adding new tests:
 * - Jest runs the tests in parallel by default
 * - The tests are not platform-independent
 * - There should NOT be another test accessing your "test fixture file" in the same time
 * - Try to pipe the data from memory rather than using temporary files
 */
const fixtures = require('./test-fixtures.js');
const fs = require('fs');
const util = require('util');

const exec = util.promisify(require('child_process').exec);

describe('Command Line Usage', () => {
  it('should output a correct POT file for vue component with $gettext used in template and data', async() => {
    // Jest runs the tests in parallel by default.
    const path = `/tmp/TestComponent_${(new Date()).getTime()}.vue`;
    fs.writeFileSync(path, fixtures.VUE_COMPONENT_WITH_GETTEXT_IN_TEXT_AND_DATA);
    const {stdout} = await exec(`node ./src/extract-cli.js --attribute v-translate ${path}`);
    expect(stdout).toEqual(fixtures.CLI_OUTPUT_VUE_COMPONENT_WITH_GETTEXT_IN_TEXT_AND_DATA.replace(/{path}/g, path));
  });
});
