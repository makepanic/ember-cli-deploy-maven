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

    // when preparing the plugin and parsing the assembly descriptor XML
    plugin.beforeHook(context);
    plugin.configure(context);
    const xml = await parseString(plugin._buildAssemblyDescriptor(), { explicitArray: false });

    // then the XML contains the configured formats
    expect(xml.assembly.formats.format).to.be.an('array')
    expect(xml.assembly.formats.format).to.have.property('length', 2);
    expect(xml.assembly.formats.format).to.include('zip');
    expect(xml.assembly.formats.format).to.include('tar.gz');
  });

  it('excludes Maven-specific files and directories', async function () {
    // given configured formats
    context.config.maven.formats = ['zip', 'tar.gz'];

    // when preparing the plugin and parsing the assembly descriptor XML
    plugin.beforeHook(context);
    plugin.configure(context);
    const xml = await parseString(plugin._buildAssemblyDescriptor(), { explicitArray: false });

    // then the fileset configuration contains the relevant excludes
    expect(xml.assembly.fileSets.fileSet.excludes.exclude).to.be.an('array');
    expect(xml.assembly.fileSets.fileSet.excludes.exclude).to.have.property('length', 3);
    expect(xml.assembly.fileSets.fileSet.excludes.exclude).to.include('pom.xml');
    expect(xml.assembly.fileSets.fileSet.excludes.exclude).to.include('assembly.xml');
    expect(xml.assembly.fileSets.fileSet.excludes.exclude).to.include('target/');
  });

  it('is referenced in a profile within the POM', async function () {
    plugin.beforeHook(context);
    plugin.configure(context);

    const pom = await parseString(plugin._buildPomContent(), { explicitArray: false });

    expect(pom.project.profiles.profile).to.be.an('object');
    expect(pom.project.profiles.profile.id).to.equal('assembly');
  });

  it('is used when formats are configured', function () {
    // given configured formats
    context.config.maven.formats = ['zip', 'tar.gz'];

    // when preparing the plugin and checking the built Maven command
    plugin.beforeHook(context);
    plugin.configure(context);
    const mvnCommand = plugin._buildMavenCommand();

    // then it contains the profile
    expect(mvnCommand).to.equal('mvn deploy -Passembly');
  });

  it('is not used when no formats are configured', function () {
    // given no formats are configured
    // when preparing the plugin and checking the built Maven command
    plugin.beforeHook(context);
    plugin.configure(context);
    const mvnCommand = plugin._buildMavenCommand();

    // then it not contains the profile
    expect(mvnCommand).to.equal('mvn deploy');
  });
})
