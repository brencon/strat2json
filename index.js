'use strict';

var _ = require('lodash');

const fs = require('fs');

/**
 * primaryStats2json
 * Expects data to be sent that is read from a Strat-O-Matic
 * print file generated from the team primary stats interface
 * @param primaryStatsPRT {string}
 * @return {string}
 */

module.exports = {
    primaryStats2json: function(primaryStatsPRT) {
        var lines = primaryStatsPRT.split(/\r?\n/);
        var jsonStats = { "teams": [] };
        _.forEach(lines, function(line) {
            // find each team based on "Primary Player Statistics"
            var primaryPlayerStatistics = 'Primary Player Statistics For 2016 ';
            if (line.indexOf(primaryPlayerStatistics) > 0) {
                var teamLine = line.substr(38);
                var totalsAfterGames = ' Totals After';
                var team = teamLine.substr(0, teamLine.indexOf(totalsAfterGames));
                jsonStats.teams.push({"team": team});
            }
        });
        return jsonStats;
    },
    readFromFile: function(fileLocation) {
        return fs.readFileSync(fileLocation, 'utf8');
    }
};
