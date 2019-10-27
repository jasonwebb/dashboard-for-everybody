// Packages
let mqtt = require('mqtt')
let charts = require('chart.js');

// MQTT setup
// let client = mqtt.connect('wss://test.mosquitto.org:8081')
let client;

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
let liveChart;
var ctx = document.getElementById('live-chart');

let dataObject = {
  labels: [1, 100, 1000],
  datasets: [{
    label: 'Sensor values',
    data: [0, 100, 109134, 3222],
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
  scaleOverride: true,
  scaleSteps: 10,
  scaleStepWidth: 10,
  scaleStartValue: 0
};

liveChart = new Chart(ctx, {
  type: 'line',
  data: dataObject,
  options: optionsObject
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

    // console.log('[' + topic + '] received: "' + new TextDecoder("utf-8").decode(message) + '"');
  });
});


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
      let nextValue = new TextDecoder('utf-8').decode(message);

      // push value to chart
      dataObject.datasets[0].data.push(parseInt(nextValue));
      // console.log(dataObject.datasets[0].data);
      
      liveChart = new Chart(ctx, {
        type: 'line',
        data: dataObject,
        options: optionsObject
      });

      // pop if limit reached?

      // push value to table
      // let dataTable = document.getElementById('live-chart-data');
      // let row = document.createElement('tr');
      // row.innerHTML = `
      //   <td>${nextValue}</td>
      //   <td></td>
      // `;

      // let firstRow = dataTable.querySelector('tr');
      // firstRow.insertBefore(row);

      // console.log('[' + topic + '] received: "' + new TextDecoder("utf-8").decode(message) + '"');
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