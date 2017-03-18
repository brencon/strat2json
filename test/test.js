'use strict';

var expect = require('chai').expect;
var _ = require('lodash');

var strat2json = require('../index');

const fs = require('fs');

const testDataPrimaryStats = 'test/data/primary-stats-all-teams.prt';
const testDataWithSuffix = 'test/data/primary-stats-with-suffix.prt';

var primaryStatsAllTeamsPRT;

beforeEach(function(done) {
    primaryStatsAllTeamsPRT = strat2json.readFromFile(testDataPrimaryStats);
    done();
});

describe('#strat2json', function() {
    it('should be able to read from a file location and not be null or empty', function() {
        expect(primaryStatsAllTeamsPRT).to.not.be.null;
        expect(primaryStatsAllTeamsPRT).to.not.be.empty;
    });
    it('should take the contents of a file and parse the data into JSON', function() {
        var result = strat2json.primaryStats2json(primaryStatsAllTeamsPRT);
        expect(result).to.have.property('year');
        expect(result.year).to.not.be.empty;
        expect(result).to.have.property('teams');
        expect(result.teams).to.have.length.above(0);
        var tempIndex = 0;
        _.forEach(result.teams, function(team) {
            expect(team.batters).to.have.length.above(0);
            expect(team.pitchers).to.have.length.above(0);
        });
    });
    it('should return json with an error message about the file being empty', function() {
        var result = strat2json.primaryStats2json();
        expect(result).to.have.property('errors');
        expect(result.errors).to.have.length.above(0);
        var errorEmtpyMessageFound = false;
        _.forEach(result.errors, function(error) {
            if (error.message === 'The primary stats data is empty or undefined') {
                errorEmtpyMessageFound = true;
            }
        });
        expect(errorEmtpyMessageFound).to.equal(true);
    });
    it('should return an error about the file contents not matching', function() {
        var result = strat2json.primaryStats2json(strat2json.readFromFile('test/data/test-contents-wrong-format.txt'));
        expect(result).to.have.property('errors');
        expect(result.errors).to.have.length.above(0);
        var errorEmtpyMessageFound = false;
        _.forEach(result.errors, function(error) {
            if (error.message === 'File contents do not match expected Strat-O-Matic primary stats') {
                errorEmtpyMessageFound = true;
            }
        });
        expect(errorEmtpyMessageFound).to.equal(true);
    });
    it('should parse player names with a suffix or additional spaces correctly', function() {
        var primaryStatsWithSuffixPRT = strat2json.readFromFile(testDataWithSuffix);
        var result = strat2json.primaryStats2json(primaryStatsWithSuffixPRT);
        var tempIndex = 0;
        _.forEach(result.teams, function(team) {
            expect(team.batters).to.have.length.above(0);
            // assume data file has only J.Bradley Jr
            expect(team.batters[0].NAME.split(" ").length).to.be.greaterThan(1);
            expect(team.pitchers).to.have.length.above(0);
            // assume data file has only J.De La Rosa
            expect(team.pitchers[0].NAME.split(" ").length).to.be.greaterThan(2);
        });
    });;
});
