/**
 * @jest-environment node
 */

import Analyzer from "../src";

describe("kuroshiro-analyzer-kuromoji Node Test", () => {
    const EXAMPLE_TEXT = "すもももももも";

    let analyzer;

    it("Initialization", async (done) => {
        analyzer = new Analyzer({
            dictPath: "node_modules/kuromoji/dict/"
        });
        await analyzer.init();
        done();
    });

    it("Repeated Initialization", async (done) => {
        analyzer = new Analyzer({
            dictPath: "node_modules/kuromoji/dict/"
        });
        try {
            await analyzer.init();
            await analyzer.init();
            done("SHOULD NOT BE HERE");
        }
        catch (err) {
            done();
        }
    });

    it("Kuromoji Build Failed", async (done) => {
        analyzer = new Analyzer({
            dictPath: "node_modules/foo/bar"
        });
        try {
            await analyzer.init();
            done("SHOULD NOT BE HERE");
        }
        catch (err) {
            done();
        }
    });

    it("Parse Sentence", async (done) => {
        analyzer = new Analyzer();
        await analyzer.init();

        const ori = EXAMPLE_TEXT;
        analyzer.parse(ori)
            .then((result) => {
                // console.debug(result);
                expect(result).toBeInstanceOf(Array);
                expect(result).toHaveLength(4);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("Parse Null", async (done) => {
        analyzer = new Analyzer();
        await analyzer.init();

        analyzer.parse()
            .then((result) => {
                // console.debug(result);
                expect(result).toBeInstanceOf(Array);
                expect(result).toHaveLength(0);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    it("Parse Blank Sentence", async (done) => {
        analyzer = new Analyzer();
        await analyzer.init();

        const ori = "";
        analyzer.parse(ori)
            .then((result) => {
                // console.debug(result);
                expect(result).toBeInstanceOf(Array);
                expect(result).toHaveLength(0);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
});
