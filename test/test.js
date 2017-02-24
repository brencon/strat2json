'use strict';

var expect = require('chai').expect;

var strat2json = require('../index');

const fs = require('fs');

const testDataFileLocation = './test/data/primary-stats-all-teams.prt';

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
    })
});
