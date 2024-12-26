<script>
import companyLogo from '../assets/systecs-logo.png' // Importiert das Logo-Bild
import companyVideo from '../assets/companyVideo.mp4' // Importiert das Video

export default {
  name: "Login",
  data() {
    return {
      isHovered: false, // Überwacht den Hover-Zustand
      companyLogo,
      companyVideo
    };
  },
  methods: {
    redirectToAzureSSO() {
      // Leitet zu einer anderen Route innerhalb der Anwendung weiter
      this.$router.push("/room");
    },
  },
};
</script>

<template>
  <div id="app">
    <!-- Video als Hintergrund -->
    <video autoplay muted loop class="background-video">
      <source :src="companyVideo" type="video/mp4" />
      Ihr Browser unterstützt keine Videos.
    </video>
    <div :class="{ 'dark-overlay': isHovered }"></div>
    
    <!-- Inhalt auf dem Video -->
    <div class="overlay-content">
      <!-- Logo -->
      <header class="app-header">
        <img :src="companyLogo" class="header-logo" />
        <!-- Slogan -->
        <p class="slogan">Ihr gesundes Büro</p>
        <link rel="stylesheet" href="https://use.typekit.net/fea8sbd.css">
        
        <!-- Login-Button -->
          <button
          class="login-button"
          @mouseover="isHovered = true"
          @mouseleave="isHovered = false"
          @click="redirectToAzureSSO"
          >
          Anmelden
        </button>
    </header>
    </div>
  </div>
</template>
  
<style scoped>

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
  /*margin-bottom: 10px; /* Abstand zwischen Logo und Slogan */
  text-align: center;
  box-shadow: 0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05);
  background-color: rgba(255, 255, 255, 0.55);
  border-radius: 45px;
  height: auto; /* Lässt die Höhe flexibel bleiben */
  min-height: 350px; /* Mindesthöhe, die immer beibehalten wird */
  max-height: 350px; /* Maximale Höhe, die immer beibehalten wird */
  padding: 3%;
  display: flex;
  flex-direction: column; /* Richtet die Inhalte untereinander aus */
  align-items: center; /* Zentriert die Inhalte horizontal */
  justify-content: center; /* Zentriert die Inhalte vertikal */
}

.header-logo {
  padding: 0;
  width: 400px; /* Größe des Logos */
  height: auto;
}

/* Slogan */
.slogan {
  font-family: "bruno-ace", sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 30px; /* Schriftgröße des Slogans */
  color: #000000; /* Weiße Schrift */
  margin-top: 5px;
  margin-bottom: 20px;
}

/* Login-Button */
.login-button {
  box-shadow: 0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05);
  height: 70px;
  width: 190px;
  border: none;
  padding: 15px 30px;
  font-size: 24px;
  background-color: #0083bc; /* Systecs-Blau */
  color: #ffffff;
  border-radius: 45px;
  cursor: pointer;
  transition: background-color 0.5s ease;
}

.login-button:hover {
  background-color: #002b56; /* Dunkleres Systecs */
}


</style>
