/* eslint-env node */
'use strict';

const cp = require('child_process');
const util = require('util');
const DeployPluginBase = require('ember-cli-deploy-plugin');
const hbs = require('handlebars');
const fs = require('fs');
const path = require('path');

const exec = util.promisify(cp.exec);
const writeFile = util.promisify(fs.writeFile);
const pomXmlTemplatePath = path.join(__dirname, 'lib', 'pom.xml.hbs');

const pomXmlTemplate = hbs.compile(fs.readFileSync(pomXmlTemplatePath, {encoding: 'utf8'}));

module.exports = {
  name: 'ember-cli-deploy-maven',

  createDeployPlugin: function (options) {
    const DeployPlugin = DeployPluginBase.extend({
      name: options.name,

      requiredConfig: [
        'groupId',
        'artifactId',
        'distributionManagement'
      ],

      defaultConfig: {
        snapshot: false,
        version: function (context) {
          return context.project && context.project.pkg && context.project.pkg.version ?
            context.project.pkg.version :
            "0.0.0";
        },
        packaging: 'jar',
        finalName: '${project.artifactId}-${project.version}-${git.commit.id.abbrev}',
        formats: [],
        repositories: [],
        distributionManagement: []
      },

      upload: async function (context) {
        const command = 'mvn deploy';
        const distPath = path.join(context.project.root, context.config.build.outputPath);

        await writeFile(path.join(distPath, 'pom.xml'), this._buildPomContent());

        return exec(command, {cwd: distPath}).catch(e => {
          // patch error message to include stdout
          e.message = e.message + "\n" + e.stdout + "\n" + e.stderr;
          throw e;
        })
      },

      _buildPomContent() {
        const version = this.readConfig('version');
        const suffix = this.readConfig('snapshot') ? '-SNAPSHOT' : '';

        return pomXmlTemplate({
          groupId: this.readConfig('groupId'),
          artifactId: this.readConfig('artifactId'),
          version: `${version}${suffix}`,
          packaging: this.readConfig('packaging'),
          finalName: this.readConfig('finalName'),
          repositories: this.readConfig('repositories'),
          distributionManagement: this.readConfig('distributionManagement'),
          gitDirectoryPath: path.join(__dirname, ".git")
        });
      },

      _buildAssemblyDescriptor() {
        const assemblyDescriptorTemplatePath = path.join(__dirname, 'lib', 'assembly.xml.hbs');
        const assemblyDescriptorTemplate = hbs.compile(fs.readFileSync(assemblyDescriptorTemplatePath, { encoding: 'utf8' }));

        return assemblyDescriptorTemplate({
          formats: this.readConfig('formats')
        });
      }
    });

    return new DeployPlugin();
  }
};
