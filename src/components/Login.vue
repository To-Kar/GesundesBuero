<script>
import companyLogo from '../assets/systecs-logo.png' // Importiert das Logo-Bild
import companyVideo from '../assets/companyVideo.mp4' // Importiert das Video
import { msalInstance, loginRequest } from '../authConfig';


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
    async checkAuthentication() {
      try {
        // Bearbeitet Redirects und prüft Authentifizierung
        await msalInstance.handleRedirectPromise();

        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          // Leitet direkt zur Room-Seite weiter, wenn eingeloggt
          this.$router.push('/room');
        }
      } catch (error) {
        console.error('Error during authentication:', error);
      }
    },
    async startLogin() {
      try {
        this.isLoading = true; // Setzt Ladezustand
        sessionStorage.setItem('loginRedirect', '/room'); // Speichert Redirect-Path
        await msalInstance.loginRedirect(loginRequest); // Startet Login-Redirect
      } catch (error) {
        console.error('Error during login:', error);
      } finally {
        this.isLoading = false;
      }
    },
  },
  mounted() {
    // Prüft Authentifizierung beim Laden der Komponente
    this.checkAuthentication();
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
          @click="startLogin"
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
  position: fixed; 
  top: 0; 
  top: 0; 
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6); 
  z-index: 0; 
  pointer-events: none; 
  transition: 0.7s; 
}


/* Video als Hintergrund */
.background-video {
  position: fixed; 
  top: 0;
  left: 0;
  width: 100%; 
  height: 100%; 
  object-fit: cover;
  z-index: 0; 
}

/* Overlay-Inhalt */
.overlay-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%; 
  display: flex;
  flex-direction: column;
  justify-content: center; 
  align-items: center;
}

/* Header */
.app-header {
  text-align: center;
  box-shadow: 0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05);
  background-color: rgba(255, 255, 255, 0.55);
  border-radius: 45px;
  height: auto; 
  min-height: 350px; 
  max-height: 350px; 
  padding: 3%;
  display: flex;
  flex-direction: column; 
  align-items: center;
  justify-content: center; 
}

.header-logo {
  padding: 0;
  width: 400px; 
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
