'use strict';

var expect = require('chai').expect;
var _ = require('lodash');

var strat2json = require('../index');

const fs = require('fs');

const testDataFileLocation = 'test/data/primary-stats-all-teams.prt';

var primaryStatsAllTeamsPRT;

beforeEach(function(done) {
    primaryStatsAllTeamsPRT = strat2json.readFromFile(testDataFileLocation);
    done();
});

describe('#strat2json', function() {
    it('should be able to read from a file location and not be null or empty', function() {
        expect(primaryStatsAllTeamsPRT).to.not.be.null;
        expect(primaryStatsAllTeamsPRT).to.not.be.empty;
    });
    it('should take the contents of a file and parse the data into JSON', function() {
        var result = strat2json.primaryStats2json(primaryStatsAllTeamsPRT);
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
    })
});
