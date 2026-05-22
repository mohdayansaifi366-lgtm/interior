import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

let threeViewerState = null;

function addWireframeBuilding(meshGroup) {
    const geo = new THREE.BoxGeometry(2.2, 1.4, 1.8);
    const edges = new THREE.EdgesGeometry(geo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xc5a880 });
    meshGroup.add(new THREE.LineSegments(edges, lineMat));

    const floorGeo = new THREE.PlaneGeometry(4, 4, 8, 8);
    const floorMat = new THREE.MeshBasicMaterial({
        color: 0xc5a880,
        wireframe: true,
        transparent: true,
        opacity: 0.25
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.72;
    meshGroup.add(floor);

    const accentGeo = new THREE.BoxGeometry(0.5, 2.2, 0.5);
    const accentEdges = new THREE.EdgesGeometry(accentGeo);
    const accent = new THREE.LineSegments(accentEdges, lineMat);
    accent.position.set(1.2, 0.2, 0.6);
    meshGroup.add(accent);
}

window.initProject3DViewer = function (canvasId, modelUrl) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (threeViewerState) {
        threeViewerState.dispose();
        threeViewerState = null;
    }

    const wrap = canvas.parentElement;
    const width = wrap.clientWidth || 640;
    const height = wrap.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x121212);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(4, 3, 5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene.add(new THREE.AmbientLight(0xc5a880, 0.35));
    const keyLight = new THREE.DirectionalLight(0xc5a880, 0.9);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.25);
    fillLight.position.set(-4, 2, -3);
    scene.add(fillLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;

    const meshGroup = new THREE.Group();
    scene.add(meshGroup);

    if (modelUrl) {
        const loader = new GLTFLoader();
        loader.load(
            modelUrl,
            (gltf) => {
                meshGroup.clear();
                const model = gltf.scene;
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z) || 1;
                const scale = 2.5 / maxDim;
                model.scale.setScalar(scale);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center.multiplyScalar(scale));
                meshGroup.add(model);
            },
            undefined,
            () => addWireframeBuilding(meshGroup)
        );
    } else {
        addWireframeBuilding(meshGroup);
    }

    function onResize() {
        const w = wrap.clientWidth || 640;
        const h = wrap.clientHeight || 480;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }

    window.addEventListener('resize', onResize);

    let animId;
    function animate() {
        animId = requestAnimationFrame(animate);
        controls.update();
        meshGroup.rotation.y += 0.001;
        renderer.render(scene, camera);
    }
    animate();

    threeViewerState = {
        dispose() {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', onResize);
            renderer.dispose();
            controls.dispose();
        }
    };
};

function bootDetailViewer() {
    if (document.body.getAttribute('data-page') !== 'project-detail') return;
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id || typeof getProjectById !== 'function') return;
    const data = getProjectById(id);
    if (data) window.initProject3DViewer('project-3d-canvas', data.modelUrl || null);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootDetailViewer);
} else {
    bootDetailViewer();
}
