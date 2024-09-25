import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/loaders/GLTFLoader.js';

// レーンの設定
let index = 1
const course = [-5,0,5]

let mixer;

const gravity = 0.1

let player;
let playerBox;
let playerBoundingBox;
let player_v_y = 0
const initial_velocity = 1
let isJumping = false
let isMoving = false

let phone_list=[]
let enemy_list = []
let phone_hit_list = []
let enemy_hit_list = []

let alpha;
let beta;
let gamma;
let aZ;

let getPhone = 0
let collisionEnemy = 0

const textureloader = new THREE.TextureLoader();
const glbloader = new GLTFLoader();

// texture内に保存されているjpgのパス
const textureUrls = [
    'textures/ground.jpg',
];

// 読み込むGLBモデルのパス
const glbUrls = [
    'glb/houses.glb',// 周り
    'glb/player.glb',// プレイヤー
    'glb/phone.glb', // コイン
    'glb/red_corn.glb', // 障害物１
    'glb/long_red_corn.glb', // 障害物2
];

// シーン
var scene = new THREE.Scene();
// カメラ
const camera = new THREE.PerspectiveCamera(
    90, // 視野角
    window.innerWidth / window.innerHeight, //アスペクト比
    0.1, // 一番見える近いところ
    10000, // 一番見える遠いところ
)
camera.position.set(0, 4, 10)

// レンダラー
const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// カメラの手動
const controls = new OrbitControls(camera, renderer.domElement)

// ライト
// 並行光源の作成
// 場所によって影が変更されない
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(10, 10, 10)
scene.add(light);

// 建物の描写
glbloader.load(glbUrls[0], function (gltf) {
    for ( var i = -12 ; i <= 12 ; i++){
        if (i !== 0){
            var model = gltf.scene.clone()
            model.rotation.set(0, ( Math.PI / 2 ) * Math.sign(i),0)
            model.position.set(-14 * Math.sign(i),0, 30 -10 * Math.abs(i))
            scene.add(model)
        }
    }
},undefined, function ( error ) {
	console.error( error );
} );

// プレイヤー
glbloader.load(glbUrls[1], function (gltf) {
    player = gltf.scene
    player.scale.set(3,2,3)
    player.rotation.set(0,Math.PI,0)
    player.position.set(0,0,0)
    mixer = new THREE.AnimationMixer(player);

    // running アクションの取得と再生
    console.log(gltf.animation)
    const runningAction = gltf.animations.find(animation => animation.name === 'running');
    if (runningAction) {
        mixer.clipAction(runningAction).play();
        console.log('running animation exists')
    } else {
        console.warn('Running animation not found in the model.');
    }
    scene.add(player)
},undefined, function ( error ) {
	console.error( error );
} );

// スマホの描写
glbloader.load(glbUrls[2], function (gltf) {
    var model;
    for ( var g = 1; g < 25 ;g++){
        model = gltf.scene.clone()
        model.scale.set(15,15,15)
        model.rotation.set(0,( Math.PI / 4 ),( Math.PI / 4 ))
        const randomIndex = Math.floor(Math.random() * 3) // 0,1,2のランダム
        model.position.set(course[randomIndex],2,-15*g)
        phone_list.push(model)// オブジェクトのバウンディングボックスを計算
        scene.add(model)
    }
},undefined, function ( error ) {
	console.error( error );
} );

// 障害物
glbloader.load(glbUrls[3], function (gltf) {
    for ( var g = 1; g < 25 ;g++){
        var model = gltf.scene.clone()
        model.scale.set(3,2,3)
        const randomIndex = Math.floor(Math.random() * 3) // 0,1,2のランダム
        model.position.set(course[randomIndex],1, 10 -23*g)
        enemy_list.push(model)
        scene.add(model)
    }
},undefined, function ( error ) {
	console.error( error );
} );

// 道の描写
textureloader.load(textureUrls[0], function (texture) {
    for ( var l = 0 ; l < 10 ; l++){
        const groundGeometry = new THREE.BoxGeometry(24, 100, 0.5); // 地面のジオメトリを作成 (BoxGeometry)
        var sphereMaterial = new THREE.MeshPhongMaterial();
        sphereMaterial.map = texture;
        const ground = new THREE.Mesh(groundGeometry, sphereMaterial); // メッシュを作成 (ジオメトリ + マテリアル)
        ground.rotation.set( Math.PI / 2 ,0,0)
        ground.position.set(0, -0.3, 30-50 -100*l); // 地面の位置を設定
        ground.receiveShadow = true; // 影を受け取る設定
        scene.add(ground);
    }
},undefined, function ( error ) {
	console.error(error);
} );

// センサーの値の読み取り
document.addEventListener("DOMContentLoaded", function () {
    var aX = 0, aY = 0, aZ = 0;                     // 加速度の値を入れる変数を3個用意
    alpha = 0, beta = 0, gamma = 0;                            
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
        // var resultAcc = document.getElementById("result_ac");
        // resultAcc.innerHTML = "x: " + aX.toFixed(2) + "<br>" +  // x軸の値
        //     "y: " + aY.toFixed(2) + "<br>" +  // y軸の値
        //     "z: " + aZ.toFixed(2);            // z軸の値
        var resultGyro = document.getElementById("result_acc");
        resultGyro.innerHTML = 
            "alpha: " + alpha.toFixed(2) + "<br>" +
            "beta: " + beta.toFixed(2) + "<br>" +
            "gamma: " + gamma.toFixed(2) + "<br>" +
            "index:" + index + "<br>" +
            "isMoving:" + isMoving + "<br>" +
            "getPhone" + getPhone + "<br>" +
            "collisionEnemy" + collisionEnemy + "<br>" +
            "aZ" + aZ + "<br>" +
            "更新";
    }
})

// playerの移動
function move(){
    player.position.z -= 0.2
    if ( gamma > 20 && !isJumping && !isMoving){
        if ( index == 0 || index == 1){
            isMoving = true
            index += 1
            player.position.x = course[index]
        }
    }else if ( gamma < -20 && !isJumping && !isMoving){
        if ( index == 1 || index == 2){
            isMoving = true
            index -= 1
            player.position.x = course[index]
        }
    }else if (gamma < 0.5 && gamma > -0.5){
        isMoving = false
    }
}

function jump(){
    if ( !isJumping ){
        if ( aZ > 0 ){
            player_v_y = initial_velocity
            isJumping = true
            player.position.y += player_v_y
        }
    }else{
        player_v_y -= gravity
        player.position.y += player_v_y
        if (player.position.y <= 0){
            isJumping = false
        }
    }
}

function collision(){
    // コライダーボックスの位置をプレイヤーに同期
    var geometry = new THREE.BoxGeometry(3,4,2)
    const material = new THREE.MeshPhongMaterial({color: 0xFF0000});
    // メッシュを作成
    playerBox = new THREE.Mesh(geometry, material);
    playerBox.position.x = player.position.x
    playerBox.position.y = player.position.y + 2 
    playerBox.position.z = player.position.z
    playerBox.updateWorldMatrix(true, true);
    var playerBoundingBox = new THREE.Box3().setFromObject(playerBox);
    var playerHelper = new THREE.Box3Helper(playerBoundingBox, 0xff0000);
    scene.add(playerHelper)
    let i = 0

    // 配列をフィルタリングするための新しい配列を作成
    enemy_list = enemy_list.filter((enemy) => {
        var enemyBoundingBox = new THREE.Box3().setFromObject(enemy);
        var enemyHelper = new THREE.Box3Helper(enemyBoundingBox, 0xff0000);
        scene.add(enemyHelper);
        
        if (playerBoundingBox.intersectsBox(enemyBoundingBox)) {
            console.log('衝突しています');
            collisionEnemy += 1;
            return false; // この敵を削除
        }
        return true; // この敵を保持
    });

    // スマホオブジェクトの衝突判定
    phone_list = phone_list.filter((phone) => {
        var phoneBoundingBox = new THREE.Box3().setFromObject(phone);
        var phoneHelper = new THREE.Box3Helper(phoneBoundingBox, 0xff0000);
        scene.add(phoneHelper);
        
        if (playerBoundingBox.intersectsBox(phoneBoundingBox)) {
            console.log('衝突しています');
            getPhone += 1;
            return false; // このスマホを削除
        }
        return true; // このスマホを保持
    });

    // for (var enemy of enemy_list){
    //     var enemyBoundingBox = new THREE.Box3().setFromObject(enemy);
    //     var enemyHelper = new THREE.Box3Helper(enemyBoundingBox, 0xff0000);
    //     scene.add(enemyHelper);
    //     if (playerBoundingBox.intersectsBox(enemyBoundingBox)) {
    //         console.log('衝突しています');
    //         delete enemy_list[i];
    //     } else {
    //         i += 1
    //         // console.log('衝突していません');
    //     }
    // }

    // for (var phone of phone_list){
    //     var phoneBoundingBox = new THREE.Box3().setFromObject(phone);
    //     var phoneHelper = new THREE.Box3Helper(phoneBoundingBox, 0xff0000);
    //     scene.add(phoneHelper);
    //     if (playerBoundingBox.intersectsBox(phoneBoundingBox)) {
    //         console.log('衝突しています');
    //         getPhone += 1
    //         delete phone_list[i];
    //     } else {
    //         i += 1
    //         // console.log('衝突していません');
    //     }
    // }
    scene.remove(playerHelper);
    playerBox.material.dispose();
    playerBox.geometry.dispose();
}

// 描画関数
function animate() {
    const animationId = requestAnimationFrame(animate)
    // console.log(camera.position)
    if (mixer) {
        mixer.update(0.01); // delta time（時間の経過量）
    }
    if (player) {
        // プレイヤーの位置に基づいてカメラの位置を更新
        camera.position.set(player.position.x, player.position.y + 7, player.position.z + 10); // プレイヤーの少し上方、後方にカメラを配置
        camera.lookAt(player.position); // カメラがプレイヤーを向くように設定
    }
    phone_list.forEach(phone => {
        phone.rotation.x += 0.01; // X軸周りに回転
        phone.rotation.y += 0.01; // Y軸周りに回転
        phone.rotation.z += 0.01; // Y軸周りに回転
    });
    move()
    jump()
    collision()

    renderer.render(scene, camera);
}

// ウィンドウのリサイズイベントをリッスン
window.addEventListener('resize', () => {
    // レンダラーのサイズを更新
    renderer.setSize(window.innerWidth, window.innerHeight);

    // カメラのアスペクト比を更新
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // プロジェクションマトリクスを更新
});

animate();