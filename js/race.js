import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// window.onload = function(){
//     // ページ読み込み時に実行したい処理
//     DeviceOrientationEvent.requestPermission()
// }

document.addEventListener("DOMContentLoaded", function () {
    var aX = 0, aY = 0, aZ = 0;                     // 加速度の値を入れる変数を3個用意
    var alpha = 0, beta = 0, gamma = 0;                            
    // 加速度センサの値が変化したら実行される devicemotion イベント
    window.addEventListener("devicemotion", (dat) => {
        aX = dat.accelerationIncludingGravity.x || 0;
        aY = dat.accelerationIncludingGravity.y || 0;
        aZ = dat.accelerationIncludingGravity.z || 0;
        console.log('Acceleration:', aX, aY, aZ);
    });
    // ジャイロセンサー
    window.addEventListener("deviceorientation", (event) => {
        alpha = event.alpha || 0;
        beta = event.beta || 0;
        gamma = event.gamma || 0;
        console.log('Gyro:', alpha, beta, gamma);
    }, false);

    // 指定時間ごとに繰り返し実行される setInterval(実行する内容, 間隔[ms]) タイマーを設定
    var graphtimer = window.setInterval(() => {
        displayData();
    }, 33); // 33msごとに

    function displayData() {
        var resultAcc = document.getElementById("result_acc");
        resultAcc.innerHTML = "x: " + aX.toFixed(2) + "<br>" +  // x軸の値
            "y: " + aY.toFixed(2) + "<br>" +  // y軸の値
            "z: " + aZ.toFixed(2);            // z軸の値
        var resultGyro = document.getElementById("result_gyro");
        resultGyro.innerHTML = "alpha: " + alpha.toFixed(2) + "<br>" +
            "beta: " + beta.toFixed(2) + "<br>" +
            "gamma: " + gamma.toFixed(2);
    }
}
)

var boxPlace = 1;

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1, // 一番見える近いところ
    10000, // 一番見える遠いところ
)
camera.position.set(4.61, 2.74, 0)

const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

position_left = {

}
class Box extends THREE.Mesh {
    constructor({
        width,
        height,
        depth,
        color = '#00ff00',
        velocity = {
            x: 0,
            y: 0,
            z: 0
        },
        position = {
            x: 0,
            y: 0,
            z: 0
        },
        zAcceleration = false
    }) {
        super(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshStandardMaterial({ color })
        )

        this.width = width
        this.height = height
        this.depth = depth

        this.position.set(position.x, position.y, position.z)

        this.right = this.position.x + this.width / 2
        this.left = this.position.x - this.width / 2

        this.bottom = this.position.y - this.height / 2
        this.top = this.position.y + this.height / 2

        this.front = this.position.z + this.depth / 2
        this.back = this.position.z - this.depth / 2

        this.velocity = velocity
        this.gravity = -0.002

        this.zAcceleration = zAcceleration
    }

    updateSides() {
        this.right = this.position.x + this.width / 2
        this.left = this.position.x - this.width / 2

        this.bottom = this.position.y - this.height / 2
        this.top = this.position.y + this.height / 2

        this.front = this.position.z + this.depth / 2
        this.back = this.position.z - this.depth / 2
    }

    update(ground) {
        this.updateSides()

        if (this.zAcceleration) this.velocity.z += 0.0003

        this.position.x += this.velocity.x
        this.position.z += this.velocity.z

        this.applyGravity(ground)
    }

    applyGravity(ground) {
        this.velocity.y += this.gravity

        // this is where we hit the ground
        if (
            boxCollision({
                box1: this,
                box2: ground
            })
        ) {
            const friction = 0.5
            this.velocity.y *= friction
            this.velocity.y = -this.velocity.y
        } else this.position.y += this.velocity.y
    }
}

function boxCollision({ box1, box2 }) {
    const xCollision = box1.right >= box2.left && box1.left <= box2.right
    const yCollision =
        box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom
    const zCollision = box1.front >= box2.back && box1.back <= box2.front

    return xCollision && yCollision && zCollision
}

const cube = new Box({
    width: 1,
    height: 1,
    depth: 1,
    velocity: {
        x: 0,
        y: -0.1,
        z: 0,
    }
})
cube.castShadow = true
scene.add(cube)

const ground = new Box({
    width: 12,
    height: 0.1,
    depth: 50,
    color: '#0369a1',
    position: {
        x: 0,
        y: -2,
        z: 0
    }
})

ground.receiveShadow = true
scene.add(ground)

const light = new THREE.DirectionalLight(0xffffff, 1)
// light.position.x = 10
light.position.y = 1
light.position.z = 0.1
light.castShadow = true
scene.add(light)

scene.add(new THREE.AmbientLight(0xffffff, 0.5))

camera.position.z = 5
console.log(ground.top)
console.log(cube.bottom)

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    s: {
        pressed: false
    },
    w: {
        pressed: false
    }
}

window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyA':
            keys.a.pressed = true
            break
        case 'KeyD':
            keys.d.pressed = true
            break
        case 'KeyS':
            keys.s.pressed = true
            break
        case 'KeyW':
            keys.w.pressed = true
            break
        case 'Space':
            cube.velocity.y = 0.08
            break
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyA':
            keys.a.pressed = false
            break
        case 'KeyD':
            keys.d.pressed = false
            break
        case 'KeyS':
            keys.s.pressed = false
            break
        case 'KeyW':
            keys.w.pressed = false
            break
    }
})

const enemies = []

let frames = 0
let spawnRate = 200

function animate() {
    const animationId = requestAnimationFrame(animate)
    renderer.render(scene, camera)

    // movement code
    cube.velocity.x = 0
    cube.velocity.z = 0
    if (keys.a.pressed) cube.velocity.x = -0.05
    else if (keys.d.pressed) cube.velocity.x = 0.05

    if (keys.s.pressed) cube.velocity.z = 0.05
    else if (keys.w.pressed) cube.velocity.z = -0.05

    cube.update(ground)
    enemies.forEach((enemy) => {
        enemy.update(ground)
        if (
            boxCollision({
                box1: cube,
                box2: enemy
                })
        ) {
            cancelAnimationFrame(animationId)
        }
        })

        if (frames % spawnRate === 0) {
        if (spawnRate > 20) spawnRate -= 20

        const enemy = new Box({
            width: 1,
            height: 1,
            depth: 1,
            position: {
            x: (Math.random() - 0.5) * 10,
            y: 0,
            z: -20
            },
            velocity: {
            x: 0,
            y: 0,
            z: 0.005
            },
            color: 'red',
            zAcceleration: true
        })
            enemy.castShadow = true
            scene.add(enemy)
            enemies.push(enemy)
        }
        frames++
    }

animate()

