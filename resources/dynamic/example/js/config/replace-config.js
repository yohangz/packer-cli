import logo from '../assets/logo.png';

export let conf = {
  tagLine:
    'Full-fledged CLI tool to package library node module modules compliant with Browser and NodeJS with' +
    ' vanilla JS and Typescript source support | Inspired by Angular CLI',
  title: 'Packer CLI',
  logo,
  configType: 'REPLACE',
  githubUrl: 'https://github.com/yohangz/packer-cli',
  badges: {
    buildStatus: {
      imageUrl: 'https://travis-ci.org/yohangz/packer-cli.svg?branch=master',
      title: 'Build Status',
      redirectUrl: 'https://travis-ci.org/yohangz/packer-cli'
    },
    license: {
      imageUrl: 'https://img.shields.io/badge/license-MIT-blue.svg?style=flat',
      title: 'License',
      redirectUrl: 'https://github.com/yohangz/packer-cli/blob/master/LICENSE'
    },
    npmVersion: {
      imageUrl: 'https://badge.fury.io/js/packer-cli.svg',
      title: 'Package Version',
      redirectUrl: 'https://badge.fury.io/js/packer-cli'
    }
  }
};
