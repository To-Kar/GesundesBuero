<template>
  <div id="app">
    <!-- Video als Hintergrund -->
    <video autoplay muted loop class="background-video">
      <source src="../assets/Unbenanntes Video – Mit Clipchamp erstellt.mp4" type="video/mp4" />
      Ihr Browser unterstützt keine Videos.
    </video>
    <div :class="{ 'dark-overlay': isHovered }"></div>
    
    <!-- Inhalt auf dem Video -->
    <div class="overlay-content">
      <!-- Logo -->
      <header class="app-header">
        <img src="../assets/systecs-logo.png" alt="Logo" class="header-logo" />
        <!-- Slogan -->
        <p class="slogan">Ihr gesundes Büro</p>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Hurricane&family=Lobster&display=swap" rel="stylesheet">
      </header>

      <!-- Login-Button -->
      <div class="login-container">
        <button
          class="login-button"
          @mouseover="isHovered = true"
          @mouseleave="isHovered = false"
          @click="redirectToAzureSSO"
        >
          Anmelden
        </button>
        <!-- Nachricht bei Hover -->
        <p class="hover-message" :class="{ visible: isHovered }">
          Sie werden nun zum Microsoft Anmeldedienst weitergeleitet
        </p>
      </div>
    </div>
  </div>
</template>
  
<script>
export default {
  name: "Login",
  data() {
    return {
      isHovered: false, // Überwacht den Hover-Zustand
    };
  },
  methods: {
    redirectToAzureSSO() {
      // Leitet zur Azure SSO-Seite weiter
      window.location.href = "https://orange-sky-0967a5b03.5.azurestaticapps.net/";
    },
  },
};
</script>


<style>

body {
  overflow: hidden; /* Deaktiviert Scrollen */
}

.dark-overlay {
  position: fixed; /* Deckt den gesamten Viewport ab */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6); /* Dunkler transparenter Hintergrund */
  z-index: 0; /* Über dem Video, aber unter dem Inhalt */
  pointer-events: none; /* Blockiert keine Interaktionen mit anderen Elementen */
  transition: 0.7s; /* Sanftes Einblenden */
}


/* Video als Hintergrund */
.background-video {
  position: fixed; /* Fixiert das Video im Hintergrund */
  top: 0;
  left: 0;
  width: 100%; /* Füllt die gesamte Breite */
  height: 100%; /* Füllt die gesamte Höhe */
  object-fit: cover; /* Schneidet das Video passend zu den Bildschirmmaßen */
  z-index: 0; /* Stellt sicher, dass das Video hinter allem anderen liegt */
}

/* Overlay-Inhalt */
.overlay-content {
  position: absolute; /* Positioniert den Inhalt relativ zum Viewport */
  top: 0;
  left: 0;
  width: 100%; /* Füllt die gesamte Breite */
  height: 100%; /* Füllt die gesamte Höhe */
  display: flex;
  flex-direction: column;
  justify-content: center; /* Zentriert den Inhalt vertikal */
  align-items: center;
}

/* Header */
.app-header {
  margin-bottom: 20px; /* Abstand zwischen Logo und Slogan */
  text-align: center;
}

.header-logo {
  width: 400px; /* Größe des Logos */
  height: auto;
  background-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0px 0px 8px 4px #0083bc;
}

/* Slogan */
.slogan {
  font-family: "Hurricane", cursive;
  font-weight: 400;
  font-style: normal;
  font-size: 40px; /* Schriftgröße des Slogans */
  color: white; /* Weiße Schrift */
  margin-top: 10px;
}

/* Login-Button */
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative; /* Verhindert Verschiebungen */
}

.login-button {
  padding: 15px 30px;
  font-size: 18px;
  background-color: #0083bc; /* Systecs-Blau */
  color: #002b56;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.5s ease;
}

.login-button:hover {
  background-color: #005a9e; /* Dunkleres Blau beim Hover */
}

.login-button:focus {
  outline: none;
  box-shadow: 0px 0px 4px 2px rgba(0, 120, 212, 0.5);
}

/* Nachricht bei Hover */
.hover-message {
  left: 0;
  right: 0;
  font-size: 16px;
  color: white;
  opacity: 0; /* Unsichtbar, wenn nicht im Hover-Zustand */
  text-align: center;
  transition: 0.3s ; /* Sanftes Einblenden */
  margin-top: 20px;
}

.hover-message.visible {
  opacity: 1; /* Sichtbar im Hover-Zustand */
}


</style>
