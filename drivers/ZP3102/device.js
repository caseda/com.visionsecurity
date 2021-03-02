"use strict";

const { ZwaveDevice } = require("homey-zwavedriver");

//http://products.z-wavealliance.org/products/703

class ZP3102 extends ZwaveDevice {
  // this method is called when the Device is inited
  async onNodeInit({ node }) {
    // enable debugging
    this.enableDebug();

    // print the node's info to the console
    this.printNode();

    this.registerCapability("alarm_motion", "BASIC", {
      report: "BASIC_SET",
      reportParser: report => report["Value"] === 255,
    });

    this.registerCapability("alarm_generic", "SENSOR_BINARY", {
      get: "SENSOR_BINARY_GET",
      report: "SENSOR_BINARY_REPORT",
      reportParser: report => report["Sensor Value"] === "detected an event",
    });

    this.registerCapability("alarm_tamper", "NOTIFICATION", {
      optional: true,
      getParser: () => {
        return {
          "V1 Alarm Type": 0,
          "Notification Type": "Access Control",
          Event: 0,
        };
      },
      report: "NOTIFICATION_REPORT",
      reportParser: report =>
        report["Event (Parsed)"] === "Tampering, Product covering removed",
    });

    this.registerCapability(
      "measure_temperature",
      "SENSOR_MULTILEVEL",
      {
        get: "SENSOR_MULTILEVEL_GET",
        getParser: () => {
          return {
            "Sensor Type": "Temperature (version 1)",
            Properties1: {
              Scale: 0,
            },
          };
        },
        report: "SENSOR_MULTILEVEL_REPORT",
        reportParser: report =>
          report["Sensor Type"] !== "Temperature (version 1)"
            ? null
            : report["Sensor Value (Parsed)"],
      }
    );

    this.registerCapability("measure_battery", "BATTERY", {
      get: "BATTERY_GET",
      report: "BATTERY_REPORT",
      reportParser: report =>
        report["Battery Level"] === "battery low warning"
          ? 1
          : report["Battery Level (Raw)"][0],
    });
  }
}

module.exports = ZP3102;