<template>
  <header class="app-header">
    <button class="header-button" @click="handleAlertClick">
      <img src="../../assets/alert.png" alt="Alert" class="header-icon" />
    </button>
    <img src="../../assets/systecs-logo.png" alt="Logo" class="header-logo" />
    <button class="header-button" @click="handleSettingsClick">
      <img src="../../assets/settings.png" alt="Settings" class="header-icon" />
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

<style src="./leiste.css"></style>
