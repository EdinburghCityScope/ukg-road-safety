// MapIt importer script and GeoJson builder.
const edinburghcityscopeUtils = require('edinburghcityscope-utils');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const _ = require('lodash');
const csv2geojson = require('csv2geojson');
const json2csv = require('json2csv');

const datadir = path.join(__dirname, '..', 'data');
const guideFile = path.join(datadir, 'source', 'Road-Accident-Safety-Data-Guide.xls');
const accidentFile = path.join(datadir, 'source', 'Accidents_2015.csv');
const outputCsvFile = path.join(datadir, 'road-safety.csv');
const outputGeoJsonFile = path.join(datadir, 'road-safety.geojson');

// The code for City of Edinburgh
const localAuthorityHighwayCode = 'S12000036';

var workbook = XLSX.readFile(guideFile);
var guide = {};
var worksheet, row, datum;
var sheetNames = workbook.SheetNames;
var data = [];

// Remove the documentation sheets.  We're only interested in the code/label pairs.
_.pull(sheetNames, 'Introduction', 'Export Variables');

_.forEach(sheetNames, (name) => {
    switch (name) {
        case 'Ped Cross - Human':
            key = 'Pedestrian_Crossing-Human_Control';
            break;
        case 'Ped Cross - Physical':
            key = 'Pedestrian_Crossing-Physical_Facilities';
            break;
        case 'Road Surface':
            key = 'Road_Surface_Conditions';
            break;
        case 'Urban Rural':
            key = 'Urban_or_Rural_Area';
            break;
        case 'Weather':
            key = 'Weather_Conditions';
            break;
        default:
            key = name.replace(/ /g, '_');
    }
    guide[key] = {};
    worksheet = workbook.Sheets[name];

    if (worksheet['A1'].v.toLowerCase() != 'code' || worksheet['B1'].v.toLowerCase() != 'label') {
        throw new Error("Unknown worksheet format for " + name);
    }

    row = 2;
    while (worksheet['A' + row]) {
        guide[key][worksheet['A' + row].v] = worksheet['B' + row].v
        row += 1;
    }
});

// Accidents source
var Converter = require("csvtojson").Converter;
var converter = new Converter({});
converter.fromFile(accidentFile, function(err, result) {
    if (err) throw err;

    var fields = _.keys(result[0]).sort();
    // Make sure the id, Latitude and Longitude fields are listed first.
    _.pull(fields, 'Latitude', 'Longitude');
    fields.unshift('Longitude');
    fields.unshift('Latitude');
    fields.unshift('id');

    var mappings = _.intersection(_.keys(guide), fields);

    for (i = 0; i < result.length; i++) {
        if (result[i]['Local_Authority_(Highway)'] != localAuthorityHighwayCode) {
            continue;
        }

        if (!result[i]['Latitude'] || !result[i]['Longitude']) {
            console.log(`Skipping record ${result[i].Accident_Index} because missing geolocation`);
            continue;
        }
        datum = result[i];
        datum.id = datum.Accident_Index;

        _.forEach(mappings, (col) => {
            datum[col] = guide[col][datum[col]];
        });

        data.push(datum);
    }

    var csv = json2csv({ data: data, fields: fields, newLine: "\n" });
    fs.writeFileSync(outputCsvFile, csv);
    console.log('CSV file saved to ' + outputCsvFile);

    csv2geojson.csv2geojson(csv, {
        latfield: 'Latitude',
        lonfield: 'Longitude',
        delimiter: ','
    }, (err, geoJson) => {
        if (err) throw new Error(err[0].message + ': ' + err[0].row.id)

        for (var i=0; i < geoJson.features.length; i++) {
            geoJson.features[i].id = geoJson.features[i].properties.id;
        }

        fs.writeFileSync(outputGeoJsonFile, JSON.stringify(geoJson));
        console.log('GeoJSON file saved to ' + outputGeoJsonFile);
    });
});

edinburghcityscopeUtils.updateDataModificationDate(path.join(__dirname, '..'));
