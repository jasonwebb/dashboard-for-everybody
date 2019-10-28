// Packages
let mqtt = require('mqtt')
let charts = require('chart.js');

// MQTT setup
let client = mqtt.connect('wss://test.mosquitto.org:8081');

// MQTT topics
let sensorDistanceTopic = 'iothackday/dfe/sensor-device/distance';
let inputDeviceStatusTopic = 'iothackday/dfe/sensor-device';
let outputDeviceStatusTopic = 'iothackday/dfe/output-device';

// Device status flags
let inputDeviceOnline = false;
let outputDeviceOnline = false;

// DOM elements
let inputDeviceStatusEl = document.getElementById('input-device-status');
let outputDeviceStatusEl = document.getElementById('output-device-status');

// Live chart elements and configs
let mockDataEnabled = true;
const maxReadings = 100;
let liveChart;
var ctx = document.getElementById('live-chart');

let dataObject = {
  labels: [],
  datasets: [{
    label: 'Sensor values',
    data: [],
    backgroundColor: 'rgba(255, 99, 132, 0.2)',
    borderColor: 'rgba(255, 99, 132, 1)',
    borderWidth: 1
  }]
};

let optionsObject = {
  xAxisID: 'Values',
  yAxisID: 'Timestamp',
  legend: {
    display: false
  },
  animation: false,
  scales: {
    xAxes: [{
      ticks: {
        display: false
      }
    }],
    yAxes: [{
      ticks: {
        beginAtZero: true,
        max: 4000
      }
    }]
  }
};


//========================================
//  Wait for page to fully load before
//  starting DOM manipulations
//========================================
window.addEventListener('DOMContentLoaded', function(e) {
  // Initialize live chart
  liveChart = new Chart(ctx, {
    type: 'line',
    data: dataObject,
    options: optionsObject
  });

  // Start generating mock sensor data, if enabled
  if(mockDataEnabled) {
    setInterval(() => {
      processMessages(sensorDistanceTopic, getRandomInt(0,4096));
    }, 100);
  }
});


//====================================================
//  Periodically check that devices are connected
//====================================================
setInterval(checkDevices, 3000);


//=======================================
//  Triggers
//=======================================
let triggers = [];

/**
  trigger: {
    threshold: int,
    aboveOrBelow: String ('above', 'below')
    action: String ('pulse', 'on', 'off', 'interval')
  }
*/


//=======================================
//  Set up and manage MQTT connection
//=======================================
if(!mockDataEnabled) {
  client.on('connect', () => {
    console.log('Connected to MQTT server ...');

    // Listen for device status messages
    client.subscribe(inputDeviceStatusTopic);
    client.subscribe(outputDeviceStatusTopic);

    // Listen for sensor data
    client.subscribe(sensorDistanceTopic);

    // Process messages when they arrive through any of the subscribed topics
    client.on('message', (topic, message) => {
      processMessages(topic, message);
    });
  });
}

function processMessages(topic, message) {
  switch(topic) {
    // Input device has sent keep-alive message
    case inputDeviceStatusTopic:
      if(!inputDeviceOnline) {
        inputDeviceOnline = true;
        displayDeviceStatus();
      }

      break;

    // Sensor device has sent data
    case sensorDistanceTopic:
      let nextValue;

      // Real MQTT messages need to be decoded, but not our mock data
      if(mockDataEnabled) {
        nextValue = message;
      } else {
        nextValue = new TextDecoder('utf-8').decode(message);
      }

      // Push next value to chart data object
      dataObject.labels.push(Date.now());
      dataObject.datasets[0].data.push(parseInt(message));

      // Remove first data point when we have too many
      if(dataObject.labels.length > maxReadings) {
        dataObject.labels.shift();
        dataObject.datasets[0].data.shift();
      }

      // Re-initialize chart to display new data
      liveChart = new Chart(ctx, {
        type: 'line',
        data: dataObject,
        options: optionsObject
      });

      // Create new row in visually-hidden data table
      let row = document.createElement('tr');
      row.innerHTML = `
        <td>${nextValue}</td>
        <td>${new Date()}</td>
      `;

      let tbody = document.querySelector('#live-chart-data tbody');
      let firstRow = tbody.querySelector('tr');

      // Insert new row into the data table
      if(firstRow == undefined) {
        tbody.append(row);
      } else {
        tbody.insertBefore(row, firstRow);
      }

      // Remove oldest sensor reading when maximum threshold reached
      if(tbody.children.length > maxReadings) {
        tbody.children[tbody.children.length - 1];
      }

      break;

    // Output device has sent keep-alive message
    case outputDeviceStatusTopic:
      if(!outputDeviceOnline) {
        outputDeviceOnline = true;
        displayDeviceStatus();
      }

      break;
  }
}


//==========================================
//  Device status updates
//==========================================
function displayDeviceStatus() {
  // Display input device status
  let connectedEl = inputDeviceStatusEl.querySelector('.connected');
  let notConnectedEl = inputDeviceStatusEl.querySelector('.not-connected');

  if(inputDeviceOnline) {
    connectedEl.classList.add('is-visible');
    notConnectedEl.classList.remove('is-visible');
  } else {
    connectedEl.classList.remove('is-visible');
    notConnectedEl.classList.add('is-visible');
  }

  // Display output device status
  connectedEl = outputDeviceStatusEl.querySelector('.connected');
  notConnectedEl = outputDeviceStatusEl.querySelector('.not-connected');

  if(outputDeviceOnline) {
    connectedEl.classList.add('is-visible');
    notConnectedEl.classList.remove('is-visible');
  } else {
    connectedEl.classList.remove('is-visible');
    notConnectedEl.classList.add('is-visible');
  }
}


//==========================================
//  Add a new trigger
//==========================================
let addTriggerButton = document.querySelector('#add-trigger-panel button[type="submit"]');

addTriggerButton.addEventListener('click', function(e) {
  e.preventDefault();

  if(triggers.length < 3) {
    let newTrigger = {
      // aboveOrBelow: document.querySelector('#add-trigger-panel input[name="above-below"]').value,
      // threshold: document.querySelector('#add-trigger-panel input[name="threshold-value"]').value,
    };

    // triggers.push(newTrigger);
    displayTriggers();
  }
});

function displayTriggers() {
  // let slots =
  triggers.forEach(function(index, trigger) {

  });
}


function checkDevices() {

}


//============================
//  Utilities
//============================
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}