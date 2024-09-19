document.addEventListener("DOMContentLoaded", () => {
    var sensorBtn = document.getElementById("sensor_permission");
    sensorBtn.addEventListener("click", () => {
        if (window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission) {
            DeviceOrientationEvent.requestPermission()
                .then((state) => {
                    if (state === 'granted') {
                        // window.location.href = "./content/index.html#score";
                        alert('Permission granted for DeviceOrientationEvent');
                    } else {

                        alert('Permission not granted for DeviceOrientationEvent');
                    }
                })
                .catch((err) => console.error(err));
        } else {
            window.location.href = "./content/index.html#score";
        }
    })
})