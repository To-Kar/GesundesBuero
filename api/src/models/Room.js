
class Room {
    constructor(room_id, sensor_id, name, imageURL, target_temp, target_humidity) {
      if (!room_id) throw new Error('room_id ist erforderlich');
      this.room_id = room_id;
      this.sensor_id = sensor_id || null;
      this.name = name;
      this.imageURL = imageURL;
      this.target_temp = target_temp;
      this.target_humidity = target_humidity;
    }
  }
  module.exports = Room;
  