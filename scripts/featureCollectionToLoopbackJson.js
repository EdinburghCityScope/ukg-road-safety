// Script which converts a FeatureCollection to an array of Features
const fs = require('fs');
const path = require('path');
const datadir = path.join(__dirname, '..', 'data');
const edinburghcityscopeUtils = require('edinburghcityscope-utils');

const filename = 'road-safety';
const outputFile = path.join(datadir, filename + '-loopback.json');

// Data zones
var featureCollection = fs.readFileSync(path.join(datadir, filename + '.geojson'), 'utf8');
var features = edinburghcityscopeUtils.featureCollectionToFeatureArray(featureCollection);
var loopbackJson = edinburghcityscopeUtils.featureArrayToLoopbackJson(features);

fs.writeFileSync(outputFile, JSON.stringify(loopbackJson));
console.log(outputFile + ' created');
