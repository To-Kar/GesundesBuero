<script>
import settingsImage from '../assets/settings.png'
import alertImage from '../assets/alert.png'
import companyLogo from '../assets/company-logo.png'
import NotificationCenter from './NotificationCenter.vue';
import Settings from './Settings.vue';
import { notificationService } from '../services/notificationService';
import { msalInstance } from '../authConfig';

export default {
 name: 'Navbar',
 components: {
   NotificationCenter,
   Settings
 },

 data() {
   return {
     settingsImage,
     alertImage,
     companyLogo,

     openSettings: false,

     showSettings: false,

     showNotifications: false,    
     showFullNotifications: false,
     notifications: [],
     isLoading: false,
     error: null
   }
 },
 async mounted() {
   document.addEventListener('click', this.handleGlobalClick);


   await this.getNotifications();
   notificationService.startPolling((data) => {
      this.notifications = data;
    });
 },

 beforeUnmount() {
   document.removeEventListener('click', this.handleGlobalClick);

   notificationService.stopPolling((data) => {
      this.notifications = data;
    });
 },

 methods: {
  async getNotifications() {
      this.isLoading = true;
      try {
        this.notifications = await notificationService.getNotifications();
      } catch (error) {
        this.error = 'Failed to load notifications';
        console.error('Failed to fetch notifications:', error);
      } finally {
        this.isLoading = false;
      }
    },
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
  },
   showAllSettings() {
     this.openSettings = true;
     this.showNotifications = false;
     this.showSettings = false;
     document.body.style.overflow = 'hidden';
  },
   handleShowAllSettingsClose () {
     this.openSettings = false;
     document.body.style.overflow = 'auto';
   },
   logout() {
     msalInstance.logoutRedirect({
       postLogoutRedirectUri: window.location.origin
     }).then(() => {
       sessionStorage.clear();
       this.$router.push('/login');
     }).catch(error => {
       console.error('Logout failed:', error);
     });
   },
  formatDate(timestamp) {
      try {
        return new Date(timestamp).toLocaleString('de-DE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        console.error('Date formatting error:', error);
        return 'Ungültiges Datum';
      }
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
     <button class="settings-button" @click="showAllSettings">
       Einstellungen
     </button>
     <button class="settings-button" @click="logout">
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
         <h3 class="notification-location">{{ notification.room_id }}</h3>
         <p class="notification-description">{{ notification.description }}</p>
         <p class="notification-time">{{ formatDate(notification.timestamp) }}</p>
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

<Settings v-if="openSettings" @close="openSettings = false" />

</template>

<style scoped>
* {
 font-family: 'BDOGrotesk', system-ui, sans-serif;
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
 background-color: hsl(0, 0%, 100%);
 position: fixed;
 top: 90px;
 border-radius: 20px;
 right: min(50px,3%);
 display: flex;
 justify-content: flex-end;
 align-items: flex-start;
 z-index: 1001;
}

.settings-content {
 padding: 0;
 border-radius: 20px;
 box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
 min-width: 200px;
 max-width: 400px;
 overflow: hidden;
}

.settings-button {
 background: none;
 border: none;
 font-size: 18px;
 font-weight: 400;
 line-height: 25.2px;
 letter-spacing: 0.009em;
 color: hsl(210, 0%, 60%);
 border-bottom: 1px solid hsl(210, 0%, 60%);
 transition: all 0.2s ease;
 width: 100%;
 text-align: left;
 padding: 12px 24px; 
 cursor: pointer;
}

.settings-button:first-child {
 border-top-left-radius: 20px;
 border-top-right-radius: 20px;
}

.settings-button:last-child {
 border-bottom-left-radius: 20px;
 border-bottom-right-radius: 20px;
 border-bottom: none;
}

.settings-button:hover {
 background-color: hsl(210, 0%, 95%);
 color: black;
}

/* Notification Overlay Styling */
.notifications-overlay {
 background-color: hsl(210, 0%, 100%);
 position: fixed;
 top: 90px;
 border-radius: 30px;
 left: min(50px,3%); 
 max-width: 400px;
 min-width: 200px;
 z-index: 1001;
}

.notifications-content {
 padding: 0;
 border-radius: 30px;
 box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
 overflow: hidden;
}

.notification-item {
 border-bottom: 1px solid hsl(210, 0%, 90%);
 color: black;
 text-align: left;
 padding: 12px 24px;
}

.notification-item:last-child {
 border-bottom: none;
}
.notification-location{
  font-size: 18px;
  line-height: 25.2px;
  margin: 0;
  letter-spacing: 0.009em;
  padding-left: 0;
  font-weight: 700;
}
.notification-description{
  font-size: 18px;
  font-weight: 400;
  line-height: 25.2px;
  letter-spacing: 0.009em;
  margin: 0;
}
.notification-time{
  font-size: 18px;
  font-weight: 400;
  line-height: 25.2px;
  margin: 0;
  letter-spacing: 0.009em;
  color: hsl(210, 0%, 60%);
}
.show-more-button {
 background: none;
 border: none;
 font-size: 18px;
 font-weight: 500;
 line-height: 25.2px;
 letter-spacing: 0.009em;
 color: hsl(210, 80%, 60%);
 width: 100%;
 text-align: center;
 transition: all 0.2s ease;
 cursor: pointer;
 border-top: 1px solid hsl(210, 0%, 90%);
 padding: 12px;
}

.show-more-button:hover {
 background-color: hsl(210, 0%, 95%);
}
</style>