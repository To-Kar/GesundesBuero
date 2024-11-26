<script>
import settingsImage from '../assets/settings.png'
import alertImage from '../assets/alert.png'
import companyLogo from '../assets/company-logo.png'
export default {
  data() {
    return {
      settingsImage,
      alertImage,
      companyLogo,
      showSettings: false
    }
  },
  methods: {
    handleAlertClick() {
    },
    handleSettingsClick() {
      this.showSettings = !this.showSettings
    },
    closeOverlay(event) {
      if (event.target.classList.contains('settings-overlay')) {
        this.showSettings = false
      }
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

  <div v-if="showSettings" 
       class="settings-overlay"
       @click="closeOverlay">
    <div class="settings-content">
      <button class="logout-button">
        Logout
      </button>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400&display=swap');
* {
  font-family: 'Noto Sans', sans-serif;
}

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
  z-index: 1001;
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

.settings-overlay {
  position: fixed;
  top: 0;
  right: min(50px,3%);
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  z-index: 1000;
}

.settings-content {
  background-color: #302c2c;
  padding: 0;
  margin-top: 100px;
  margin-right: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.logout-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #ffffff;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
  padding: 15px 20px;
  border-radius: 10px; 
}

.logout-button:hover {
  background-color: #575050;
  width: 100%;
}
</style>
