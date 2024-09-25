import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/loaders/FBXLoader.js';

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

    // // 指定時間ごとに繰り返し実行される setInterval(実行する内容, 間隔[ms]) タイマーを設定
    // var graphtimer = window.setInterval(() => {
    //     displayData();
    // }, 33); // 33msごとに

    // function displayData() {
    //     var resultAcc = document.getElementById("result_acc");
    //     resultAcc.innerHTML = "x: " + aX.toFixed(2) + "<br>" +  // x軸の値
    //         "y: " + aY.toFixed(2) + "<br>" +  // y軸の値
    //         "z: " + aZ.toFixed(2);            // z軸の値
    //     var resultGyro = document.getElementById("result_gyro");
    //     resultGyro.innerHTML = "alpha: " + alpha.toFixed(2) + "<br>" +
    //         "beta: " + beta.toFixed(2) + "<br>" +
    //         "gamma: " + gamma.toFixed(2);
    // }
}
)


// ウィンドウのリサイズイベントをリッスン
window.addEventListener('resize', () => {
    // レンダラーのサイズを更新
    renderer.setSize(window.innerWidth, window.innerHeight);

    // カメラのアスペクト比を更新
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // プロジェクションマトリクスを更新
});


async function loadResources() {
    const textureLoader = new THREE.TextureLoader();
    // const fbxLoader = new FBXLoader();

    // texture内に保存されているjpgのパス
    const textureUrls = [
        // 'textures/3_road.jpg',
        'textures/ground.jpg',
    ];

    // // 読み込むFBXモデルのパス
    // const fbxUrls = [
    //     'fbx/run_boy.fbx',
    //     'fbx/houses.fbx',
    // ];

    // テクスチャの読み込み
    const textures = await Promise.all(textureUrls.map(url => {
        return new Promise((resolve, reject) => {
            textureLoader.load(url, resolve, undefined, reject);
        });
    }));

    // // FBXモデルの読み込み
    // const models = await Promise.all(fbxUrls.map(url => {
    //     return new Promise((resolve, reject) => {
    //         fbxLoader.load(url, resolve, undefined, reject);
    //     });
    // }));

    // return { texture, model };
    return textures;
}
var boxPlace = 1;
// カメラ
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    90, // 視野角
    window.innerWidth / window.innerHeight,
    0.1, // 一番見える近いところ
    10000, // 一番見える遠いところ
)
camera.position.set(0, 5, 30)

const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// カメラの手動制御
const controls = new OrbitControls(camera, renderer.domElement)
// fbxのダウンロード
const loader = new FBXLoader();
// position_left = {

// }
class Box extends THREE.Mesh {
    constructor({
        width,
        height,
        depth,
        material,
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
            material ? material : new THREE.MeshStandardMaterial({ color })
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

    // if (textureUrl) {
    //     // テクスチャが指定されている場合
    //     const textureLoader = new THREE.TextureLoader();
    //     const texture = textureLoader.load(textureUrl);
    //     material = new THREE.MeshStandardMaterial({ map: texture });
    // }

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
    color: '#00000000',
    velocity: {
        x: 0,
        y: -0.1,
        z: 0,
    },
    position:{
        x : 0,
        y : 0,
        z : 10,
    }
})

cube.castShadow = true
scene.add(cube)

const textureLoader = new THREE.TextureLoader();

// textureLoader.load('textures/ground.jpg', (texture) => {
//     const material = new THREE.MeshStandardMaterial({ map: texture });
//     const ground = new Box({
//         width: 12,
//         height: 0.1,
//         depth: 50,
//         material: material,
//         position: {
//             x: 0,
//             y: -2,
//             z: 0
//         }
//     });
//     ground.receiveShadow = true
//     scene.add(ground)

//     // scene.add(model[0])
//     // model[0].position.set(0, 0, 1); // (x, y, z)
//     // model[0].rotation.set(THREE.MathUtils.degToRad(180), 0, 0); 

//     animate(ground)
// }, undefined, (error) => {
//     console.error('Error loading texture:', error);
// });

// 全てのリソースが読み込まれた後の処理
loadResources().then(({ textures }) => {
    console.log('texturesは取得できたか')
    // console.log(textureUrls[0])
    // const material = new THREE.MeshStandardMaterial({ map: textures });
    const material = new THREE.MeshStandardMaterial({ map: textures[0] }); 
    // 地面のジオメトリを作成 (BoxGeometry)
    const groundGeometry = new THREE.BoxGeometry(12, 0.5, 50);

    // メッシュを作成 (ジオメトリ + マテリアル)
    const ground = new THREE.Mesh(groundGeometry, material);

    // 地面の位置を設定
    ground.position.set(0, 0, 0);
    // const ground = new Box({
    //             width: 12,
    //             height: 0.1,
    //             depth: 50,
    //             material: material,
    //             position: {
    //                 x: 0,
    //                 y: -2,
    //                 z: 0
    //             }
    //         });
    ground.receiveShadow = true
    scene.add(ground)
        // マテリアルを作成してモデルに適用
    // models.forEach((model, index) => {
    //     const material = new THREE.MeshStandardMaterial({ map: textures[index % textures.length] }); // テクスチャをループして適用

    //     // model.traverse((child) => {
    //     //     if (child.isMesh) {
    //     //         child.material = material;
    //     //     }
    //     // });

    //     // モデルをシーンに追加
    //     scene.add(model);
    // });
        // scene.add(model[0])
        // model[0].position.set(0, 0, 1); // (x, y, z)
        // model[0].rotation.set(THREE.MathUtils.degToRad(180), 0, 0); 

    // アニメーションループ
    const animate = () => {
        requestAnimationFrame(animate);
        
        // モデルを回転させる
        // models.forEach(model => {
        //     model.rotation.y += 0.01; // Y軸周りに回転
        // });

        renderer.render(scene, camera);
    };

    animate();
}).catch((error) => {
    console.error('Error loading resources:', error);
});

// const ground = new Box({
//     width: 12,
//     height: 0.1,
//     depth: 50,
//     textureUrl: 'textures/3_road.jpg',
//     // color: '#0369a1',
//     position: {
//         x: 0,
//         y: -2,
//         z: 0
//     }
// })



// 並行光源の作成
// 場所によって影が変更されない
const light = new THREE.DirectionalLight(0xffffff, 1)
// light.position.x = 1
// light.position.y = 1
// light.position.z = 0.1
light.position.set(10, 10, 10)
light.castShadow = true
scene.add(light)

scene.add(new THREE.AmbientLight(0xffffff, 0.5))

// camera.position.z = 5
// console.log(ground.top)
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

function animate(ground) {
    const animationId = requestAnimationFrame(animate)
    renderer.render(scene, camera)

    // movement code
    // boyの速度
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

    if (boxCollision({ box1: enemy, box2: ground })) {
        console.log("Collision detected!");
    }
}
