
```
TODO:
- introduction
- purpose and motivation
- connection to IoT HackDay event
```

## Dashboard

```
TODO: overview
* accessibility feature #1
* ...
```

### Setup

1. Run `npm install` in `./dashboard` to get all packages
2. Run `gulp` to kick off build process and live dev server

### Packages and technologies used

* Vanilla ES6 JavaScript for all UI logic and interactions (see `./dashboard/js`)
* Sass for styling (see `./dashboard/sass`)
* Chart.js for the live sensor data chart
* MQTT.js for communications with IoT devices
* Gulp for the build system

---

## Sensor platform

1. Uses [Adafruit Huzzah32 board](https://learn.adafruit.com/adafruit-huzzah32-esp32-feather)
2. Reads sensor data using Arduino sketch in `sensor-buddy/`
3. Transmits sensor data over MQTT publish messages

---

## Motor platform

1. Uses [Adafruit Huzzah32 board](https://learn.adafruit.com/adafruit-huzzah32-esp32-feather)
2. Receives requests for motor movement via MQTT subscribe messages
3. Controls motors by generating PWM signal based on MQTT messages