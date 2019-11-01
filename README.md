Check out the [documentation page for this project](https://jasonwebb.github.io/dashboard-for-everybody/)!

---

[![Screenshot of dashboard](media/dashboard-full-screenshot.png)](https://jasonwebb.github.io/dashboard-for-everybody/)

---

**A Dashboard for Everybody** is a small, speculative demo project that shows how real-time dashboards, like those used for IoT systems, can be enhanced using accessible design and development practices.

It is intended to be an educational resource providing accessible solutions for common UI/UX challenges found in dashboards, like dealing with charts, working with asynchronous data, and handling dynamic content.

It was (mostly) built as part of [IoT HackDay 2019](https://www.meetup.com/iotfuse/events/264780943/) in St. Paul, MN by [Jason Webb](https://www.linkedin.com/in/zenwebb/) and [John Haus](https://www.linkedin.com/in/johnhaus/).


## Accessibility features

* **Fully operable** via keyboard
* **Chart data** is available to people using screen readers through visually-hidden tables.
* Important asynchronous information (like the availability of input and output devices) is **announced through live regions**
* All focusable and interactive elements have strong, consistent **focus indicators**
* Meets [WCAG 2.0 (Level AA)](https://www.w3.org/TR/WCAG20/) requirements
* Works great on **mobile devices and tablets**, which are very popular among people with motor and visual conditions


## Technical details

* Vanilla ES6 JavaScript for interactivity, logic, and DOM manipulation
* [Chart.js](https://www.chartjs.org/) for live sensor data charts
* [MQTT.js](https://github.com/mqttjs/MQTT.js) for communication with IoT-enabled input and output devices
* Semantic HTML5
* Light usage of [ARIA](https://www.w3.org/TR/wai-aria-1.1/) based on [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/) and insight from real users
* [Gulp](https://gulpjs.com/)-based build system
* [Sass](https://sass-lang.com/) for styling, organized using the [7-1 pattern](https://sass-guidelin.es/#the-7-1-pattern)


## Local setup and running

See the [README](https://github.com/jasonwebb/dashboard-for-everybody/blob/master/dashboard/README.md) under the `./dashboard` folder for details.


## Sample devices - IoT-enabled sensor platform and motor controller
For demo purposes during the IoT HackDay event we put together two real IoT-enabled devices to feed data to and receive data from the dashboard.

### Input device (sensors)

1. Uses [Adafruit Huzzah32 board](https://learn.adafruit.com/adafruit-huzzah32-esp32-feather)
2. Reads sensor data using Arduino sketch in `sensor-buddy/`
3. Transmits sensor data over MQTT publish messages

### Output device (motor controller)

1. Uses [Adafruit Huzzah32 board](https://learn.adafruit.com/adafruit-huzzah32-esp32-feather)
2. Receives requests for motor movement via MQTT subscribe messages
3. Controls motors by generating PWM signal based on MQTT messages

## Demo

[![Live demo of Dashboard for Everybody](http://img.youtube.com/vi/i7LSeKJyNso/0.jpg)](https://www.youtube.com/watch?v=i7LSeKJyNso "Live demo of Dashboard for Everybody")
