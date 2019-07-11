import NobelWinners from "../src/js/nobelWinners.js";
import { assert } from "chai";
import { describe, it } from "mocha";

describe("createNobelWinners", function() {
    it("should create NobelWinners instance", function() {
        let jsonData = require("../src/json/nobelWinners.json");
        let nobelWinners = new NobelWinners(jsonData.laureates);
        assert.isTrue(nobelWinners instanceof NobelWinners);
    });
});