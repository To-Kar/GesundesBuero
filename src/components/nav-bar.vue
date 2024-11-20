<template>
  <header class="app-header">
    <button class="header-button" @click="handleAlertClick">
      <img src="../assets/alert.png" alt="Alert" class="header-icon" />
    </button>
    <img src="../assets/systecs-logo.png" alt="Logo" class="header-logo" />
    <button class="header-button" @click="handleSettingsClick">
      <img src="../assets/settings.png" alt="Settings" class="header-icon" />
    </button>
  </header>
</template>

<script>
export default {
  name: 'Leiste',
  methods: {
    handleAlertClick() {
      /*alert('Lahmacun')*/
    },
    handleSettingsClick() {
      /*alert('mit scharf')*/
    }
  }
}
</script>

<style>
.app-header {
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 2px solid black;
  }
  
  .header-button {
    border: none;
    background: none;
    cursor: pointer;
    padding: 0;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 0.3s ease;
  }
  
  .header-button:hover {
    transform: scale(1.1);
    border: none;
  }

  .header-button:focus {
    outline: none;
  }
  
  .header-icon {
    width: 30px;
    height: 30px;
  }
  
  .header-logo {
    width: 100%;
    max-width: 200px;
    height: 100px;
    padding-left: 80%;
    padding-right: 80%;
  }
</style>
