#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "";
const char* password = "";
const char* mqtt_server = "test.mosquitto.org";

WiFiClient wifiClient;
PubSubClient client(wifiClient);
int value = 0;

void setup() {
  // Set up the Serial connection
  Serial.begin(115200);

  // Set up the WiFi connection
  setup_wifi();

  // Set up the MQTT connection
  client.setServer(mqtt_server, 1883);
}

void setup_wifi() {
  delay(10);

  // Announce start of program over Serial for debugging
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  // Attempt to connect to WiFi using SSID and password set earlier
  WiFi.begin(ssid, password);

  // If unsuccessful, continuing attempting to connect every 2.5s
  while (WiFi.status() != WL_CONNECTED) {
    delay(2500);
    Serial.println(WiFi.status());
  }

  // When successful, output a message and our IP address over Serial
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");

    // Attempt to connect
    if (client.connect("SensorDevice")) {
      Serial.println("connected");

    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void loop() {
  // Reconnect to MQTT broker if dropped
  if (!client.connected()) {
    reconnect();
  }

  // Let the MQTT client run it's internal loop
  client.loop();

  // Send keep-alive message so dashboard knows we're still connected
  client.publish("iothackday/dfe/sensor-device", "online");

  // Take a reading from the sensor and publish an MQTT message with its value
  int value = analogRead(32);
  client.publish("iothackday/dfe/sensor/distance", String(value).c_str());

  // Send the sensor value over Serial as well for debugging
  Serial.println(value);

  // Wait for a little bit to cut down on amount of data
  delay(100);
}
