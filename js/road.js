import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

document.addEventListener("DOMContentLoaded",function(){
    // シーン
    var scene = new THREE.Scene();

    // カメラ
    const camera = new THREE.PerspectiveCamera(
        90, // 視野角
        window.innerWidth / window.innerHeight,
        0.1, // 一番見える近いところ
        10000, // 一番見える遠いところ
    )
    camera.position.set(0, 5, 30)

    // レンダラー
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    })
    renderer.shadowMap.enabled = true
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    // ライト
    // 並行光源の作成
    // 場所によって影が変更されない
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(10, 10, 10)
    light.castShadow = true
    scene.add(light)

    // テクスチャ
    var textureLoader = new THREE.TextureLoader();
    var texture = textureLoader.load("textures/ground.jpg");

    // // テクスチャのリピート設定（必要に応じて）
    // textures[0].wrapS = THREE.RepeatWrapping;
    // textures[0].wrapT = THREE.RepeatWrapping;
    // textures[0].repeat.set(4, 4);  // 4回リピート

    // 地面のジオメトリを作成 (BoxGeometry)
    const groundGeometry = new THREE.PlaneGeometry(12, 100, 3);

    var sphereMaterial = new THREE.MeshPhongMaterial();
    sphereMaterial.map = texture;
    // メッシュを作成 (ジオメトリ + マテリアル)
    const ground = new THREE.Mesh(groundGeometry, sphereMaterial);

    // 地面の位置を設定
    ground.position.set(0, -2, 0);

    // 影を受け取る設定
    ground.receiveShadow = true;

    // シーンに地面を追加
    scene.add(ground);

    // 描画
    animate();

    // 描画関数
    function animate() {
        // sphere.rotation.y += 0.02;
        const animationId = requestAnimationFrame(animate)
        renderer.render(scene, camera);
    }
}
)