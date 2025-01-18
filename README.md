# Gesundes Büro

<picture>
  <source srcset="assets/gesundes-buero-logo-white.png" media="(prefers-color-scheme: dark)">
  <img src="assets/gesundes-buero-logo.png" alt="Gesundes Büro Logo">
</picture>

<p align="center">
  <b>Die Lösung für ein gesünderes Arbeitsumfeld</b>
</p>

---

Willkommen zur Dokumentation des Projekts **Gesundes Büro**! Die folgende Inhaltsübersicht wird Sie durch die verschiedenen Abschnitte unseres Projekts führen, von einer Übersicht und den wichtigsten Funktionen bis hin zu detaillierten Anleitungen zu Nutzung, Technologie-Stack, API-Dokumentation, Datenbankschema und Bereitstellung.

## Inhaltsverzeichnis
- [Gesundes Büro](#gesundes-büro)
  - [Inhaltsverzeichnis](#inhaltsverzeichnis)
  - [Projektübersicht ](#projektübersicht-)
    - [Einleitung](#einleitung)
    - [Hauptfunktionen](#hauptfunktionen)
    - [Zweck und Anwendungsfälle](#zweck-und-anwendungsfälle)
  - [Benutzeroberfläche und Nutzung ](#benutzeroberfläche-und-nutzung-)
    - [Login](#login)
    - [Dashboard](#dashboard)
    - [Messdaten überwachen](#messdaten-überwachen)
    - [Einstellungen anpassen](#einstellungen-anpassen)
  - [Technologie-Stack ](#technologie-stack-)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Datenbank](#datenbank)
    - [Hosting](#hosting)
    - [Auth](#auth)
  - [Erste Schritte ](#erste-schritte-)
    - [Voraussetzungen](#voraussetzungen)
    - [Installation](#installation)
    - [Anwendung starten](#anwendung-starten)
  - [Additional Requirements](#additional-requirements)
  - [Umgebungsvariablen (Secrets)](#umgebungsvariablen-secrets)
    - [Raspberry Pi](#raspberry-pi)
    - [Entra ID](#entra-id)
    - [Azure Static Web App](#azure-static-web-app)
    - [Datenbank](#datenbank-1)
  - [API-Dokumentation ](#api-dokumentation-)
    - [API Übersicht](#api-übersicht)
    - [API-Endpunkte](#api-endpunkte)
    - [Schnittstellentechnologie über Swagger Aufrufen](#schnittstellentechnologie-über-swagger-aufrufen)
  - [Datenbankschema ](#datenbankschema-)
    - [ER-Diagramm](#er-diagramm)
    - [Tabellenbeschreibung](#tabellenbeschreibung)
      - [Benutzer](#benutzer)
      - [Sensordaten](#sensordaten)
  - [Bereitstellung ](#bereitstellung-)
    - [Azure Static Web Apps](#azure-static-web-apps)
    - [Azure Functions](#azure-functions)
    - [Azure SQL](#azure-sql)
    - [Bereitstellungsschritte](#bereitstellungsschritte)
  - [CI/CD Pipeline ](#cicd-pipeline-)
    - [CI/CD mit GitHub Actions](#cicd-mit-github-actions)
  - [Lizenzen ](#lizenzen-)
    - [Verwendete Lizenzen (Fremdcode)](#verwendete-lizenzen-fremdcode)
    - [Eigener Code](#eigener-code)

---

## Projektübersicht <a name="projektuebersicht"></a>

### Einleitung

**Gesundes Büro** ist eine JavaScript-basierte Anwendung. Das Frontend nutzt **Vue.js**, während das Backend mit **Node.js** und **Azure Functions** betrieben wird. Für Authentifizierung verwenden wir **Entra ID**, das Hosting erfolgt via **Azure Static Web Apps**, und die Daten liegen in **Azure SQL**.

### Hauptfunktionen

- **Raumklimadaten überwachen:** Sehen Sie Echtzeitwerte und historische Daten zu Temperatur, Luftfeuchtigkeit und CO2.
- **Warnungen und Benachrichtigungen:** Lassen Sie sich benachrichtigen, wenn Grenzwerte überschritten werden.
- **Persönliche Einstellungen:** Legen Sie Ihre bevorzugten Komfortzonen für Temperatur und Luftfeuchtigkeit fest.
- **Berichte und Analysen:** Generieren Sie Berichte zur langfristigen Überwachung und Verbesserung.

### Zweck und Anwendungsfälle

Das Projekt "Gesundes Büro" richtet sich an Unternehmen und Einzelpersonen, die ein gesünderes Arbeitsumfeld schaffen möchten. Beispiele für Anwendungsfälle:

- **Büros:** Sicherstellen, dass das Raumklima den Komfort und die Produktivität der Mitarbeiter fördert.
- **Homeoffice:** Individuelles Überwachen und Optimieren des Raumklimas.
- **Konferenzräume:** Vermeidung von schlechter Luftqualität während langer Besprechungen.

---

## Benutzeroberfläche und Nutzung <a name="benutzeroberflaeche-und-nutzung"></a>

### Login

Nach dem Öffnen der Anwendung gelangen Sie zur Login-Seite. Hier können Sie sich mit Ihrem Konto anmelden oder ein neues Konto erstellen.

### Dashboard

Das Dashboard bietet eine Übersicht über Ihre aktuellen Raumklimadaten. Diagramme und Karten zeigen Echtzeitwerte und historische Trends.

### Messdaten überwachen

Der Abschnitt "Messdaten" ermöglicht es Ihnen, Temperatur-, Luftfeuchtigkeits- und CO2-Werte zu visualisieren. Farbmarkierungen heben Bereiche hervor, die außerhalb der Komfortzone liegen.

### Einstellungen anpassen

Passen Sie Ihre Komfortzonen und Warnmeldungen an. Sie können auch Benachrichtigungen aktivieren oder deaktivieren.

---

## Technologie-Stack <a name="technologie-stack"></a>

### Frontend
- **Framework:** Vue.js

### Backend
- **Framework:** Node.js (mit Azure Functions)

### Datenbank
- **Datenbank:** Azure SQL

### Hosting
- **Hosting:** Azure Static Web Apps

### Auth
- **Auth:** Entra ID

---

## Erste Schritte <a name="erste-schritte"></a>

### Voraussetzungen
- Node.js

### Installation
1. API installieren:
   ```sh
   cd api
   npm install
   ```
2. Frontend installieren:
   ```sh
   cd ../src
   npm install
   npm run buildd
   ```

### Anwendung starten

- Die Azure Functions und das Frontend können in Azure Static Web Apps integriert werden. Für lokale Tests starten Sie die API mit:
  ```sh
  cd api
  npm start
  ```
  und das Vue-Frontend mit
  ```sh
  cd ../src
  npm run dev
  ```
  oder binden Sie die Funktionen über Azure Static Web Apps Konfiguration ein.

---

## Additional Requirements

1. Umgebungsdetails und Hosting:  
   - Projekt läuft auf Azure Static Web Apps (Frontend) und Azure Functions (Backend, Node.js)  
   - Datenbank: Azure SQL  
   - Integration von Raspberry-Pi-Sensoren über eine REST-API mit API_KEY  

2. Authentifizierungsdienst:  
   - Entra ID für Single Sign-On und Nutzerverwaltung  

3. Projektname und Branding:  
   - Projektname: "Gesundes Büro"  
   - Logos und Markenbezeichnungen entsprechend dem Firmenbranding  

4. Build-Befehle und Skripte:  
   - Backend (Azure Functions): `npm install && npm start`  
   - Frontend (Vue.js): `npm install && npm run build` (Produktion) oder `npm run dev` (Entwicklung)  

5. Benutzerdefinierte Umgebungsvariablen:  
   - Siehe Abschnitt [Umgebungsvariablen (Secrets)](#umgebungsvariablen-secrets) für DB_USER, DB_PASSWORD, VITE_API_URL usw.  

6. Deploymentprozess / CI/CD:  
   - GitHub Actions für automatisches Bauen und Bereitstellen bei jedem Push auf main  
   - Optionales Test-Deployment für Pull Requests

7. Hardware Integration:
   - Sensorskript installieren auf dem Raspberry Pi (https://github.com/kevinboehmisch/Gesundes_Buero_Raspberry_Pi/tree/main)

---

## Umgebungsvariablen (Secrets)

Bitte legen Sie folgende Secrets bzw. Umgebungsvariablen an, damit das Projekt korrekt funktioniert:

### Raspberry Pi
- API_KEY

### Entra ID
- AZURE_CLIENT_ID
- AZURE_TENANT_ID

### Azure Static Web App
- AZURE_STATIC_WEB_APPS_API_TOKEN
- VITE_API_URL
- VITE_AUTHORITY
- VITE_BASE_URL
- VITE_CLIENT_ID
- VITE_POST_LOGOUT_REDIRECT_URI
- VITE_REDIRECT_URI

### Datenbank
- DB_DATABASE
- DB_PASSWORD
- DB_SERVER
- DB_USER

---

## API-Dokumentation <a name="api-dokumentation"></a>

### API Übersicht

Die API bietet Endpunkte für Raumverwaltung, Sensordaten und Einstellungen.

### API-Endpunkte

### Schnittstellentechnologie über Swagger Aufrufen

1. **Starten der lokalen Umgebung:**
   Stellen Sie sicher, dass Sie sich im Stammverzeichnis des Projekts befinden. Führen Sie anschließend folgenden Befehl aus, um die statische Web-App und die API zu starten:
   ```sh
   swa start dist --api-location api
   ```

2. **Aufrufen der Swagger-Benutzeroberfläche (Swagger UI):**
   Sobald die Umgebung läuft, können Sie die Swagger-Dokumentation im Browser aufrufen:
   [http://localhost:7071/api/swagger-ui-assets/index.html#/](http://localhost:7071/api/swagger-ui-assets/index.html#/)

3. **Abrufen der API-Dokumentation in Swagger UI:**
   Nachdem Sie die Swagger-Benutzeroberfläche geöffnet haben, ersetzen Sie den vorgegebenen Link im Feld „Explore“ (oben auf der Seite) mit folgendem Link:
   [http://localhost:7071/api/swagger.json](http://localhost:7071/api/swagger.json)
   Dadurch wird die korrekte API-Dokumentation für Ihr Projekt geladen, und Sie können alle verfügbaren Endpunkte sowie deren Details einsehen.

---

## Datenbankschema <a name="datenbankschema"></a>

### ER-Diagramm

![ER-Diagramm](assets/gesundes-buero-er-diagramm.png)

### Tabellenbeschreibung

#### Benutzer
- **id:** Eindeutige Benutzer-ID
- **name:** Benutzername

#### Sensordaten
- **id:** Eindeutige ID
- **temperature:** Temperaturwert
- **humidity:** Luftfeuchtigkeit
- **timestamp:** Zeitstempel

---

## Bereitstellung <a name="bereitstellung"></a>

Die Anwendung wird auf Azure bereitgestellt. Hier sind die Schritte und Details zur Bereitstellung:

### Azure Static Web Apps

Das Frontend der Anwendung wird als Azure Static Web App bereitgestellt. Dies ermöglicht eine einfache und skalierbare Bereitstellung von statischen Inhalten und Frontend-Anwendungen.

### Azure Functions

Das Backend der Anwendung wird als Azure Functions bereitgestellt. Azure Functions ermöglicht es, serverlose Anwendungen zu erstellen, die auf Ereignisse reagieren. Dies reduziert den Verwaltungsaufwand und skaliert automatisch je nach Bedarf.

### Azure SQL

Die Datenbank wird in Azure SQL gehostet. Azure SQL bietet eine verwaltete Datenbanklösung, die hohe Verfügbarkeit, Sicherheit und Skalierbarkeit gewährleistet.

### Bereitstellungsschritte

1. **Erstellen einer Azure Static Web App:**
   - Navigieren Sie im Azure-Portal zu "Static Web Apps" und erstellen Sie eine neue Instanz.
   - Verbinden Sie das GitHub-Repository und wählen Sie den Branch `main` für die Bereitstellung aus.
   - Konfigurieren Sie die Build-Einstellungen für das Vue.js-Frontend.

2. **Erstellen von Azure Functions:**
   - Navigieren Sie im Azure-Portal zu "Functions" und erstellen Sie eine neue Function App.
   - Wählen Sie Node.js als Laufzeitumgebung und konfigurieren Sie die Bereitstellung aus dem GitHub-Repository.
   - Stellen Sie sicher, dass die Umgebungsvariablen für die Datenbankverbindung und Entra ID konfiguriert sind.

3. **Einrichten von Azure SQL:**
   - Erstellen Sie eine neue Azure SQL-Datenbank im Azure-Portal.
   - Konfigurieren Sie die Firewall-Einstellungen, um den Zugriff von den Azure Functions zu ermöglichen.
   - Importieren Sie das Datenbankschema und initiale Daten.

4. **Konfigurieren der Umgebungsvariablen:**
   - Stellen Sie sicher, dass alle erforderlichen Umgebungsvariablen in den Azure Static Web Apps und Azure Functions konfiguriert sind. Siehe Abschnitt [Umgebungsvariablen (Secrets)](#umgebungsvariablen-secrets).

5. **CI/CD Pipeline:**
   - Verwenden Sie GitHub Actions, um die Anwendung bei jedem Push auf den `main` Branch automatisch zu bauen und bereitzustellen. Siehe Abschnitt [CI/CD Pipeline](#cicd-pipeline).

Durch die Nutzung von Azure-Diensten wird sichergestellt, dass die Anwendung hochverfügbar, skalierbar und sicher ist. Azure bietet zudem umfangreiche Überwachungs- und Verwaltungsfunktionen, um den Betrieb der Anwendung zu optimieren.

---

## CI/CD Pipeline <a name="cicd-pipeline"></a>

### CI/CD mit GitHub Actions

Wir verwenden GitHub Actions für Azure Static Web Apps. Dabei wird das Frontend gebaut und die Azure Functions werden bereitgestellt, inklusive Konfiguration für Entra ID und Azure SQL.

```yaml
name: Azure Static Web Apps CI/CD
on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main
jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    permissions:
       id-token: write
       contents: read
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
          lfs: false
      - name: Install OIDC Client from Core Package
        run: npm install @actions/core@1.6.0 @actions/http-client
      - name: Get Id Token
        uses: actions/github-script@v6
        id: idtoken
        with:
           script: |
               const coredemo = require('@actions/core')
               return await coredemo.getIDToken()
           result-encoding: string
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_VICTORIOUS_FIELD_0CD4C7903 }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: "./api"
          output_location: "dist"
          github_id_token: ${{ steps.idtoken.outputs.result }}
        env:
          DB_USER: ${{ secrets.DB_USER }}
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
          DB_SERVER: ${{ secrets.DB_SERVER }}
          DB_DATABASE: ${{ secrets.DB_DATABASE }}
          VITE_CLIENT_ID: ${{ secrets.VITE_CLIENT_ID }}
          VITE_AUTHORITY: ${{ secrets.VITE_AUTHORITY }}
          VITE_BASE_URL: ${{ secrets.VITE_BASE_URL }}
          VITE_REDIRECT_URI: ${{ secrets.VITE_REDIRECT_URI }}
          VITE_POST_LOGOUT_REDIRECT_URI: ${{ secrets.VITE_POST_LOGOUT_REDIRECT_URI }}
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_VICTORIOUS_FIELD_0CD4C7903 }}
          action: "close"
```

---

## Lizenzen <a name="lizenzen"></a>

### Eigener Code

Der Code dieses Projekts wird unter der MIT License veröffentlicht:

MIT License

Die in diesem Repository enthaltenen Logos und Marken sind Eigentum ihrer jeweiligen Inhaber und dürfen nicht ohne deren Genehmigung verwendet werden.

Hiermit wird unentgeltlich jeder Person, die eine Kopie der Software und der zugehörigen Dokumentationsdateien (die „Software“) erhält, die Erlaubnis erteilt, uneingeschränkt mit der Software zu handeln, einschließlich und ohne Einschränkung der Rechte zur Nutzung, zum Kopieren, Ändern, Zusammenführen, Veröffentlichen, Verteilen, Unterlizenzieren und/oder Verkaufen von Kopien der Software, und Personen, denen die Software zur Verfügung gestellt wird, dies zu erlauben, unter den folgenden Bedingungen:

Der obige Urheberrechtshinweis und dieser Erlaubnishinweis sind in allen Kopien oder wesentlichen Teilen der Software beizufügen.

DIE SOFTWARE WIRD OHNE JEDE AUSDRÜCKLICHE ODER IMPLIZIERTE GARANTIE BEREITGESTELLT, EINSCHLIESSLICH DER GARANTIEN DER MARKTGÄNGIGKEIT, DER EIGNUNG FÜR EINEN BESTIMMTEN ZWECK UND DER NICHTVERLETZUNG. IN KEINEM FALL SIND DIE AUTOREN ODER URHEBERRECHTSINHABER FÜR JEGLICHE ANSPRÜCHE, SCHÄDEN ODER SONSTIGE HAFTUNGEN VERANTWORTLICH, OB IN EINER VERTRAGSKLAGE, EINER UNERLAUBTEN HANDLUNG ODER ANDERWEITIG, DIE AUS, AUS ODER IM ZUSAMMENHANG MIT DER SOFTWARE ODER DER VERWENDUNG ODER ANDEREN GESCHÄFTEN IN DER SOFTWARE ENTSTEHEN.

---
