import * as THREE from 'three'
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// シーン
var scene = new THREE.Scene();

// カメラ
const camera = new THREE.PerspectiveCamera(
    90, // 視野角
    window.innerWidth / window.innerHeight,
    0.1, // 一番見える近いところ
    100, // 一番見える遠いところ
)
camera.position.set(0, 30, 30)

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
light.castShadow = true
scene.add(light)
// texture内に保存されているjpgのパス
const textureUrls = [
    // 'textures/3_road.jpg',
    'textures/ground.jpg',
];

// 読み込むGLBモデルのパス
const glbUrls = [
    'glb/houses.glb',
    'glb/run_boy.glb',
];
const textureLoader = new THREE.TextureLoader();
const glbloader = new GLTFLoader();

// 建物の描写
glbloader.load(glbUrls[0], function (gltf) {
    for ( let i = -12 ; i <= 12 ; i++){
        if (i !== 0){
            var model = gltf.scene.clone()
            model.rotation.set(0, ( Math.PI / 2 ) * Math.sign(i),0)
            model.position.set(-12 * Math.sign(i),0, -10 * Math.abs(i))
            scene.add(model)
        }
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
}

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});