# ember-cli-deploy-maven

[![Build Status](https://travis-ci.org/makepanic/ember-cli-deploy-maven.svg?branch=master)](https://travis-ci.org/makepanic/ember-cli-deploy-maven)
[![npm version](https://badge.fury.io/js/ember-cli-deploy-maven.svg)](https://www.npmjs.com/package/ember-cli-deploy-maven)

> An ember-cli-deploy plugin to deploy static assets to a maven repository 

This plugin does a maven deploy with all build ember-cli assets. It can be used to let other maven projects consume your ember app.

_Note:_ this plugin is in early development.

## What is an ember-cli-deploy plugin?

A plugin is an addon that can be executed as a part of the ember-cli-deploy pipeline. A plugin will implement one or more of the ember-cli-deploy's pipeline hooks.

For more information on what plugins are and how they work, please refer to the [Plugin Documentation][1].

## Quick Start

To get up and running quickly, do the following:

- Ensure [ember-cli-deploy-build][2] is installed and configured.

- Install this plugin

```bash
$ ember install ember-cli-deploy-maven
```

- Place the following configuration into `config/deploy.js`

```javascript
ENV.maven = {
  groupId: 'com.example.foo',
  artifactId: 'dummy',
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
```

- Run the pipeline

```bash
$ ember deploy
```

## Installation

Run the following command in your terminal:

```bash
ember install ember-cli-deploy-maven
```

## ember-cli-deploy Hooks Implemented

For detailed information on what plugin hooks are and how they work, please refer to the [Plugin Documentation][1].

- `upload`

## Configuration Options

For detailed information on how configuration of plugins works, please refer to the [Plugin Documentation][1].

### snapshot

This flags tells the plugin to suffix the version with `-SNAPSHOT` to declare a [SNAPSHOT release][3].

*Default:* `false`

### version

The version of the generated artifact.

*Default:* package.json version or "0.0.0" if not found

### packaging

Artifact type package

*Default:* jar

### finalName

The name of the bundled project when it's finally built.

*Default:* `${project.artifactId}-${project.version}-${git.commit.id.abbrev}`

### repositories

A list of [repositories][4].

*Default:* `[]`

*Example:*

```js
repositories: [{
  id: 'codehaus',
  url: 'http://snapshots.maven.codehaus.org/maven2'
}]
```

### distributionManagement

A list of [distributionManagement repositories][5].
Use the `snapshot` field to configure the given repository as `snapshotRepository` instead of a `repository`.

*Default:* `[]`

*Example:*

```js
distributionManagement: [{
  snapshot: true,
  id: 'example-snapshots',
  url: 'https://example.com/maven/snapshots'
}, {
  snapshot: false,
  id: 'example-releases',
  url: 'https://example.com/maven/releases'
}]
```

### formats
A list of formats as supported by the [Maven assembly plugin][6]. If this field is set, this addon activates a Maven profile which will execute the Maven assembly plug-in to build the desired assemblies.

*Default:* `[]`

*Example:*

```js
formats: ['zip', 'tar.gz']
```

## Running Tests

* `yarn test`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

[1]: http://ember-cli-deploy.com/plugins/ "Plugin Documentation"
[2]: https://github.com/ember-cli-deploy/ember-cli-deploy-build "ember-cli-deploy-build"
[3]: https://docs.oracle.com/middleware/1212/core/MAVEN/maven_version.htm#MAVEN401 "The SNAPSHOT Qualifier"
[4]: https://maven.apache.org/pom.html#Repositories "Repositories"
[5]: https://maven.apache.org/pom.html#Distribution_Management "Distribution Management"
[6]: http://maven.apache.org/plugins/maven-assembly-plugin/ "Maven Assembly Plugin"

## Contributing

- please follow the [conventional commits](https://conventionalcommits.org/) to structure your commits
