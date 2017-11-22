"use strict";

const path			= require('path');
const ZwaveDriver	= require('homey-zwavedriver');

//http://products.z-wavealliance.org/products/703

module.exports = new ZwaveDriver( path.basename(__dirname), {
	debug: false,
	capabilities: {
		'alarm_motion': [
		{
			'optional'					: true,
			'command_class'				: 'COMMAND_CLASS_NOTIFICATION',
			//'command_get'				: 'NOTIFICATION_GET',
			'command_get_parser'		: function(){
				return {
						"V1 Alarm Type" : 0,
						"Notification Type" : "Access Control",
						"Event" : 0,
					}
				},
			'command_report'			: 'NOTIFICATION_REPORT',
			'command_report_parser'		: function( report ){
				if (report['Event (Parsed)'] === 'Motion Detection, Unknown Location') {
					return true;
				}
				
				if (report['Event (Parsed)'] === 'Event inactive') {
					return false;
				}
				
				return null;
			}
		},
		{
			'optional': true,
			'command_class': 'COMMAND_CLASS_SENSOR_BINARY',
			'command_get': 'SENSOR_BINARY_GET',
			'command_report': 'SENSOR_BINARY_REPORT',
			'command_report_parser': report => report['Sensor Value'] === 'detected an event',
		}],

		'alarm_tamper': {
			'optional': true,
			'command_class'				: 'COMMAND_CLASS_NOTIFICATION',
			//'command_get'				: 'NOTIFICATION_GET',
			'command_get_parser'		: function(){
				return {
					"V1 Alarm Type" : 0,
					"Notification Type" : "Access Control",
					"Event" : 0,
				}
			},
			'command_report'			: 'NOTIFICATION_REPORT',
			'command_report_parser'		: function( report ){
				return report['Event (Parsed)'] === 'Tampering, Product covering removed';
			}
		},

		'measure_temperature': {
			'optional': true,
			'command_class'				: 'COMMAND_CLASS_SENSOR_MULTILEVEL',
			'command_get'				: 'SENSOR_MULTILEVEL_GET',
			'command_get_parser'		: function(){
				return {
					'Sensor Type': 'Temperature (version 1)',
					'Properties1': {
						'Scale': 0
					}
				}
			},
			'command_report'			: 'SENSOR_MULTILEVEL_REPORT',
			'command_report_parser'		: function( report ){
				if( report['Sensor Type'] !== 'Temperature (version 1)' )
					return null;

				return report['Sensor Value (Parsed)'];
			}
		}, 

		'measure_battery': {
			'command_class'				: 'COMMAND_CLASS_BATTERY',
			'command_get'				: 'BATTERY_GET',
			'command_report'			: 'BATTERY_REPORT',
			'command_report_parser'		: function( report ) {
				if( report['Battery Level'] === "battery low warning" ) return 1;
				return report['Battery Level (Raw)'][0];
			}
		}	
	}
})
