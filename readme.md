DocDoc
====================

This is a handy viewer for the javascript in your project using [docco](https://github.com/jashkenas/docco) to prepare the source for viewing. Project is built using [backbone boilerplate](https://github.com/tbranyen/backbone-boilerplate/).

This is very much a work and progress, not production ready. 

## Configuration ##

Add a file called `config.js` to `/server/modules` that looks like this:

```javascript
this.hgUrl = '[url of hg repo]';
this.localRepoPath = '[local repo root]';
this.modulePath = '[path from project root to modules root]';
this.stagingPath = '[staging directory to keep repo clean from renaming, etc.]';
this.basePath = '[root from os default to project]';
```