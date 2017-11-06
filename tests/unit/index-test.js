const assert = require('assert');
const xml2js = require('xml2js');
const util = require('util');

const parseString = util.promisify(xml2js.parseString);

describe('my new plugin', function () {
  var subject, mockUi;

  beforeEach(function () {
    subject = require('../../index');
    mockUi = {
      verbose: true,
      messages: [],
      write() {
      },
      writeLine: function (message) {
        this.messages.push(message);
      }
    };
  });

  it('has a name', function () {
    const result = subject.createDeployPlugin({
      name: 'test-plugin'
    });

    assert.equal(result.name, 'test-plugin');
  });

  describe('hook', function () {
    it('builds a correct pom.xml', async function () {
      const plugin = subject.createDeployPlugin({name: 'maven'});
      const context = {
        ui: mockUi,
        config: {
          maven: {
            version: '1.3.7',
            snapshot: true,
            groupId: 'com.example.foo',
            artifactId: 'dummy',
            repositories: [{
              id: 'codehaus',
              url: 'http://snapshots.maven.codehaus.org/maven2'
            }],
            distributionManagement: [{
              snapshot: true,
              id: 'example-snapshots',
              url: 'https://example.com/maven/snapshots'
            }, {
              snapshot: false,
              id: 'example-releases',
              url: 'https://example.com/maven/releases'
            }]
          }
        }
      };

      plugin.beforeHook(context);
      plugin.configure(context);

      const parsed = await parseString(plugin._buildPomContent(), {explicitArray: false});

      assert.equal(parsed.project.version, '1.3.7-SNAPSHOT');
      assert.equal(parsed.project.artifactId, 'dummy');
      assert.equal(parsed.project.groupId, 'com.example.foo');
      assert.deepEqual(parsed.project.repositories.repository, {id: 'codehaus', url: 'http://snapshots.maven.codehaus.org/maven2'});
      assert.deepEqual(parsed.project.distributionManagement.snapshotRepository, {id: 'example-snapshots', url: 'https://example.com/maven/snapshots'});
      assert.deepEqual(parsed.project.distributionManagement.repository, {id: 'example-releases', url: 'https://example.com/maven/releases'});
    })
  });
});
