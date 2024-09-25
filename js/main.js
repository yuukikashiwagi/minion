import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/loaders/GLTFLoader.js';

let mixer;
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
// var light = new THREE.AmbientLight(0xFFFFFF, 10); // 光源色を指定して生成
// const light = new THREE.HemisphereLight(0x888888, 0x0000FF, 1);
// light.position.set(0, 10, 0)
// light.castShadow = true
light.position.set(10, 10, 10)
scene.add(light);
// scene.add(light)

// texture内に保存されているjpgのパス
const textureUrls = [
    'textures/ground.jpg',
];

// 読み込むGLBモデルのパス
const glbUrls = [
    'glb/houses.glb',// 周り
//    ' glb/player_sub.glb',
    'glb/player.glb',// プレイヤー
    'glb/phone.glb', // コイン
    'glb/red_corn.glb', // 障害物１
    'glb/long_red_corn.glb', // 障害物2
    // 'glb/run_boy.glb',
];

const textureloader = new THREE.TextureLoader();
const glbloader = new GLTFLoader();

// 空の描写
// let sky=new THREE.Sky();
// sky.scale.setScalar(50000);
// sky.material.uniforms.turbidity.value=0.8;// 大気の透明度
// sky.material.uniforms.rayleigh.value=0.3;// 入射する光子の数
// sky.material.uniforms.mieCoefficient.value=0.005;// 太陽光の散乱度 三重係数
// sky.material.uniforms.mieDirectionalG.value=0.8; // 太陽光の散乱度 三重指向性G
// sky.material.uniforms.sunPosition.value.x= 10000;//太陽の位置
// sky.material.uniforms.sunPosition.value.y= 30000;//太陽の位置
// sky.material.uniforms.sunPosition.value.z=-40000;//太陽の位置
// scene.add(sky);
  
// レーンの設定
const course = [-2.5,0,2.5]
// 建物の描写
glbloader.load(glbUrls[0], function (gltf) {
    for ( let i = -50 ; i <= 50 ; i++){
        if (i !== 0){
            var model = gltf.scene.clone()
            model.rotation.set(0, ( Math.PI / 2 ) * Math.sign(i),0)
            model.position.set(-10.5 * Math.sign(i),0, 30 -10 * Math.abs(i))
            scene.add(model)
        }
    }
},undefined, function ( error ) {
	console.error( error );
} );

let player;
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

let phone_list=[]
// スマホの描写
glbloader.load(glbUrls[2], function (gltf) {
    for ( let g = 1; g < 10 ;g++){
        var model = gltf.scene.clone()
        model.scale.set(9,8,9)
        model.rotation.set(0,( Math.PI / 4 ),( Math.PI / 4 ))
        const randomIndex = Math.floor(Math.random() * 3) // 0,1,2のランダム
        model.position.set(course[randomIndex],1,-15*g)
        phone_list.push(model)
        scene.add(model)
    }
    // console.log(model)
},undefined, function ( error ) {
	console.error( error );
} );

let enemy_list = []
// 障害物
glbloader.load(glbUrls[3], function (gltf) {
    var model = gltf.scene
    // model.rotation.set(0, ( Math.PI / 2 ) * Math.sign(i),0)
    model.scale.set(3,2,3)
    model.position.set(0,0,0)

    scene.add(model)
    for ( let g = 1; g < 10 ;g++){
        var model = gltf.scene.clone()
        model.scale.set(3,2,3)
        const randomIndex = Math.floor(Math.random() * 3) // 0,1,2のランダム
        model.position.set(course[randomIndex],1, 10 -23*g)
        enemy_list.push(model)
        scene.add(model)
    }
    // console.log(model)
},undefined, function ( error ) {
	console.error( error );
} );

// 道の描写
textureloader.load(textureUrls[0], function (texture) {
    for ( let l = 0 ; l < 30 ; l++){
        const groundGeometry = new THREE.BoxGeometry(12, 100, 0.5); // 地面のジオメトリを作成 (BoxGeometry)
        var sphereMaterial = new THREE.MeshPhongMaterial();
        sphereMaterial.map = texture;
        const ground = new THREE.Mesh(groundGeometry, sphereMaterial); // メッシュを作成 (ジオメトリ + マテリアル)
        ground.rotation.set( Math.PI / 2 ,0,0)
        ground.position.set(0, -0.3, 30-50 -100*l); // 地面の位置を設定
        ground.receiveShadow = true; // 影を受け取る設定
        scene.add(ground);
    }
},undefined, function ( error ) {
	console.error( error );
} );

animate();

// 描画関数
function animate() {
    // sphere.rotation.y += 0.02;
    const animationId = requestAnimationFrame(animate)
    renderer.render(scene, camera);
    // console.log(camera.position)
    if (mixer) {
        mixer.update(0.01); // delta time（時間の経過量）
    }

    player.position.z -= 0.1
    
    if (player) {
        // プレイヤーの位置に基づいてカメラの位置を更新
        camera.position.set(player.position.x, player.position.y + 5, player.position.z + 10); // プレイヤーの少し上方、後方にカメラを配置
        camera.lookAt(player.position); // カメラがプレイヤーを向くように設定
    }

    phone_list.forEach(phone => {
        phone.rotation.x += 0.01; // X軸周りに回転
        phone.rotation.y += 0.01; // Y軸周りに回転
    });

}