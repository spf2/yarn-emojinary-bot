var assert = require('chai').assert;
var emojinary = require('../emojinary');
describe('emojinary', function() {
  describe('#fuzzyMatch()', function () {
    it('should think identical movies are identical', function () {
      assert.isOk(emojinary.fuzzyMatch("Jaws", "Jaws"));
      assert.isOk(emojinary.fuzzyMatch("Monkey Business", "Monkey Business"));
    });
    it('should ignore punctuation', function () {
      assert.isOk(emojinary.fuzzyMatch("Jaws", "Jaws?"));
      assert.isOk(emojinary.fuzzyMatch("Jaws", "Jaws!!"));
    });
    it('should match phonetic movies', function () {
      assert.isOk(emojinary.fuzzyMatch("Jaws", "Jawz"));
      assert.isOk(emojinary.fuzzyMatch("Monkey Business", "monkey Busines"));
      assert.isOk(emojinary.fuzzyMatch("Guardians of the Galaxy", "Guardans of the Galaxie"));
      assert.isOk(emojinary.fuzzyMatch("10 Cloverfield Lane", "10 Cloverfield Ln"));
    });
    it('should match similar movies', function () {
      assert.isOk(emojinary.fuzzyMatch("Sister Act II", "Sister Act"));
    });
    it('should strip articles', function () {
      assert.isOk(emojinary.fuzzyMatch("The Station Agent", "Station Agent"));
      assert.isOk(emojinary.fuzzyMatch("A Monkey to Remember", "Monkey to Remember"));
    });
    it('should try both titles if contains :', function () {
      assert.isOk(emojinary.fuzzyMatch("Star Wars: A New Hope", "Star Wars"));
      assert.isOk(emojinary.fuzzyMatch("Star Wars: A New Hope", "A New Hope"));
    });
    it('should not fuck up completely', function () {
      assert.isNotOk(emojinary.fuzzyMatch("Star Wars", "Babe"));
      assert.isNotOk(emojinary.fuzzyMatch("Sister Act II", "Roger Doger"));
      assert.isNotOk(emojinary.fuzzyMatch("Sister Act II", "🔥"));
    });
    it('should not match these similar titles', function () {
      assert.isNotOk(emojinary.fuzzyMatch("Star Wars", "Star Farts"));
      assert.isNotOk(emojinary.fuzzyMatch("Hunger Games", "Hanger Times"));
    });
  });
});
