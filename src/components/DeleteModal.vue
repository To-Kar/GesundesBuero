<template>
    <div v-if="visible" class="modal-overlay">
      <div class="overlay" @click="cancel"></div>
      <div class="modal">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="modal-actions">
          <button class="delete-confirm-button" @click="confirm">Löschen</button>
          <button class="cancel-button" @click="cancel">Abbrechen</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      visible: Boolean,
      title: {
        type: String,
        default: "Löschen bestätigen",
      },
      message: {
        type: String,
        default: "Möchten Sie dieses Element wirklich löschen?",
      },
    },
    emits: ["confirm", "cancel"],
    methods: {
      confirm() {
        this.$emit("confirm");
      },
      cancel() {
        this.$emit("cancel");
      },
    },
  };
  </script>
  
  <style scoped>
/* Delete Styles*/
/* Modal-Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px); 
  z-index: 1590;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* Modal-Fenster */
.modal {
  background: #fff;
  border-radius: 35px;
  padding: 10px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;
  text-align: center;
  z-index: 1600;
}
/* Modal-Aktionen */
.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
/* Buttons */
.delete-confirm-button {
  background-color: #dc3545;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 35px;
  cursor: pointer;
}
.delete-confirm-button:hover {
  background-color: #c82333;
}
/* Löschen-Button (außerhalb des Modals) */
.delete-button {
  margin-left: 0px;
  margin-top: 15px;
  background-color: #dc3545;
  color: #fff;
  padding: 10px 20px;
  /* Innenabstand */
  border-radius: 35px;
  cursor: pointer;
  
}
.cancel-button {
  background-color: #a0a0a0;
  color: #fff;
  border-radius: 35px;
  padding: 8px 16px;

}
/*Raum bearbeiten Styles */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
  </style>
  