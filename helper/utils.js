let fs = require('fs');
let crypto = require('crypto');
let mongoose = require('mongoose');
let path = require('path');
let async = require('async');
const url = require('url');
const https = require('https');

let utils = {};
utils.base64FileRegex = /^data:([A-Za-z-+\/]+);base64,(.+)$/;
utils.isDefined = (variable) => {
  if (typeof variable == 'boolean') return true;
  return (typeof variable !== undefined && variable != null && variable != "");
}

utils.empty = (mixedVar) => {
  let undef, key, i, len;
  let emptyValues = ["undefined", undefined, null, false, 0, '', '0'];
  for (i = 0, len = emptyValues.length; i < len; i++) {
    if (mixedVar === emptyValues[i]) {
      return true;
    }
  }
  if (typeof mixedVar === 'object') {
    for (key in mixedVar) {
      return false;
    }
    return true;
  }

  return false;
}

utils.isObject = (obj) => {
  return (typeof obj === "object") ? true : false;
}

module.exports = utils;
