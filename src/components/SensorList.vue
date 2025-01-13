<template>
    <div class="sensor-list">
        <!-- Neuen Sensor hinzufügen -->
        <div class="sensor-settings-item add-sensor-item">
            <div class="raum-settings">
                <label class="sensor-title">Neuen Sensor anlegen:</label>
                <div class="sensor-field-row">
                    <p class="sensor-label">Sensor-ID: </p>
                    <input v-model="newSensor.sensor_id" class="ip-input" placeholder="Sensor ID" />
                </div>
                <div class="sensor-field-row">
                    <label class="input-label">IP-Adresse:</label>
                    <input type="text" v-model="newSensor.ip_address" class="ip-input" placeholder="IP-Adresse" />
                </div>
                <button class="save-button add-button" @click="addSensor">Hinzufügen</button>
            </div>
        </div>

        <!-- Existierende Sensoren verwalten -->
        <div v-for="sensor in sensors" :key="sensor.sensor_id" class="sensor-settings-item">
            <p class="sensor-title">
                {{ sensor.sensor_id }}
            </p>
            <p class="sensor-info">Zugeordneter Raum: {{ sensor.room_id || 'N/A' }}</p>
            <div class="sensor-field-row">
                <label class="input-label">IP-Adresse:</label>
                <input type="text" v-model="sensor.ip_address" class="ip-input" />
            </div>
            <div class="sensorspeichernlöschen">
            <button class="save-button" @click="$emit('save-ip', sensor)">Speichern</button>
            <button class="delete-button" @click="$emit('open-delete', sensor)">Löschen</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SensorList',
    props: {
        sensors: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            newSensor: {
                sensor_id: '',
                ip_address: '',
            },
        };
    },
    methods: {
        addSensor() {
            if (!this.newSensor.sensor_id || !this.newSensor.ip_address) {
                alert('Sensor ID und IP-Adresse dürfen nicht leer sein.');
                return;
            }
            this.$emit('add-sensor', this.newSensor);
            this.newSensor.sensor_id = '';
            this.newSensor.ip_address = '';
        },
    },
};
</script>

<style scoped>

.save-button add-button{
    margin-top: 20px;
}
.sensorspeichernlöschen {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

.save-button {
    align-self: center;
    padding: 8px 16px;
    font-size: 14px;
    background-color: hsl(210, 80%, 60%);
    color: white;
    border: none;
    border-radius: 30px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    flex-shrink: 0;
    margin-left: auto;
    display: flex;
}

.delete-button {
    font-size: 14px;
    background-color: #a0a0a0;
    color: #fff;
    border-radius: 35px;
    padding: 8px 16px;
}

.save-button:hover {
    background-color: hsl(210, 70%, 50%);
}

.sensor-settings-item {
    border: 1px solid #ccc;
    border-radius: 25px;
    padding: 20px;
    background-color: #f9f9f9;
    margin-bottom: 15px;
    transition: background-color 0.3s ease, border-color 0.3s ease;
}

.add-sensor-item {
    border: 2px dashed #0083bc;
    background-color: #f1f9ff;
}

.input-field {
    width: 100%;
    max-width: 200px;
    margin: 10px 0;
    padding: 8px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.settings-item,
.sensor-settings-item {
    border: 1px solid #ccc;
    border-radius: 25px;
    padding: 20px;
    background-color: #f9f9f9;
    margin-bottom: 15px;
    transition: background-color 0.3s ease, border-color 0.3s ease;
}

.sensor-field-row {
    display: flex;
    align-items: center;
    gap: 10px;
}

.input-label {
    font-size: 16px;
    font-weight: 500;
    color: black;
    margin-bottom: 8px;
    margin-right: auto;
}

.sensor-label {
    font-size: 16px;
    font-weight: 500;
    color: black;
    margin-bottom: 8px;
    margin-right: auto;
}

.ip-input {
    width: 100%;
    max-width: 150px;
    padding: 8px;
    font-size: 14px;
    height: 30px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
    margin-bottom: 6px;
}

.sensor-title {
    font-weight: bold;
    margin-bottom: 5px;
    margin-top: 2px;
}

.sensor-info {
    font-size: 14px;
    color: #555;
}

</style>