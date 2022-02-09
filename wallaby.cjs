// Copyright (c) 2022 Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

module.exports = function (w) {
    return {
        testFramework: "mocha",
        files: [
            "package.json",
            "scripts/**/*.js",
            "!scripts/tests/**/*.spec.js",
        ],
        tests: [
            "scripts/tests/**/*.spec.js"
        ],
        setup: wallaby => {
            const mocha = wallaby.testFramework;

            const chai = require('chai');
            const sinon = require('sinon');
            const sinonChai = require('sinon-chai');

            chai.use(sinonChai);

            // setup sinon hooks
            mocha.suite.beforeEach('sinon before', function () {
                if (this.sinon == null || typeof this.sinon === 'undefined') {
                    this.sinon = sinon.createSandbox();
                }
            });
            mocha.suite.afterEach('sinon after', function () {
                if (this.sinon && 'function' === typeof this.sinon.restore) {
                    this.sinon.restore();
                }
            });

            global.expect = chai.expect;
            global.assert = chai.assert
        },
        env: {
            type: "node"
        },
        workers: { restart: true },  // IMPORTANT
    };
};
