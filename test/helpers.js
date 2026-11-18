'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { escenarios } = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'datos', 'escenarios_semilla.json'), 'utf8'));

module.exports = { escenarios };
