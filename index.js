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
        var teamLineFound = false;
        var battingStatsHeaderLineParsed = false;
        var battingColumns = [];
        var pitchingStatsHeaderLineParsed = false;
        var pitchingColumns = [];
        var teamIndex = -1;
        const primaryPlayerStatistics = 'Primary Player Statistics For';
        const regExpBracesAndOne = /\[[1]\]/;
        const regExpBracesAndTwo = /\[[2]\]/;
        const regExpBracesAndFour = /\[[4]\]/;
        const regExpCapitalLetterThenPeriod = /[A-Z]\./;
        _.forEach(lines, function(line) {
            // find each team based on "Primary Player Statistics"
            if (line.indexOf(primaryPlayerStatistics) > 0) {
                teamLineFound = true;
                var teamLine = line.substr(primaryPlayerStatistics.length + 9);
                var totalsAfterGames = ' Totals After';
                var team = teamLine.substr(0, teamLine.indexOf(totalsAfterGames));
                jsonStats.teams.push({"team": team});
                teamIndex++;
                jsonStats.teams[teamIndex].batters = [];
                jsonStats.teams[teamIndex].pitchers = [];
            }
            if (teamLineFound === false) {
                // determine if the line is empty, a stats header row, or player row
                if (line !== '') {
                    var statsHeaderLine = (line.search(regExpBracesAndOne) && line.indexOf('NAME') > 0);
                    if ((statsHeaderLine !== false) && (battingStatsHeaderLineParsed === false)) {
                        // parse stats header line once
                        line = line.replace(regExpBracesAndOne, '');
                        var battingHeaderLineColumnHeadings = line.split(/(\s+)/);
                        _.forEach(battingHeaderLineColumnHeadings, function(columnHeading) {
                           if (columnHeading.trim() !== '') {
                               battingColumns.push(columnHeading);
                           }
                        });
                        battingStatsHeaderLineParsed = true;
                    }
                    if ((statsHeaderLine !== false) && (pitchingStatsHeaderLineParsed === false)) {
                        // parse stats header line once
                        line = line.replace(regExpBracesAndOne, '');
                        var pitchingHeaderLineColumnHeadings = line.split(/(\s+)/);
                        _.forEach(pitchingHeaderLineColumnHeadings, function(columnHeading) {
                            if (columnHeading.trim() !== '') {
                                pitchingColumns.push(columnHeading);
                            }
                        });
                        pitchingStatsHeaderLineParsed = true;
                    }
                    if (statsHeaderLine === false) {
                        // if the line is not [2]
                        if (line.search(regExpBracesAndTwo) === -1) {
                            // then it's a stats line
                            if (line.search(regExpCapitalLetterThenPeriod) === 0) {
                                // then the line contains a capital letter and a period
                                var statsColumns = line.split(/(\s+)/);
                                var battingStats = {};
                                var battingStatsIndex = 0;
                                _.forEach(statsColumns, function (statColumn) {
                                    if (statColumn.trim() !== '') {
                                        statColumn = statColumn.replace(regExpBracesAndFour, '');
                                        battingStats[battingColumns[battingStatsIndex]] = statColumn;
                                        battingStatsIndex++;
                                    }
                                });
                                jsonStats.teams[teamIndex].batters.push(battingStats);

                                // TODO: determine parser location for batting vs. pitching
                                // TODO: determine how/when to store team totals
                            }
                        }
                    }
                }
            }
            teamLineFound = false;
        });
        //console.log(jsonStats);
        //console.log(jsonStats.teams[0].batters);
        return jsonStats;
    },
    readFromFile: function(fileLocation) {
        return fs.readFileSync(fileLocation, 'utf8');
    }
};
