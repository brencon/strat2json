'use strict';

var _ = require('lodash');
var Intake = require('intake');
var intake = new Intake();

const fs = require('fs');

const regExpBracesAndOne = /\[[1]\]/;
const regExpBracesAndTwo = /\[[2]\]/;
const regExpBracesAndFour = /\[[4]\]/;
const regExpCapitalLetterThenPeriod = /[A-Z]\./;

module.exports = {
    /**
        * primaryStats2json
        * Expects data to be sent that is read from a Strat-O-Matic
        * print file generated from the team primary stats interface
        * @param primaryStatsPRT {string}
        * @return {string}
    */
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
            jsonStats.teams = [];
            var teamLineFound = false;
            var primaryStatsYearFound = false;
            var battingStatsHeaderLineParsed = false;
            var battingColumns = [];
            var pitchingStatsHeaderLineParsed = false;
            var pitchingColumns = [];
            var teamIndex = -1;
            var statsMode = '';    // switch between batting and pitching stats mode
            const primaryPlayerStatistics = 'Primary Player Statistics For';
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
                        statsHeaderLine = ((line.search(regExpBracesAndOne) === 0) && line.indexOf('NAME') > 0);
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
                                    // split on [4]
                                    //  left side is player name, right side are stats
                                    var playerLine = line.split(regExpBracesAndFour);
                                    // then the line contains a capital letter and a period
                                    var statsColumns = playerLine[1].split(/(\s+)/);
                                    if (statsMode === 'B') {
                                        var battingStats = {};
                                        var battingStatsIndex = 0;
                                        // set first index value to the player name
                                        battingStats[battingColumns[battingStatsIndex]] = playerLine[0];
                                        battingStatsIndex++;
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
                                        // set first index value to the player name
                                        pitchingStats[pitchingColumns[pitchingStatsIndex]] = playerLine[0];
                                        pitchingStatsIndex++;
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
            // if no teams were found then the file contents are not primary stats
            if (jsonStats.teams.length === 0) {
                var error = {
                    message: 'File contents do not match expected Strat-O-Matic primary stats'
                }
                jsonStats.errors.push(error);
                delete jsonStats.teams;
            }
        }
        return jsonStats;
    },
    /**
     * leagueStandings2json
     * Expects data to be sent that is read from a Strat-O-Matic
     * print file generated from the league standings interface
     * @param leagueStandingsPRT {string}
     * @return {string}
     */
    leagueStandings2json: function(leagueStandingsPRT) {
        var leagueStandingsYearFound = false;
        var jsonStandings = {
            errors: []
        };
        if (intake.isEmptyOrUndefined(leagueStandingsPRT)) {
            var error = {
                message: 'The league standings data is empty or undefined'
            }
            jsonStandings.errors.push(error);
        }
        else {
            jsonStandings.conferences = [];
            var lines = leagueStandingsPRT.split(/\r?\n/);
            const leagueStandingsFor = 'LEAGUE STANDINGS FOR';
            var leagueStandingsForLine = '';
            var standingsHeaderLine = '';
            var overallRecordLine = '';
            var overallRecordLineFound = false;
            var wildCardLine = '';
            var wildCardLineFound = false;
            var conferenceFound = -1;
            var divisionFound = -1;
            var currentConference = 0;
            var currentDivision = 0;
            _.forEach(lines, function (line) {
                if (line.indexOf(leagueStandingsFor) > 0) {
                    leagueStandingsYearFound = true;
                    jsonStandings.year = line.substr(leagueStandingsFor.length + 4, 4);
                }
                if (leagueStandingsYearFound === true) {
                    // determine if the line is empty, a stats header row, or player row
                    if (line !== '') {
                        standingsHeaderLine = ((line.search(regExpBracesAndOne) === 0) && (line.indexOf('WON') > 0) && (line.indexOf('LOST') > 0) && (line.indexOf('PCT') > 0) && (line.indexOf('GB') > 0) && (line.indexOf('MAGIC#') > 0) && (line.indexOf('Standings') === -1));
                        if (standingsHeaderLine !== false) {
                            // this line is the conference abbreviation, division, and standings header columns
                            //console.log(line);
                            var standingsColumns = line.split(/(\s+)/);
                            // parse conferences
                            var lineConference = standingsColumns[0].replace(regExpBracesAndOne, '').trim();
                            conferenceFound = _.findIndex(jsonStandings.conferences, function(c) {
                                return c.conference === lineConference;
                            });
                            if (conferenceFound < 0) {
                                var conferenceObj = {
                                    conference: lineConference,
                                    divisions: []
                                };
                                jsonStandings.conferences.push(conferenceObj);
                            }
                            // parse divisions
                            var lineDivision = standingsColumns[2];
                            // find the index of the conference
                            currentConference = _.findIndex(jsonStandings.conferences, function(c) {
                                return c.conference === lineConference;
                            });
                            // find the index of the division
                            divisionFound = _.findIndex(jsonStandings.conferences[currentConference].divisions, function(d) {
                                return d.division === lineDivision;
                            });
                            if (divisionFound < 0) {
                                var divisionObj = {
                                    division: lineDivision,
                                    teams: []
                                };
                                jsonStandings.conferences[currentConference].divisions.push(divisionObj);
                            }
                            // find the index of the division
                            currentDivision = _.findIndex(jsonStandings.conferences[currentConference].divisions, function(d) {
                                return d.division === lineDivision;
                            });
                        }
                        else {
                            leagueStandingsForLine = ((line.search(regExpBracesAndOne) === 0) && (line.indexOf(leagueStandingsFor) > 0));
                            // ignore "wild card" standings
                            wildCardLine = ((line.search(regExpBracesAndOne) === 0) && (line.indexOf('Wild Card Standings') > 0));
                            if (wildCardLine === true) {
                                wildCardLineFound = true;
                            }
                            // check to see if the line contains OVERALL RECORD
                            overallRecordLine = ((line.search(regExpBracesAndOne) === 0) && (line.indexOf('OVERALL RECORD') > 0));
                            if (overallRecordLine === true) {
                                overallRecordLineFound = true;
                            }
                            if ((leagueStandingsForLine === false) && (overallRecordLineFound === false) && (wildCardLineFound === false)) {
                                // this will be the team and their record
                                //console.log(line);
                                var teamLineArray = line.split(regExpBracesAndFour);
                                var teamNameArray = teamLineArray[0].split(/(\s+)/);
                                var team = {
                                    teamCity: '',
                                    teamAbbreviation: ''
                                };
                                for (var i = 2; i < teamNameArray.length - 2; i++) {
                                    team.teamCity = team.teamCity += teamNameArray[i];
                                }
                                team.teamAbbreviation = teamNameArray[teamNameArray.length - 1];
                                var teamRecordArray = teamLineArray[1].split(/(\s+)/);
                                team.W = teamRecordArray[2];
                                team.L = teamRecordArray[4];
                                team.PCT = teamRecordArray[6];
                                team.GB = teamRecordArray[8];
                                jsonStandings.conferences[currentConference].divisions[currentDivision].teams.push(team);
                            }
                        }
                    }
                }
            });
        }
        return jsonStandings;
    },
    readFromFile: function(fileLocation) {
        return fs.readFileSync(fileLocation, 'utf8');
    }
};
