#!/usr/bin/env -S node --experimental-repl-await
const fspath = require('path')
global.$require = name => require(fspath.join(process.cwd(), name))
const commands = {
  presang: ['build', 'sitemap'],
  sverd: ['boot', 'install', 'update', 'deploy'],
  generate: ['generate'],
  waveorb: ['serve', 'create', 'get', 'help', 'cmd']
}
const command = (process.argv[2] || 'help').trim()

function moduleBin(name, dir) {
  require(fspath.join(__dirname, '..', 'node_modules', dir || name, 'bin', `${name}.js`))
}

if (commands.presang.includes(command)) {
  moduleBin('presang')

} else if (commands.sverd.includes(command)) {
  moduleBin('sverd')

} else if (commands.generate.includes(command)) {
  require('waveorb-generate')

} else if (commands.waveorb.includes(command)) {
  require(fspath.join(__dirname, '..', 'scripts', `${command}.js`))

} else {
  console.log(`\nCommand not found: ${command}`)
  console.log(`\nRun 'waveorb help' to see available commands.`)
}
