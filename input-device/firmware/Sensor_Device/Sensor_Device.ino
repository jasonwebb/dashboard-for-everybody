#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>

const char* ssid = "";
const char* password = "";
const char* mqtt_server = "test.mosquitto.org";

WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg = 0;
char msg[50];
int value = 0;

// LED Pin
const int ledPin = 13;

void setup() {
  Serial.begin(115200);
  // (you can also pass in a Wire library object like &Wire2)
  //status = bme.begin();

  setup_wifi();
  client.setServer(mqtt_server, 1883);

  pinMode(ledPin, OUTPUT);
  pinMode(12, OUTPUT);
  analogReadResolution(12);
  analogSetPinAttenuation(A2, ADC_11db);
  client.setCallback(callback);
}

void setup_wifi() {
  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(2500);
    Serial.println(WiFi.status());
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i=0;i<length;i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
  digitalWrite(12, HIGH);
  digitalWrite(13, HIGH);
  delay(500);
  digitalWrite(12, LOW);
  digitalWrite(13, LOW);
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("ESP32Client2-")) {
      Serial.println("connected");
      delay(5000);
      // Subscribe
      client.subscribe("iothackday/dfe/output-device/motor");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  client.publish("iothackday/dfe/output-device", "on");
  delay(1000);
}
