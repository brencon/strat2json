[![Build Status](https://travis-ci.org/brencon/strat2json.svg?branch=master)](https://travis-ci.org/brencon/strat2json)
[![Coverage Status](https://coveralls.io/repos/github/brencon/strat2json/badge.svg?branch=master)](https://coveralls.io/github/brencon/strat2json?branch=master)

# strat2json
Converts a Strat-O-Matic (SOM) print (prt) file data to JSON.

Pass the contents of a SOM primary stats file to `primaryStats2json`, and it will return the data parsed into a JSON object for each team with the batters and pitchers separated into different arrays.

## Motivation

SOM data primarily exists within the game itself, or exported as a PRT file. This module modernizes SOM data as JSON.

## Installation

`npm install strat2json`

## Tests

`npm test`

## Contributors

Brendan Conrad 
* Github - [brencon](https://github.com/brencon)
* Twitter - [symBrendan](https://twitter.com/symBrendan)

## License

MIT

## Disclaimer

This module is not affiliated with, associated with, authorized by, endorsed by, or in any way connected with Strat-O-Matic (SOM) or Major League Baseball (MLB).
