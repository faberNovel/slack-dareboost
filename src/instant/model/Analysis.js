const Dareboost = require('./Dareboost');
const Report = require('./Report');
const sleep = require('sleep');
const colors = require('colors/safe');

var MAX_TRIES = 20;
var TIME_BETWEEN_TRIES = 5000;

class Analysis {
  constructor(conf) {
    this.conf = conf;
  }

  start(callback) {
    var response = Dareboost.request('analysis/launch', this.conf);

    if (!response.body.reportId) {
      console.log(response);
      throw new Error(`Error ${response.body.message} for launching analysis for "${this.conf.url}"`)
    }

    this.reportId = response.body.reportId;
    callback(response.body);
  }

  getReport() {
    var currentTry = 1;

    while (currentTry <= MAX_TRIES) {
      console.log(`Try #${currentTry} for ${this.conf.url}`);
      var response = Dareboost.request('analysis/report', {reportId: this.reportId});

      if (response.body.status == 200) {
        return new Report(this, this.reportId, response.body.report);
      } else if (response.body.status == 202) {
        sleep.msleep(TIME_BETWEEN_TRIES);
        currentTry++;
      } else {
        throw new Error(`Error during report request for ${this.conf.url}: error ${response.body.status}`);
      }
    }

    throw new Error('Timeout for report request.');
  }
}

module.exports = Analysis;
