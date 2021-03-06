/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var test = require('tape');
var hapiRequestInformationExtractor = require('../../lib/request-extractors/hapi.js');
var Fuzzer = require('../../utils/fuzzer.js');

test(
  'Test request information extraction given invalid input'
  , function ( t ) {

    var DEFAULT_RETURN_VALUE = {
      method: ""
      , url: ""
      , userAgent: ""
      , referrer: ""
      , statusCode: 0
      , remoteAddress: ""
    };

    var f = new Fuzzer();
    var cbFn = function ( value ) {

      t.deepEqual(
        value
        , DEFAULT_RETURN_VALUE
        , "Given invalid arguments the express information extractor should return the default object"
      );
    }

    f.fuzzFunctionForTypes(
      hapiRequestInformationExtractor
      , ["object"]
      , cbFn
    );

    t.end();
  }
);

test(
  'Test request information extraction given valid input'
  , function ( t ) {

    var FULL_REQ_DERIVATION_VALUE = {
      method: "STUB_METHOD"
      , url: "www.TEST-URL.com"
      , info: {
        remoteAddress: "0.0.0.0"
      }
      , headers: {
        'x-forwarded-for': '0.0.0.1'
        , 'user-agent': "Something like Mozilla"
        , referrer: "www.ANOTHER-TEST.com"
      }
      , response: {
        statusCode: 200
      }
    };

    var FULL_REQ_EXPECTED_VALUE = {
      method: "STUB_METHOD"
      , url: "www.TEST-URL.com"
      , userAgent: "Something like Mozilla"
      , referrer: "www.ANOTHER-TEST.com"
      , remoteAddress: '0.0.0.1'
      , statusCode: 200
    };

    var PARTIAL_REQ_DERIVATION_VALUE = {
      method: "STUB_METHOD_#2"
      , url: "www.SUPER-TEST.com"
      , info: {
        remoteAddress: "0.0.2.1"
      }
      , headers: {
        'user-agent': "Something like Gecko"
        , referrer: "www.SUPER-ANOTHER-TEST.com"
      }
      , response: {
        output: {
          statusCode: 201
        }
      }
    };

    var PARTIAL_REQ_EXPECTED_VALUE = {
      method: "STUB_METHOD_#2"
      , url: "www.SUPER-TEST.com"
      , userAgent: "Something like Gecko"
      , referrer: "www.SUPER-ANOTHER-TEST.com"
      , remoteAddress: "0.0.2.1"
      , statusCode: 201
    };

    var ANOTHER_PARTIAL_REQ_DERIVATION_VALUE = {
      method: "STUB_METHOD_#2"
      , url: "www.SUPER-TEST.com"
      , headers: {
        'user-agent': "Something like Gecko"
        , referrer: "www.SUPER-ANOTHER-TEST.com"
      }
    };

    var ANOTHER_PARTIAL_REQ_EXPECTED_VALUE = {
      method: "STUB_METHOD_#2"
      , url: "www.SUPER-TEST.com"
      , userAgent: "Something like Gecko"
      , referrer: "www.SUPER-ANOTHER-TEST.com"
      , remoteAddress: ""
      , statusCode: 0
    };

    t.plan(3);

    t.deepEqual(
      hapiRequestInformationExtractor(FULL_REQ_DERIVATION_VALUE)
      , FULL_REQ_EXPECTED_VALUE
      , [
        "Given a full valid derivation value with an x-forwarded-for header the"
        , "output of the extractor should reflect these values"
      ].join(" ")
    );

    t.deepEqual(
      hapiRequestInformationExtractor(PARTIAL_REQ_DERIVATION_VALUE)
      , PARTIAL_REQ_EXPECTED_VALUE
      , [
        "Given a partial valid derivation value without an x-forwarded-for"
        , "header the output of the extractor should reflect these values"
      ].join(" ")
    );

    t.deepEqual(
      hapiRequestInformationExtractor(ANOTHER_PARTIAL_REQ_DERIVATION_VALUE)
      , ANOTHER_PARTIAL_REQ_EXPECTED_VALUE
      , [
        "Given a partial valid derivation value without a remote address the"
        , "extractor should reflect these values"
      ].join(" ")
    );
  }
);
