'use strict';

var _ = require('lodash');
var Intake = require('intake');
var intake = new Intake();

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
        var jsonStats = {
            errors: []
        };
        if (intake.isEmptyOrUndefined(primaryStatsPRT)) {
            var error = {
                message: 'The primary stats data is empty or undefined'
            }
            jsonStats.errors.push(error);
        }
        else {
            var lines = primaryStatsPRT.split(/\r?\n/);
            jsonStats = { "teams": [] };
            var teamLineFound = false;
            var primaryStatsYearFound = false;
            var battingStatsHeaderLineParsed = false;
            var battingColumns = [];
            var pitchingStatsHeaderLineParsed = false;
            var pitchingColumns = [];
            var teamIndex = -1;
            var statsMode = '';    // switch between batting and pitching stats mode
            const primaryPlayerStatistics = 'Primary Player Statistics For';
            const regExpBracesAndOne = /\[[1]\]/;
            const regExpBracesAndTwo = /\[[2]\]/;
            const regExpBracesAndFour = /\[[4]\]/;
            const regExpCapitalLetterThenPeriod = /[A-Z]\./;
            var statsHeaderLine = '';
            _.forEach(lines, function (line) {
                // find each team based on "Primary Player Statistics"
                if (line.indexOf(primaryPlayerStatistics) > 0) {
                    teamLineFound = true;
                    var teamLine = line.substr(primaryPlayerStatistics.length + 9);
                    if (primaryStatsYearFound === false) {
                        jsonStats.year = line.substr(primaryPlayerStatistics.length + 4, 4);
                        primaryStatsYearFound = true;
                    }
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
                        statsHeaderLine = (line.search(regExpBracesAndOne) && line.indexOf('NAME') > 0);
                        if ((statsHeaderLine !== false) && (line.indexOf('BAVG') > 0)) {
                            statsMode = 'B';
                        }
                        if ((statsHeaderLine !== false) && (line.indexOf('ERA') > 0)) {
                            statsMode = 'P';
                        }
                        if ((statsMode === 'B') && (battingStatsHeaderLineParsed === false)) {
                            // parse stats header line once
                            line = line.replace(regExpBracesAndOne, '');
                            var battingHeaderLineColumnHeadings = line.split(/(\s+)/);
                            _.forEach(battingHeaderLineColumnHeadings, function (columnHeading) {
                                if (columnHeading.trim() !== '') {
                                    battingColumns.push(columnHeading);
                                }
                            });
                            battingStatsHeaderLineParsed = true;
                        }
                        if ((statsMode === 'P') && (pitchingStatsHeaderLineParsed === false)) {
                            // parse stats header line once
                            line = line.replace(regExpBracesAndOne, '');
                            var pitchingHeaderLineColumnHeadings = line.split(/(\s+)/);
                            _.forEach(pitchingHeaderLineColumnHeadings, function (columnHeading) {
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
                                    if (statsMode === 'B') {
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
                                    }
                                    if (statsMode === 'P') {
                                        var pitchingStats = {};
                                        var pitchingStatsIndex = 0;
                                        _.forEach(statsColumns, function (statColumn) {
                                            if (statColumn.trim() !== '') {
                                                statColumn = statColumn.replace(regExpBracesAndFour, '');
                                                pitchingStats[pitchingColumns[pitchingStatsIndex]] = statColumn;
                                                pitchingStatsIndex++;
                                            }
                                        });
                                        jsonStats.teams[teamIndex].pitchers.push(pitchingStats);
                                    }
                                }
                            }
                        }
                    }
                }
                teamLineFound = false;
            });
        }
        return jsonStats;
    },
    readFromFile: function(fileLocation) {
        return fs.readFileSync(fileLocation, 'utf8');
    }
};
