# ukg-road-safety
2015 Road safety data for Edinburgh.

These files provide detailed road safety data about the circumstances of personal injury road accidents in GB from 1979, the types (including Make and Model) of vehicles involved and the consequential casualties. The statistics relate only to personal injury accidents on public roads that are reported to the police, and subsequently recorded, using the STATS19 accident reporting form. 

All the data variables codes have been mapped to their textual strings using the lookup tables available from the data.gov.uk site below. 

Vehicle type and casualty profile data has not yet been included, neither has data for 1979 - 2014.

Please note that the 2015 data were revised on the 29th September 2016. 

Statistics provided by UK Government Department for Transport:  https://data.gov.uk/dataset/road-accidents-safety-data

## License

Data is licensed under the Open Government License: http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/

## Requirements

- NodeJS
- npm

## Installation

Clone the repository

```
git clone https://github.com/EdinburghCityScope/ukg-road-safety.git
```

Install npm dependencies

```
cd ukg-road-safety
npm install
```

Run the API (from the ukg-road-safety directory)

```
node .
```

Converting the extracted data into loopback data.

```
node scripts/featureCollectionToLoopbackJson.js
```

Re-build data files from the statistics.gov.scot API

```
node scripts/build-data.js
```
