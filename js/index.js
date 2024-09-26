document.addEventListener("DOMContentLoaded", () => {
    var text;
    if (localStorage.length > 0) {
        var lastGame = document.getElementById("score");
        var getPhone = localStorage.getItem('getPhone');
        var isGoal = localStorage.getItem('isGoal') // 文字列
        if (isGoal == true){
            text = "おめでとう"
        }else{
            text = "残念"
        }
        console.log(typeof(isGoal))
        lastGame.innerHTML = 
            text + "<br>"+ 
            "獲得したスマホの数は" + getPhone + "です。"
    }
    var sensorBtn = document.getElementById("sensor_permission");
    sensorBtn.addEventListener("click", () => {
        if (window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission) {
            DeviceOrientationEvent.requestPermission()
                .then((state) => {
                    if (state === 'granted') {
                        window.location.href = "./race.html";
                        // alert('Permission granted for DeviceOrientationEvent');
                    } else {

                        alert('Permission not granted for DeviceOrientationEvent');
                    }
                })
                .catch((err) => console.error(err));
        } else {
            // alert('まず、そんなものないね');
            window.location.href = "./race.html";
        }
    })
})