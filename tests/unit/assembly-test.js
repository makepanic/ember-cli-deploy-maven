const expect = require('chai').expect;
const util = require('util');
const parseString = util.promisify(require('xml2js').parseString);
const plugin = require('../../index').createDeployPlugin({ name: 'maven' });

describe('Assembly descriptor', function () {
  const mockUi = {
    verbose: true,
    messages: [],
    write() {},
    writeLine: function (message) {
      this.messages.push(message);
    }
  };

  const context = {
    ui: mockUi,
    config: {}
  };

  beforeEach(function () {
    context.config.maven = {
      groupId: 'com.example.foo',
      artifactId: 'dummy'
    };
  });

  it('contains configured formats', async function () {
    // given configured formats
    context.config.maven.formats = ['zip', 'tar.gz'];

    // when preparing the plguin and parsing the assembly descriptor XML
    plugin.beforeHook(context);
    plugin.configure(context);
    const xml = await parseString(plugin._buildAssemblyDescriptor(), { explicitArray: false });

    // then the XML contains the configured formats
    expect(xml.assembly.formats.format).to.be.an('array')
    expect(xml.assembly.formats.format).to.have.property('length', 2);
    expect(xml.assembly.formats.format).to.include('zip');
    expect(xml.assembly.formats.format).to.include('tar.gz');
  });
})
