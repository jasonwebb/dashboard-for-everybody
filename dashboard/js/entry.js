// Packages
let mqtt = require('mqtt')
let charts = require('chart.js');

// MQTT setup
let client = mqtt.connect('wss://test.mosquitto.org:8081');

// Enable fake devices mode
let mockDataEnabled = true;

// MQTT topics
const inputDeviceStatusTopic = 'iothackday/dfe/input-device';
const outputDeviceStatusTopic = 'iothackday/dfe/output-device';

const inputDeviceDistanceSensorTopic = 'iothackday/dfe/input-device/distance';
const inputDeviceTemperatureSensorTopic = 'iothackday/dfe/input-device/temperature';
const inputDeviceLightSensorTopic = 'iothackday/dfe/input-device/light';

// Device status flags
let inputDeviceOnline = false;
let outputDeviceOnline = false;

// Last
let inputLastPing = Date.now();
let outputLastPing = Date.now();
let keepAliveThreshold = 1000;

// DOM elements
let inputSensorSelectedEl = document.getElementById('selected-sensor');
let inputDeviceStatusEl = document.getElementById('input-device-status');
let outputDeviceStatusEl = document.getElementById('output-device-status');

// Current sensor
let currentSensor = inputSensorSelectedEl.value;

// Triggers
let triggers = {
  distance: [],
  temperature: [],
  light: []
};

// Live chart elements and configs
const maxReadings = 100;
let liveChart;
const chartCanvasEl = document.getElementById('live-chart');

// Base data object for live chart
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

  // Sensor-specific objects that hold sensor readings even when different sensors are active
  let distanceData = {
    labels: [],
    data: []
  };

  let temperatureData = {
    labels: [],
    data: []
  };

  let lightData = {
    labels: [],
    data: []
  };

  let currentSensorData = distanceData;

// Live chart configuration
let optionsObject = {
  events: [], // disables tooltips on data points
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


//================================================
//  Wait for page to finish loading before
//  initializing handlers and live components
//================================================
window.addEventListener('DOMContentLoaded', function(e) {
  // Initialize live chart
  liveChart = new Chart(chartCanvasEl, {
    type: 'line',
    data: dataObject,
    options: optionsObject
  });

  // Add a new trigger when "Add Trigger" button is clicked
  let addTriggerButton = document.querySelector('#add-trigger-panel button[type="submit"]');
  addTriggerButton.addEventListener('click', addNewTrigger);

  // Switch data streams when sensor selection is changed
  inputSensorSelectedEl.addEventListener('change', function(e) {
    currentSensor = e.target.value;

    switch(currentSensor) {
      case 'distance':
        currentSensorData = distanceData;
        resetDataTable();
        break;

      case 'temperature':
        currentSensorData = temperatureData;
        resetDataTable();
        break;

      case 'light':
        currentSensorData = lightData;
        resetDataTable();
        break;
    }

    displayTriggers();
  });

  // Toggle mock data using 'Space'
  document.body.addEventListener('keydown', function(e) {
    if(e.key === ' ') {
      e.preventDefault();
      mockDataEnabled = !mockDataEnabled;
    }
  });

  displayTriggers();
});


//================================================================
//  Remove all rows from hidden data table for chart, and add
//  all previous sensor readings for the current sensor.
//  Called when user selects a new sensor from dropdown.
//================================================================
function resetDataTable() {
  let tbody = document.querySelector('#sensor-data tbody');
  let oldRows = tbody.querySelectorAll('tr');

  // Remove all the old readings from previous sensor
  oldRows.forEach((row) => {
    row.remove();
  });

  // Add all the previous sensor readings from the current sensor
  for(let i = currentSensorData.data.length - 1; i >= 0; i--) {
    let row = document.createElement('tr');
    row.innerHTML = `
      <td>${currentSensorData.data[i]}</td>
      <td>${currentSensorData.labels[i]}</td>
    `;
    tbody.appendChild(row);
  }
}


//====================================================
//  Periodically check that devices are connected
//====================================================
setInterval(checkDevices, 3000);

// Artificially set input and output device statuses to "online" within 5s of page load
if(mockDataEnabled) {
  setTimeout(() => {
    inputDeviceOnline = true;
    displayDeviceStatus();
  }, getRandomInt(1000,5000));

  setTimeout(() => {
    outputDeviceOnline = true;
    displayDeviceStatus();
  }, getRandomInt(1000,5000));
}


//==========================
//  Mock data creation
//==========================
if(mockDataEnabled) {
  setInterval(createMockInputData, 100);
  setInterval(createMockKeepAliveMessages, 500);
}

// Generate random data for the active sensor, if the input device is online
function createMockInputData() {
  if(inputDeviceOnline && mockDataEnabled) {
    // Send random data on appropriate MQTT topics
    switch(currentSensor) {
      case 'distance':
        processMessages(inputDeviceDistanceSensorTopic, getRandomInt(0,4096));
        break;

      case 'temperature':
        processMessages(inputDeviceTemperatureSensorTopic, getRandomInt(0,4096));
        break;

      case 'light':
        processMessages(inputDeviceLightSensorTopic, getRandomInt(0,4096));
        break;
    }
  }
}

// Generate fake "keep alive" messages as though devices were online
function createMockKeepAliveMessages() {
  if(mockDataEnabled) {
    processMessages(inputDeviceStatusTopic, 'online');
    processMessages(outputDeviceStatusTopic, 'online');
  }
}


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
    client.subscribe(inputDeviceDistanceSensorTopic);

    // Process messages when they arrive through any of the subscribed topics
    client.on('message', (topic, message) => {
      processMessages(topic, message);
    });
  });
}

// Act on messages from devices or mock data events
function processMessages(topic, message) {
  switch(topic) {
    // Input device has sent keep-alive message
    case inputDeviceStatusTopic:
      if(!inputDeviceOnline) {
        inputDeviceOnline = true;
        displayDeviceStatus();
      }

      break;

    // Sensor device has sent sensor data
    case inputDeviceDistanceSensorTopic:
    case inputDeviceTemperatureSensorTopic:
    case inputDeviceLightSensorTopic:
      let nextValue = message;

      // Real MQTT messages are UTF-8 encoded, so we need to decode them
      if(!mockDataEnabled) {
        let nextValue = new TextDecoder('utf-8').decode(nextValue);
      }

      // Push next value to appropriate sensor data object
      currentSensorData.labels.push(Date.now());
      currentSensorData.data.push(parseInt(message));

      // Remove first data point when we have too many
      if(currentSensorData.labels.length > maxReadings) {
        currentSensorData.labels.shift();
        currentSensorData.data.shift();
      }

      // Inject current sensor data into chart data object
      dataObject.labels = currentSensorData.labels;
      dataObject.datasets[0].data = currentSensorData.data;

      // Re-initialize chart to display new data
      liveChart = new Chart(chartCanvasEl, {
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

      let tbody = document.querySelector('#sensor-data tbody');
      let firstRow = tbody.querySelector('tr');

      // Insert new row into the data table
      if(firstRow == undefined) {
        tbody.append(row);
      } else {
        tbody.insertBefore(row, firstRow);
      }

      // Remove oldest sensor reading when maximum threshold reached
      if(tbody.children.length > maxReadings) {
        tbody.children[tbody.children.length - 1].remove();
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


//===============
//  Triggers
//===============
// Creates a new trigger for the current sensor when the "Add Trigger" button is clicked
function addNewTrigger(e) {
  e.preventDefault();

  let currentTriggers;

  switch(currentSensor) {
    case 'distance':
      currentTriggers = triggers.distance;
      break;

    case 'temperature':
      currentTriggers = triggers.temperature;
      break;

    case 'light':
      currentTriggers = triggers.light;
      break;
  }

  if(currentTriggers.length < 3) {
    let aboveOrBelowEl = document.querySelector('#add-trigger-panel input[name="above-below"]:checked');
    let thresholdEl = document.querySelector('#add-trigger-panel input[name="threshold-value"]');
    let motorActionEl = document.querySelector('#add-trigger-panel input[name="motor-action"]:checked');

    // For demo purposes, forget about form validation and just make sure the values aren't null
    let aboveOrBelow = aboveOrBelowEl != undefined ? aboveOrBelowEl.value : 'above';
    let threshold = thresholdEl.value != '' ? parseInt(thresholdEl.value) : 500;
    let motorAction = motorActionEl != undefined ? motorActionEl.value : 'pulse-once';

    // Create a new trigger for this sensor from the form data
    let newTriggerEl = document.createElement('div');
    newTriggerEl.classList = 'panel trigger is-blue';

    newTriggerEl.innerHTML = `
      <h2>
        ${currentSensor.charAt(0).toUpperCase() + currentSensor.slice(1)} Trigger #${currentTriggers.length + 1}
      </h2>

      <button class="remove-icon-button remove-button">
        <span class="icon fas fa-times" aria-hidden="true"></span>
        <span class="visually-hidden">Remove trigger</span>
      </button>

      <div class="name">
        <span class="visually-hidden">The </span>
        Motor
      </div>

      <div class="action">
        Will
        <span class="is-highlighted">${motorAction.replace(/-/g, ' ')}</span>
        when the
        <span class="is-highlighted">${currentSensor}</span>
        sensor goes
        <span class="is-highlighted">${aboveOrBelow}</span>
        <span class="is-highlighted">${threshold}</span>
      </div>

      <button class="remove-button button is-danger">Remove this trigger</button>
    `;

    currentTriggers.push(newTriggerEl);
    displayTriggers();
  }
}

function removeTrigger(trigger) {
  let currentTriggers;

  switch(currentSensor) {
    case 'distance':
      currentTriggers = triggers.distance;
      break;

    case 'temperature':
      currentTriggers = triggers.temperature;
      break;

    case 'light':
      currentTriggers = triggers.light;
      break;
  }

  // console.log(trigger);

  currentTriggers = currentTriggers.splice(currentTriggers.indexOf(trigger), 1);
  displayTriggers();
}

// Display all triggers that have been set
function displayTriggers() {
  let currentTriggers;

  switch(currentSensor) {
    case 'distance':
      currentTriggers = triggers.distance;
      break;

    case 'temperature':
      currentTriggers = triggers.temperature;
      break;

    case 'light':
      currentTriggers = triggers.light;
      break;
  }

  let columns = document.querySelectorAll('.trigger-panels .column:not(:first-of-type)');

  // Display all the current triggers for this sensor
  currentTriggers.forEach(function(trigger, index) {
    columns[index].innerHTML = '';
    columns[index].appendChild(trigger);
    trigger.focus();

    let removeButtons = trigger.querySelectorAll('.remove-button');
    removeButtons.forEach((removeButton) => {
      if(removeButton.getAttribute('data-has-click-handler')) {
        removeButton.removeEventListener('click', removeButtonClickHandler);
        removeButton.removeAttribute('data-has-click-handler');
      }

      removeButton.addEventListener('click', removeButtonClickHandler);
      removeButton.setAttribute('data-has-click-handler', true);
    });
  });

  // Add placeholders for remaining panels if there aren't enough triggers
  if(currentTriggers.length < 3) {
    for(let i = 0; i < 3 - currentTriggers.length; i++) {
      columns[currentTriggers.length + i].innerHTML = `
        <div class="panel-placeholder">
          No trigger defined
        </div>
      `;
    }
  }
}

// Click handler function for remove buttons on each trigger card
function removeButtonClickHandler(e) {
  removeTrigger(e.target.closest('.trigger'));
}


//=========================
//  Device status check
//=========================
// Automatically set device statuses to "offline" if no keep alive
// has been received in a while
function checkDevices() {
  let currentTime = Date.now();

  // Check if input device has gone offline
  if(currentTime - inputLastPing > keepAliveThreshold) {
    inputDeviceOnline = false;
  }

  // Check if output device has gone offline
  if(currentTime - outputLastPing > keepAliveThreshold) {
    outputDeviceOnline = false;
  }
}


//==================
//  Utilities
//==================
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}