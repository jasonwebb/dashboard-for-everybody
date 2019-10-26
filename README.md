
## Dashboard

1. Web app that displays sensor data graphs and allows users to set up trigger events
2. Subscribes to sensor data streams over MQTT transmitted by the sensor platform
3. Publishes motor control messages over MQTT based on trigger events driven by sensor data

## Sensor platform

1. Uses [Adafruit Huzzah32 board](https://learn.adafruit.com/adafruit-huzzah32-esp32-feather)
2. Reads sensor data using Arduino sketch in `sensor-buddy/`
3. Transmits sensor data over MQTT publish messages

## Motor platform

1. Uses [Adafruit Huzzah32 board](https://learn.adafruit.com/adafruit-huzzah32-esp32-feather)
2. Receives requests for motor movement via MQTT subscribe messages
3. Controls motors by generating PWM signal based on MQTT messages