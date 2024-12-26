#define MQ135_PIN 34  // Analog-Pin des MQ-135 (A0 an GPIO34)

// Kalibrierungswerte
float zeroPoint = 0.6;  // Spannung bei 400 ppm (frische Luft)
float slope = -0.35;    // Kalibrierungskurve für den MQ-135

void setup() {
  Serial.begin(115200);  // Serielle Kommunikation starten
  delay(1000);
  Serial.println("MQ-135 CO2-Sensor gestartet...");
}

void loop() {
  int sensorValue = analogRead(MQ135_PIN);  // ADC-Wert vom MQ-135 lesen
  float sensorVoltage = sensorValue * (3.3 / 4095.0);  // ADC (12-Bit) auf Spannung skalieren
  float ppm = getPPM(sensorVoltage);  // PPM-Wert berechnen
  
  // CO2-Wert ausgeben
  Serial.print("CO2 Konzentration: ");
  Serial.print(ppm);
  Serial.println(" ppm");
  
  // CO2-Wert ausgeben
  Serial.print("RAW CO2 Konzentration RAW: ");
  Serial.print(sensorValue);
  Serial.println(" ppm");
  delay(1000);  // 1 Sekunde warten, dann neu messen
}

// Funktion zur Berechnung der CO2-Konzentration
float getPPM(float sensorVoltage) {
  return pow(10, ((sensorVoltage - zeroPoint) / slope) + 2);
}
