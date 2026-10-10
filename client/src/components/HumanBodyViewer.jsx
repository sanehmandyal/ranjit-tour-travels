import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Rotate3D, Eye, Compass, ZoomIn, ZoomOut, RefreshCw, 
  Layers, Crosshair, ChevronRight, Activity, Info, Sparkles, Check, Play, Pause
} from 'lucide-react';

// Anatomical Feature Markers / Hotspots
const ANATOMICAL_FEATURES = [
  {
    id: 'cranial',
    name: 'Cranial & Facial Profile',
    category: 'Head & Neck',
    position: [0, 5.2, 0.2],
    side: 'Head / Cranial',
    description: 'Cranium, temporal bones, mandibular jawline, and lateral cervical posture alignment.',
    lateralDetails: 'Lateral view reveals forward head posture (FHP), cervical lordosis curve, and jawline definition.'
  },
  {
    id: 'cervical',
    name: 'Cervical Spine & Trapezius',
    category: 'Upper Spine',
    position: [0, 4.3, -0.2],
    side: 'Posterior / Lateral',
    description: 'C1-C7 cervical vertebrae connecting the skull base to upper thoracic girdle.',
    lateralDetails: 'Side angle measures cervical lordosis curvature and anterior head tilt against vertical plumb line.'
  },
  {
    id: 'left_deltoid',
    name: 'Left Shoulder & Lateral Deltoid',
    category: 'Upper Extremity',
    position: [-2.2, 3.8, 0],
    side: 'Left Lateral Profile',
    description: 'Acromion process, anterior/lateral/posterior deltoid muscle groups, and humerus glenoid articulation.',
    lateralDetails: 'Lateral view shows shoulder protraction/retraction, glenohumeral centering, and deltoid contour.'
  },
  {
    id: 'right_deltoid',
    name: 'Right Shoulder & Lateral Deltoid',
    category: 'Upper Extremity',
    position: [2.2, 3.8, 0],
    side: 'Right Lateral Profile',
    description: 'Acromion process, lateral deltoid muscle contour, and right shoulder rotation mechanics.',
    lateralDetails: 'Side perspective highlights shoulder balance, scapular winging, and humerus alignment.'
  },
  {
    id: 'thorax_left',
    name: 'Left Lateral Ribcage & Serratus',
    category: 'Torso & Trunk',
    position: [-1.4, 2.6, 0],
    side: 'Left Lateral Profile',
    description: 'Lateral ribs (true & false ribs), serratus anterior, intercostals, and latissimus dorsi border.',
    lateralDetails: 'Lateral profile provides full inspection of thoracic kyphosis and lateral chest expansion.'
  },
  {
    id: 'thorax_right',
    name: 'Right Lateral Ribcage & Serratus',
    category: 'Torso & Trunk',
    position: [1.4, 2.6, 0],
    side: 'Right Lateral Profile',
    description: 'Lateral ribcage contours, respiratory expansion, and right trunk lateral posture.',
    lateralDetails: 'Side view demonstrates lateral rib cage symmetry and thoracic spine extension.'
  },
  {
    id: 'lumbar_spine',
    name: 'Lumbar Spine & Core Wall',
    category: 'Lower Back & Core',
    position: [0, 1.8, -0.3],
    side: 'Posterior / Lateral Profile',
    description: 'L1-L5 lumbar lordosis curve, abdominal wall depth, and posterior lumbar spine.',
    lateralDetails: 'Lateral inspection reveals pelvic tilt angles (anterior/posterior tilt) and lumbar curvature.'
  },
  {
    id: 'left_hip',
    name: 'Left Pelvic Girdle & Hip Joint',
    category: 'Pelvis & Hip',
    position: [-1.2, 0.5, 0],
    side: 'Left Lateral Profile',
    description: 'Iliac crest, greater trochanter of femur, gluteus medius/minimus, and lateral pelvic stability.',
    lateralDetails: 'Side profile shows hip extension/flexion, pelvic tilt offset, and lateral weight distribution.'
  },
  {
    id: 'right_hip',
    name: 'Right Pelvic Girdle & Hip Joint',
    category: 'Pelvis & Hip',
    position: [1.2, 0.5, 0],
    side: 'Right Lateral Profile',
    description: 'Right greater trochanter, gluteal muscular curve, and lateral pelvic landmark alignment.',
    lateralDetails: 'Side perspective verifies pelvic balance against the coronal and sagittal planes.'
  },
  {
    id: 'left_knee',
    name: 'Left Knee Joint & Patella',
    category: 'Lower Extremity',
    position: [-1.0, -2.5, 0.1],
    side: 'Left Lateral Profile',
    description: 'Lateral collateral ligament (LCL), lateral meniscus, distal femur, and proximal tibia.',
    lateralDetails: 'Lateral angle measures genu recurvatum (knee hyperextension) or flexion contracture.'
  },
  {
    id: 'right_knee',
    name: 'Right Knee Joint & Patella',
    category: 'Lower Extremity',
    position: [1.0, -2.5, 0.1],
    side: 'Right Lateral Profile',
    description: 'Right lateral joint line, patellar tendon tracking, and lateral hamstring insertion.',
    lateralDetails: 'Lateral view reveals knee joint alignment, patellar tracking, and sagittal posture axis.'
  },
  {
    id: 'left_ankle',
    name: 'Left Ankle & Lateral Malleolus',
    category: 'Foot & Ankle',
    position: [-1.0, -5.2, 0],
    side: 'Left Lateral Profile',
    description: 'Lateral fibular malleolus, subtalar joint, Achilles tendon insertion, and calcaneus arch.',
    lateralDetails: 'Side perspective demonstrates subtalar pronation/supination and sagittal foot strike arch.'
  }
];

// Presets for Quick Perspective Snapping
const VIEW_PRESETS = [
  { label: 'Front (Anterior)', yaw: 0, pitch: 0, zoom: 12, desc: 'Coronal Anterior View' },
  { label: 'Left Profile (Lateral)', yaw: Math.PI / 2, pitch: 0, zoom: 11, desc: 'Left Lateral Side View' },
  { label: 'Right Profile (Lateral)', yaw: -Math.PI / 2, pitch: 0, zoom: 11, desc: 'Right Lateral Side View' },
  { label: 'Back (Posterior)', yaw: Math.PI, pitch: 0, zoom: 12, desc: 'Posterior Spine View' },
  { label: 'Left 3/4 Perspective', yaw: Math.PI / 4, pitch: 0.15, zoom: 11.5, desc: 'Antero-Lateral Profile' },
  { label: 'Right 3/4 Perspective', yaw: -Math.PI / 4, pitch: 0.15, zoom: 11.5, desc: 'Antero-Lateral Profile' }
];

export default function HumanBodyViewer() {
  const mountRef = useRef(null);
  const [selectedFeature, setSelectedFeature] = useState(ANATOMICAL_FEATURES[2]); // Left Deltoid default
  const [activePreset, setActivePreset] = useState('Left Profile (Lateral)');
  const [autoRotate, setAutoRotate] = useState(false);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [showPlumbLine, setShowPlumbLine] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [rotationCoords, setRotationCoords] = useState({ yaw: 90, pitch: 0, distance: 11 });

  // Refs to hold Three.js instances
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const humanGroupRef = useRef(null);
  const plumbLineRef = useRef(null);
  const hotspotMeshesRef = useRef([]);
  const materialsRef = useRef([]);

  // Rotation control state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ yaw: Math.PI / 2, pitch: 0, distance: 11 });
  const currentRotationRef = useRef({ yaw: Math.PI / 2, pitch: 0, distance: 11 });

  // Build Procedural 3D Human Anatomy Model
  const buildHumanBody = (scene) => {
    const group = new THREE.Group();
    const materials = [];

    // Anatomical Shaders / Colors
    const skinMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2dd4bf,
      emissive: 0x0f766e,
      emissiveIntensity: 0.25,
      roughness: 0.35,
      metalness: 0.15,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
      wireframe: false
    });
    materials.push(skinMaterial);

    const muscleAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0x0d9488,
      roughness: 0.4,
      metalness: 0.2
    });
    materials.push(muscleAccentMaterial);

    const jointMaterial = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xca8a04,
      emissiveIntensity: 0.3,
      roughness: 0.2
    });
    materials.push(jointMaterial);

    materialsRef.current = materials;

    // 1. HEAD & CRANIAL STRUCTURE
    const headGeo = new THREE.SphereGeometry(0.85, 32, 24);
    headGeo.scale(1, 1.25, 1.1);
    const head = new THREE.Mesh(headGeo, skinMaterial);
    head.position.set(0, 5.3, 0);
    group.add(head);

    // Jawline & Chin
    const chinGeo = new THREE.ConeGeometry(0.55, 0.7, 16);
    chinGeo.rotateX(Math.PI);
    const chin = new THREE.Mesh(chinGeo, skinMaterial);
    chin.position.set(0, 4.55, 0.2);
    group.add(chin);

    // 2. CERVICAL NECK
    const neckGeo = new THREE.CylinderGeometry(0.42, 0.5, 0.7, 20);
    const neck = new THREE.Mesh(neckGeo, skinMaterial);
    neck.position.set(0, 4.3, 0);
    group.add(neck);

    // 3. THORAX / CHEST / UPPER TORSO
    const chestGeo = new THREE.CylinderGeometry(1.65, 1.35, 1.7, 24);
    chestGeo.scale(1.2, 1, 0.85);
    const chest = new THREE.Mesh(chestGeo, skinMaterial);
    chest.position.set(0, 3.2, 0);
    group.add(chest);

    // Lateral Ribcage definition contours (Left & Right ribs)
    [-1, 1].forEach(side => {
      for (let r = 0; r < 4; r++) {
        const ribGeo = new THREE.TorusGeometry(1.3 - r * 0.08, 0.06, 12, 24, Math.PI * 0.45);
        ribGeo.rotateZ(side === -1 ? Math.PI * 0.8 : -Math.PI * 0.25);
        ribGeo.rotateY(side === -1 ? Math.PI * 0.1 : -Math.PI * 0.1);
        const rib = new THREE.Mesh(ribGeo, muscleAccentMaterial);
        rib.position.set(side * 0.2, 3.4 - r * 0.35, 0.05);
        group.add(rib);
      }
    });

    // 4. WAIST & ABDOMEN (Sagittal curvature)
    const waistGeo = new THREE.CylinderGeometry(1.25, 1.35, 1.4, 24);
    waistGeo.scale(1.15, 1, 0.8);
    const waist = new THREE.Mesh(waistGeo, skinMaterial);
    waist.position.set(0, 1.8, 0);
    group.add(waist);

    // Spine Column along back (Cervical to Lumbar)
    for (let s = 0; s < 12; s++) {
      const vertGeo = new THREE.BoxGeometry(0.3, 0.15, 0.25);
      const vert = new THREE.Mesh(vertGeo, jointMaterial);
      const yPos = 4.2 - s * 0.26;
      // Natural S-curve of human spine
      const zOffset = -0.55 + Math.sin(s * 0.4) * 0.12;
      vert.position.set(0, yPos, zOffset);
      group.add(vert);
    }

    // 5. PELVIS / HIPS
    const pelvisGeo = new THREE.CylinderGeometry(1.4, 1.15, 1.1, 24);
    pelvisGeo.scale(1.2, 1, 0.85);
    const pelvis = new THREE.Mesh(pelvisGeo, skinMaterial);
    pelvis.position.set(0, 0.6, 0);
    group.add(pelvis);

    // Left & Right Greater Trochanters (Hip joints)
    [-1.5, 1.5].forEach(xPos => {
      const hipJointGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const hipJoint = new THREE.Mesh(hipJointGeo, jointMaterial);
      hipJoint.position.set(xPos, 0.5, 0);
      group.add(hipJoint);
    });

    // 6. SHOULDERS & ARMS (Left & Right)
    [-1, 1].forEach(side => {
      // Deltoid Shoulder Cap
      const deltoidGeo = new THREE.SphereGeometry(0.55, 20, 20);
      deltoidGeo.scale(1.1, 1.3, 1.1);
      const deltoid = new THREE.Mesh(deltoidGeo, muscleAccentMaterial);
      deltoid.position.set(side * 2.1, 3.8, 0);
      group.add(deltoid);

      // Upper Arm (Humerus)
      const bicepGeo = new THREE.CylinderGeometry(0.38, 0.32, 1.7, 16);
      const upperArm = new THREE.Mesh(bicepGeo, skinMaterial);
      upperArm.position.set(side * 2.15, 2.7, 0);
      group.add(upperArm);

      // Elbow Joint
      const elbowGeo = new THREE.SphereGeometry(0.3, 14, 14);
      const elbow = new THREE.Mesh(elbowGeo, jointMaterial);
      elbow.position.set(side * 2.15, 1.75, 0);
      group.add(elbow);

      // Forearm
      const forearmGeo = new THREE.CylinderGeometry(0.32, 0.25, 1.6, 16);
      const forearm = new THREE.Mesh(forearmGeo, skinMaterial);
      forearm.position.set(side * 2.15, 0.85, 0);
      group.add(forearm);

      // Hand
      const handGeo = new THREE.BoxGeometry(0.2, 0.55, 0.35);
      const hand = new THREE.Mesh(handGeo, skinMaterial);
      hand.position.set(side * 2.15, -0.2, 0);
      group.add(hand);
    });

    // 7. LEGS & LOWER EXTREMITIES (Left & Right)
    [-1, 1].forEach(side => {
      const legX = side * 0.95;

      // Thigh / Quadriceps (Femur)
      const thighGeo = new THREE.CylinderGeometry(0.62, 0.48, 2.7, 20);
      thighGeo.scale(1.05, 1, 1.1);
      const thigh = new THREE.Mesh(thighGeo, skinMaterial);
      thigh.position.set(legX, -1.1, 0);
      group.add(thigh);

      // Knee Joint & Patella
      const kneeGeo = new THREE.SphereGeometry(0.42, 18, 18);
      const knee = new THREE.Mesh(kneeGeo, jointMaterial);
      knee.position.set(legX, -2.5, 0.05);
      group.add(knee);

      // Calf / Lower Leg (Tibia & Fibula)
      const calfGeo = new THREE.CylinderGeometry(0.46, 0.32, 2.6, 20);
      calfGeo.scale(1, 1, 1.1);
      const calf = new THREE.Mesh(calfGeo, skinMaterial);
      calf.position.set(legX, -3.85, -0.05);
      group.add(calf);

      // Ankle Joint & Malleolus
      const ankleGeo = new THREE.SphereGeometry(0.32, 16, 16);
      const ankle = new THREE.Mesh(ankleGeo, jointMaterial);
      ankle.position.set(legX, -5.2, 0);
      group.add(ankle);

      // Foot & Longitudinal Arch
      const footGeo = new THREE.BoxGeometry(0.5, 0.35, 1.2);
      const foot = new THREE.Mesh(footGeo, skinMaterial);
      foot.position.set(legX, -5.5, 0.3);
      group.add(foot);
    });

    // 8. LATERAL PLUMB LINE (Postural Alignment Line)
    const plumbLinePoints = [
      new THREE.Vector3(0, 6.2, 0),
      new THREE.Vector3(0, -5.8, 0)
    ];
    const plumbGeo = new THREE.BufferGeometry().setFromPoints(plumbLinePoints);
    const plumbMat = new THREE.LineDashedMaterial({
      color: 0xf59e0b,
      dashSize: 0.25,
      gapSize: 0.15,
      linewidth: 2
    });
    const plumbLine = new THREE.Line(plumbGeo, plumbMat);
    plumbLine.computeLineDistances();
    plumbLineRef.current = plumbLine;
    group.add(plumbLine);

    // 9. HOTSPOT PINS / FEATURE MARKERS
    const hotspotMeshes = [];
    ANATOMICAL_FEATURES.forEach(feature => {
      const pinGroup = new THREE.Group();
      pinGroup.position.set(...feature.position);
      pinGroup.userData = { feature };

      // Outer Glowing Ring
      const ringGeo = new THREE.RingGeometry(0.18, 0.26, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      pinGroup.add(ring);

      // Inner Glowing Core Sphere
      const coreGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const core = new THREE.Mesh(coreGeo, coreMat);
      pinGroup.add(core);

      group.add(pinGroup);
      hotspotMeshes.push(pinGroup);
    });
    hotspotMeshesRef.current = hotspotMeshes;

    scene.add(group);
    humanGroupRef.current = group;
  };

  // Initialize Scene, Lights, Camera & Canvas
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 11);
    cameraRef.current = camera;

    // WebGL Renderer with High-DPI support
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Lighting setup for anatomical depth
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Key Front Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(5, 8, 8);
    scene.add(keyLight);

    // Lateral Side Light (Left)
    const leftSideLight = new THREE.DirectionalLight(0x2dd4bf, 1.8);
    leftSideLight.position.set(-10, 4, 0);
    scene.add(leftSideLight);

    // Lateral Side Light (Right)
    const rightSideLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rightSideLight.position.set(10, 4, 0);
    scene.add(rightSideLight);

    // Rim / Back Light (Accentuates lateral contours)
    const rimLight = new THREE.DirectionalLight(0xfef08a, 1.4);
    rimLight.position.set(0, 6, -8);
    scene.add(rimLight);

    // Build Model
    buildHumanBody(scene);

    // Animation Loop with Smooth Damping
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && !isDraggingRef.current) {
        targetRotationRef.current.yaw += 0.008;
      }

      // Smooth interpolation (damping)
      currentRotationRef.current.yaw += (targetRotationRef.current.yaw - currentRotationRef.current.yaw) * 0.08;
      currentRotationRef.current.pitch += (targetRotationRef.current.pitch - currentRotationRef.current.pitch) * 0.08;
      currentRotationRef.current.distance += (targetRotationRef.current.distance - currentRotationRef.current.distance) * 0.08;

      // Update camera spherical position
      const { yaw, pitch, distance } = currentRotationRef.current;
      camera.position.x = distance * Math.sin(yaw) * Math.cos(pitch);
      camera.position.y = distance * Math.sin(pitch);
      camera.position.z = distance * Math.cos(yaw) * Math.cos(pitch);
      camera.lookAt(0, 0, 0);

      // Rotate hotspot pins to always face camera
      if (hotspotMeshesRef.current) {
        hotspotMeshesRef.current.forEach(pin => {
          pin.quaternion.copy(camera.quaternion);
        });
      }

      // Update Rotation Readout HUD
      const degYaw = (((yaw * 180) / Math.PI) % 360 + 360) % 360;
      const degPitch = (pitch * 180) / Math.PI;
      setRotationCoords({
        yaw: Math.round(degYaw),
        pitch: Math.round(degPitch),
        distance: Number(distance.toFixed(1))
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.innerHTML = '';
      }
    };
  }, [autoRotate]);

  // Pointer & Mouse Orbit Controls Handlers
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = {
      x: e.clientX || (e.touches && e.touches[0].clientX) || 0,
      y: e.clientY || (e.touches && e.touches[0].clientY) || 0
    };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;

    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const currentY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    const deltaX = currentX - previousMousePositionRef.current.x;
    const deltaY = currentY - previousMousePositionRef.current.y;

    // Horizontal drag -> Yaw (360° rotation)
    targetRotationRef.current.yaw -= deltaX * 0.007;

    // Vertical drag -> Pitch (Tilt up/down within comfortable limits)
    targetRotationRef.current.pitch += deltaY * 0.005;
    targetRotationRef.current.pitch = Math.max(-1.1, Math.min(1.1, targetRotationRef.current.pitch));

    previousMousePositionRef.current = { x: currentX, y: currentY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Zoom Handler
  const handleWheel = (e) => {
    e.preventDefault();
    targetRotationRef.current.distance += e.deltaY * 0.005;
    targetRotationRef.current.distance = Math.max(6, Math.min(22, targetRotationRef.current.distance));
  };

  // Snap to Preset View
  const handlePresetSelect = (preset) => {
    setActivePreset(preset.label);
    targetRotationRef.current.yaw = preset.yaw;
    targetRotationRef.current.pitch = preset.pitch;
    targetRotationRef.current.distance = preset.zoom;
    setAutoRotate(false);
  };

  // Focus on Specific Feature
  const handleSelectFeature = (feature) => {
    setSelectedFeature(feature);
    // Smoothly turn camera towards the feature angle
    const [x, , z] = feature.position;
    const featureAngle = Math.atan2(x, z);
    targetRotationRef.current.yaw = featureAngle;
    targetRotationRef.current.pitch = 0.08;
    targetRotationRef.current.distance = 9.5;
    setAutoRotate(false);
  };

  // Toggle Wireframe Mode
  const toggleWireframe = () => {
    const nextMode = !wireframeMode;
    setWireframeMode(nextMode);
    if (materialsRef.current) {
      materialsRef.current.forEach(mat => {
        mat.wireframe = nextMode;
      });
    }
  };

  // Toggle Plumb Alignment Line
  const togglePlumbLine = () => {
    const nextState = !showPlumbLine;
    setShowPlumbLine(nextState);
    if (plumbLineRef.current) {
      plumbLineRef.current.visible = nextState;
    }
  };

  // Toggle Hotspot Pins
  const toggleHotspots = () => {
    const nextState = !showHotspots;
    setShowHotspots(nextState);
    if (hotspotMeshesRef.current) {
      hotspotMeshesRef.current.forEach(pin => {
        pin.visible = nextState;
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 flex flex-col items-center justify-center font-sans relative overflow-hidden selection:bg-teal-500 selection:text-white">
      {/* Background Ambient Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 blur-[160px] rounded-full" />
      </div>

      <div className="max-w-7xl w-full relative z-10 space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/[0.06] backdrop-blur-2xl border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-mono font-bold tracking-wider uppercase mb-1.5">
              <Rotate3D size={14} className="animate-spin-slow" />
              <span>Full 360° Rotation & Lateral Profile Inspection</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Human Anatomy 3D Spatial Inspector
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Click & drag to rotate 360° horizontally and vertically. Inspect lateral ribcage, deltoids, spine curvature, and hip alignment.
            </p>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex items-center gap-3 bg-slate-900/80 border border-white/15 rounded-2xl p-2.5 px-4 backdrop-blur-md">
            <div className="text-center">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Yaw Orbit</span>
              <span className="text-xs font-mono font-bold text-teal-300">{rotationCoords.yaw}°</span>
            </div>
            <div className="w-px h-6 bg-white/15" />
            <div className="text-center">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Pitch Tilt</span>
              <span className="text-xs font-mono font-bold text-cyan-300">{rotationCoords.pitch}°</span>
            </div>
            <div className="w-px h-6 bg-white/15" />
            <div className="text-center">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Distance</span>
              <span className="text-xs font-mono font-bold text-emerald-300">{rotationCoords.distance}m</span>
            </div>
          </div>
        </div>

        {/* Main 3D Viewport & Side Panel Grid */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* 3D Canvas Viewport (8 Columns) */}
          <div className="lg:col-span-8 bg-white/[0.05] backdrop-blur-2xl border border-white/15 rounded-3xl p-4 sm:p-6 shadow-2xl relative flex flex-col">
            {/* Viewport Action Floating Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-white/10 relative z-20">
              {/* Presets */}
              <div className="flex flex-wrap gap-1.5">
                {VIEW_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetSelect(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer backdrop-blur-md ${
                      activePreset === preset.label
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-900/40 border border-teal-400/40'
                        : 'bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Display Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    autoRotate
                      ? 'bg-teal-500/30 border-teal-400 text-teal-200 shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-300'
                  }`}
                  title={autoRotate ? 'Pause Turntable' : 'Auto-Rotate Turntable'}
                >
                  {autoRotate ? <Pause size={14} /> : <Play size={14} />}
                  <span className="hidden sm:inline">360° Spin</span>
                </button>

                <button
                  onClick={toggleWireframe}
                  className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    wireframeMode
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-300'
                  }`}
                  title="Toggle Wireframe Mesh Layer"
                >
                  <Layers size={14} />
                  <span className="hidden sm:inline">Mesh</span>
                </button>

                <button
                  onClick={togglePlumbLine}
                  className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    showPlumbLine
                      ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-300'
                  }`}
                  title="Toggle Posture Plumb Line"
                >
                  <Crosshair size={14} />
                  <span className="hidden sm:inline">Plumb Line</span>
                </button>
              </div>
            </div>

            {/* Interactive WebGL 3D Canvas */}
            <div
              ref={mountRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onWheel={handleWheel}
              className="w-full h-[540px] sm:h-[620px] rounded-2xl bg-gradient-to-b from-slate-900/60 via-slate-950/80 to-slate-950 border border-white/10 relative cursor-grab active:cursor-grabbing overflow-hidden touch-none"
            >
              {/* Overlay Interactive Hint */}
              <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-md border border-white/15 rounded-xl px-3 py-1.5 text-[11px] text-slate-300 flex items-center gap-2 pointer-events-none">
                <Compass size={14} className="text-teal-400 animate-spin-slow" />
                <span>Drag to Rotate · Scroll to Zoom</span>
              </div>

              {/* Side Angle Live Compass Indicator */}
              <div className="absolute bottom-3 right-3 bg-slate-950/70 backdrop-blur-md border border-white/15 rounded-xl p-2.5 text-[10px] font-mono text-slate-300 space-y-0.5 pointer-events-none text-right">
                <span className="text-teal-400 font-bold block">
                  {rotationCoords.yaw >= 45 && rotationCoords.yaw < 135
                    ? '📍 LEFT LATERAL PROFILE'
                    : rotationCoords.yaw >= 135 && rotationCoords.yaw < 225
                    ? '📍 POSTERIOR (BACK) VIEW'
                    : rotationCoords.yaw >= 225 && rotationCoords.yaw < 315
                    ? '📍 RIGHT LATERAL PROFILE'
                    : '📍 ANTERIOR (FRONT) VIEW'}
                </span>
                <span>Orbit: {rotationCoords.yaw}°</span>
              </div>
            </div>

            {/* Zoom Controls HUD */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    targetRotationRef.current.distance = Math.max(6, targetRotationRef.current.distance - 1.5);
                  }}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 transition cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={() => {
                    targetRotationRef.current.distance = Math.min(22, targetRotationRef.current.distance + 1.5);
                  }}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 transition cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  onClick={() => {
                    targetRotationRef.current = { yaw: Math.PI / 2, pitch: 0, distance: 11 };
                    setActivePreset('Left Profile (Lateral)');
                  }}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 transition cursor-pointer flex items-center gap-1"
                  title="Reset Side View"
                >
                  <RefreshCw size={13} />
                  <span className="text-[11px]">Reset Side View</span>
                </button>
              </div>

              <span className="text-[11px] font-mono text-teal-300">
                Smooth 3D Orbit • Zero Card Flipping
              </span>
            </div>
          </div>

          {/* Side Features Inspector (4 Columns) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Active Selected Feature Card */}
            {selectedFeature && (
              <div className="bg-white/[0.08] backdrop-blur-2xl border border-teal-400/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-white">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent pointer-events-none" />

                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
                  <span className="text-[10px] font-mono text-teal-300 uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30">
                    {selectedFeature.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-300">
                    {selectedFeature.side}
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-xl text-white mb-2">
                  {selectedFeature.name}
                </h3>

                <p className="text-xs text-slate-200 leading-relaxed mb-4">
                  {selectedFeature.description}
                </p>

                <div className="p-3.5 bg-teal-950/50 border border-teal-400/30 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-teal-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Sparkles size={13} className="text-teal-300" />
                    Lateral / Side Profile Analysis
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {selectedFeature.lateralDetails}
                  </p>
                </div>
              </div>
            )}

            {/* Feature Hotspot Selector List */}
            <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl text-white">
              <h4 className="font-display font-bold text-sm text-white mb-3 flex items-center justify-between">
                <span>Side & Anatomical Features</span>
                <span className="text-[10px] font-mono text-teal-300">{ANATOMICAL_FEATURES.length} Landmarks</span>
              </h4>

              <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                {ANATOMICAL_FEATURES.map((feat) => {
                  const isSelected = selectedFeature?.id === feat.id;
                  return (
                    <button
                      key={feat.id}
                      onClick={() => handleSelectFeature(feat)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-teal-500/30 to-emerald-500/20 border border-teal-400/50 text-white font-bold shadow-md'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-teal-400 animate-pulse' : 'bg-slate-500'}`} />
                        <span className="truncate">{feat.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 ml-2 whitespace-nowrap">
                        {feat.side.includes('Left') ? 'Left' : feat.side.includes('Right') ? 'Right' : 'Center'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
