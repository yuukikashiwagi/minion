document.addEventListener("DOMContentLoaded", () => {
    var sensorBtn = document.getElementById("sensor_permission");
    sensorBtn.addEventListener("click", () => {
        if (window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission) {
            DeviceOrientationEvent.requestPermission()
                .then((state) => {
                    if (state === 'granted') {
                        window.location.href = "./index copy.html";
                        // alert('Permission granted for DeviceOrientationEvent');
                    } else {

                        alert('Permission not granted for DeviceOrientationEvent');
                    }
                })
                .catch((err) => console.error(err));
        } else {
            // alert('まず、そんなものないね');
            window.location.href = "index copy.html";
        }
    })
})