import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/loaders/FBXLoader.js';

// センサーの値の読み取り
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
})

// fbx,texturesの読み込み
async function loadResources() {
    const textureLoader = new THREE.TextureLoader();
    const fbxLoader = new FBXLoader();

    // texture内に保存されているjpgのパス
    const textureUrls = [
        // 'textures/3_road.jpg',
        'textures/ground.jpg',
    ];

    // 読み込むFBXモデルのパス
    const fbxUrls = [
        'path/to/your/run_boy.fbx',
    ];

    // テクスチャの読み込み
    const textures = await Promise.all(textureUrls.map(url => {
        return new Promise((resolve, reject) => {
            textureLoader.load(url, resolve, undefined, reject);
        });
    }));

    // FBXモデルの読み込み
    const models = await Promise.all(fbxUrls.map(url => {
        return new Promise((resolve, reject) => {
            fbxLoader.load(url, resolve, undefined, reject);
        });
    }));

    return { texture, model };
}


// カメラの定義
const camera = new THREE.PerspectiveCamera(
    90, // 視野角
    window.innerWidth / window.innerHeight,
    0.1, // 一番見える近いところ
    10000, // 一番見える遠いところ
)
// カメラの覚悟
camera.position.set(0, 2.74, 5)

// レンダラー
const renderer = new THREE.WebGLRenderer({
    alpha: true, // 画像透明
    antialias: true
})
renderer.shadowMap.enabled = true // 影
renderer.setSize(window.innerWidth, window.innerHeight) // 描画サイズ
document.body.appendChild(renderer.domElement)

// 衝突判定
function boxCollision({ box1, box2 }) {
    const xCollision = box1.right >= box2.left && box1.left <= box2.right
    const yCollision =
        box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom
    const zCollision = box1.front >= box2.back && box1.back <= box2.front

    return xCollision && yCollision && zCollision
}

textureLoader.load('textures/ground.jpg', (texture) => {
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const ground = new Box({
        width: 12,
        height: 0.1,
        depth: 50,
        material: material,
        position: {
            x: 0,
            y: -2,
            z: 0
        }
    });
    ground.receiveShadow = true
    scene.add(ground)

    animate(ground)
}, undefined, (error) => {
    console.error('Error loading texture:', error);
});

// 全てのリソースが読み込まれた後の処理
loadResources().then(({ textures, models }) => {
    // マテリアルを作成してモデルに適用
    models.forEach((model, index) => {
        const material = new THREE.MeshStandardMaterial({ map: textures[index % textures.length] }); // テクスチャをループして適用

        model.traverse((child) => {
            if (child.isMesh) {
                child.material = material;
            }
        });

        // モデルをシーンに追加
        scene.add(model);
    });

    // アニメーションループ
    const animate = () => {
        requestAnimationFrame(animate);
        
        // モデルを回転させる
        models.forEach(model => {
            model.rotation.y += 0.01; // Y軸周りに回転
        });

        renderer.render(scene, camera);
    };

    animate();
}).catch((error) => {
    console.error('Error loading resources:', error);
});

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(10, 10, 10)
light.castShadow = true
scene.add(light)

scene.add(new THREE.AmbientLight(0xffffff, 0.5))

function animate(ground) {
    const animationId = requestAnimationFrame(animate)
    renderer.render(scene, camera)

    cube.update(ground)
}

