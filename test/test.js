'use strict';

var expect = require('chai').expect;

var strat2json = require('../index');

describe('#strat2json', function() {
    it('should return itself', function() {
        var result = strat2json.primaryStats2json('test');
        expect(result).to.equal('test');
    });
});
