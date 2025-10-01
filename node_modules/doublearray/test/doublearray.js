// Copyright (c) 2014 Takuya Asano All Rights Reserved.

describe("doublearray", function () {
    before(function(done) {
        done();
    });
    describe("contain", function () {
        var trie;  // target
        var dict = {
            "apple": 1,
            "ball": 2,
            "bear": 3,
            "bird": 4,
            "bison": 5,
            "black": 6,
            "blue": 7,
            "blur": 8,
            "cold": 10,
            "column": 11,
            "cow": 12
        }
        var words = []
        for (var key in dict) {
            words.push({ k: key, v: dict[key]})
        }
        it("Contain bird", function () {
            trie = doublearray.builder().build(words);
	        expect(trie.contain("bird")).to.be.true;
        });
        it("Contain bison", function () {
            trie = doublearray.builder().build(words);
	        expect(trie.contain("bison")).to.be.true;
        });
        it("Lookup bird", function () {
            trie = doublearray.builder().build(words);
	        expect(trie.lookup("bird")).to.be.eql(dict["bird"]);
        });
        it("Lookup bison", function () {
            trie = doublearray.builder().build(words);
	        expect(trie.lookup("bison")).to.be.eql(dict["bison"]);
        });
        it("Build", function () {
            trie = doublearray.builder(4).build(words);
            // trie.bc.
            expect(trie.lookup("bison")).to.be.eql(dict["bison"]);
        });
    });
    describe("load", function () {
        var trie;       // target
        var load_trie;  // target
        var words = [ { k: "apple", v: 1 } ];  // test data
        beforeEach(function (done) {
            // Build original
            trie = doublearray.builder().build(words);

            // Load from original typed array
            var base_buffer = trie.bc.getBaseBuffer();
            var check_buffer = trie.bc.getCheckBuffer();
            load_trie = doublearray.load(base_buffer, check_buffer);

            done();
        });
        it("Original and loaded tries lookup successfully", function () {
            expect(trie.lookup("apple")).to.be.eql(words[0].v);
            expect(load_trie.lookup("apple")).to.be.eql(words[0].v);
        });
        it("Original and loaded typed arrays are same", function () {
            expect(trie.bc.getBaseBuffer()).to.deep.eql(load_trie.bc.getBaseBuffer());
            expect(trie.bc.getCheckBuffer()).to.deep.eql(load_trie.bc.getCheckBuffer());
        });
    });
});
