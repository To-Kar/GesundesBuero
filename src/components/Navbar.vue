<script>
import settingsImage from '../assets/settings.png'
import alertImage from '../assets/alert.png'
import companyLogo from '../assets/company-logo.png'
import NotificationCenter from './NotificationCenter.vue';

export default {
 name: 'Navbar',
 components: {
   NotificationCenter
 },

 data() {
   return {
     settingsImage,
     alertImage,
     companyLogo,

     showSettings: false,

     showNotifications: false,    
     showFullNotifications: false,
     notifications: [
     
     ]
   }
 },

 mounted() {
   document.addEventListener('click', this.handleGlobalClick);
 },

 beforeUnmount() {
   document.removeEventListener('click', this.handleGlobalClick);
 },

 methods: {
   handleGlobalClick(event) {
     const isClickInsideNotifications = event.target.closest('.notifications-content');
     const isClickInsideSettings = event.target.closest('.settings-content');
     const isClickOnHeaderButton = event.target.closest('.header-button');
   
     if (!isClickInsideNotifications && !isClickInsideSettings && !isClickOnHeaderButton) {
       this.showSettings = false;
       this.showNotifications = false;
     }
   },
   handleAlertClick() {
     this.showNotifications = !this.showNotifications;
     if (this.showSettings) this.showSettings = false;
   },
   handleSettingsClick() {
     this.showSettings = !this.showSettings
     if (this.showNotifications) this.showNotifications = false;
   },
   showAllNotifications() {
     this.showFullNotifications = true;
     this.showNotifications = false;
     document.body.style.overflow = 'hidden';
   },
   handleNotificationCenterClose() {
    this.showFullNotifications = false;
    document.body.style.overflow = 'auto';
  }
 },
 computed: {
   recentNotifications() {
     return this.notifications.slice(0, 5);
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

 <div v-if="showSettings" class="settings-overlay">
   <div class="settings-content">
     <button class="settings-button">
       Alle Einstellungen
     </button>
     <button class="settings-button">
       Abmelden
     </button>
   </div>
 </div>

 <div v-if="showNotifications" class="notifications-overlay">
   <div class="notifications-content">
     <div class="notifications-list">
       <div v-for="notification in recentNotifications" 
            :key="notification.id" 
            class="notification-item">
         <p>{{ notification.message }}</p>
         <small>{{ new Date(notification.timestamp).toLocaleString() }}</small>
       </div>
     </div>
     <button class="show-more-button" @click="showAllNotifications">
       Alle Mitteilungen anzeigen
     </button>
   </div>
 </div>

 <NotificationCenter 
   v-if="showFullNotifications"
   :notifications="notifications"
   @close="handleNotificationCenterClose"
 />
</template>

<style scoped>
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
 background-color: white;
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

/* Settings Styling */
.settings-overlay {
 background-color: hsl(210, 0%, 100%);
 position: fixed;
 top: 90px;
 border-radius: 10px;
 right: min(50px,3%);
 display: flex;
 justify-content: flex-end;
 align-items: flex-start;
 z-index: 1001;
}

.settings-content {
 padding: 0;
 border-radius: 10px;
 box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
 min-width: 200px;
 overflow: hidden;
}

.settings-button {
 background: none;
 border: none;
 font-size: 16px;
 color: hsl(210, 0%, 60%);
 border-bottom: 1px solid hsl(210, 0%, 60%);
 transition: all 0.2s ease;
 width: 100%;
 text-align: left;
 padding: 15px 20px; 
 cursor: pointer;
}

.settings-button:first-child {
 border-top-left-radius: 10px;
 border-top-right-radius: 10px;
}

.settings-button:last-child {
 border-bottom-left-radius: 10px;
 border-bottom-right-radius: 10px;
 border-bottom: none;
}

.settings-button:hover {
 background-color: hsl(210, 0%, 95%);
 color: black;
}

/* Notification Center Styling */
.notifications-overlay {
 background-color: hsl(210, 0%, 100%);
 position: fixed;
 top: 90px;
 border-radius: 10px;
 left: min(50px,3%); 
 display: flex;
 justify-content: flex-start;
 align-items: flex-start;
 z-index: 1001;
}

.notifications-content {
 padding: 0;
 border-radius: 10px;
 box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
 min-width: 200px;
 overflow: hidden;
}

.notification-item {
 padding: 15px 20px;
 border-bottom: 1px solid hsl(210, 0%, 90%);
 color: black;
}

.notification-item:last-child {
 border-bottom: none;
}

.show-more-button {
 background: none;
 border: none;
 font-size: 16px;
 font-weight: 600;
 color: hsl(210, 80%, 60%);
 width: 100%;
 padding: 15px 20px;
 text-align: left;
 transition: all 0.2s ease;
 cursor: pointer;
 border-top: 1px solid hsl(210, 0%, 90%);
}

.show-more-button:hover {
 background-color: hsl(210, 0%, 95%);
}
</style>