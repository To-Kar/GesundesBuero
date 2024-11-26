<script>
import settingsImage from '../assets/settings.png'
import alertImage from '../assets/alert.png'
import companyLogo from '../assets/company-logo.png'

export default {
  data() {
    return {
      settingsImage,
      alertImage,
      companyLogo
    }
  },
  methods: {
    handleAlertClick() {
    },
    handleSettingsClick() {
    }
  }
}
</script>

<template>
  <nav class="app-header">
    <div class="nav-section">
      <button class="header-button" @click="handleAlertClick">
        <img :src="alertImage" class="header-icon" />
      </button>
    </div>
    
    <img :src="companyLogo" class="header-logo" />
    
    <div class="nav-section">
      <button class="header-button" @click="handleSettingsClick">
        <img :src="settingsImage" class="header-icon" />
      </button>
    </div>
  </nav>
</template>

<style>
.app-header {
  position: fixed;
  top: 0;
  left: 0;        
  right: 0; 
  width: 100%;
  height: 100px;
  min-width: 300px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #9292927c;
}

.header-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: transform 0.1s ease;
}

.header-button:hover {
  transform: scale(1.1);
}

.header-icon {
  width: min(40px, 8vw);
  height: min(40px, 8vw);
}

.header-logo {
  height: min(50px, 5vw);    
  width: auto;       
}

.nav-section {
  width: 100px;
  display: flex;
  align-items: center;
  padding: 0 min(50px, 3%);
}
.nav-section:first-child {
  justify-content: flex-start;
}
.nav-section:last-child {
  justify-content: flex-end;
}
</style>
