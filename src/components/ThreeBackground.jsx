import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/*
 * Classic (gold) scene: church + driving jeep + floating dust.
 */
const ThreeBackground = () => {
  const containerRef = useRef(null);
  const requestRef = useRef(null);

  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const scrollRef = useRef({ progress: 0, targetProgress: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wVal = container.clientWidth || 300;
    const heightVal = container.clientHeight || 560;

    const scene = new THREE.Scene();
    const CAMERA_Z = 8.0;
    const camera = new THREE.PerspectiveCamera(45, wVal / heightVal, 0.1, 100);
    camera.position.z = CAMERA_Z;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(wVal, heightVal);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const css = getComputedStyle(document.documentElement);
    const themeDivider = css.getPropertyValue('--color-divider').trim() || '#E8D9B5';
    const themeAccent = css.getPropertyValue('--color-accent').trim() || '#8B6914';

    const disposables = [];
    const track = (obj) => { disposables.push(obj); return obj; };
    const textureLoader = new THREE.TextureLoader();

    // ------------------------------------------------------------------
    // Dust particles
    // ------------------------------------------------------------------
    const particleCount = 62;
    const particleGeometry = track(new THREE.BufferGeometry());
    const positions = new Float32Array(particleCount * 3);
    const particleData = [];

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 6;
      const y = (Math.random() - 0.5) * 9;
      const z = (Math.random() - 0.5) * 2 - 0.5;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      particleData.push({
        x,
        speed: 0.002 + Math.random() * 0.005,
        phase: Math.random() * Math.PI * 2
      });
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 64;
    const gctx = glowCanvas.getContext('2d');
    const gg = gctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gg.addColorStop(0, themeDivider);
    gg.addColorStop(0.35, themeAccent + '99');
    gg.addColorStop(1, 'rgba(255,255,255,0)');
    gctx.fillStyle = gg;
    gctx.fillRect(0, 0, 64, 64);
    const glowTexture = track(new THREE.CanvasTexture(glowCanvas));

    const particleMaterial = track(new THREE.PointsMaterial({
      size: 0.22,
      map: glowTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.8
    }));

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // ------------------------------------------------------------------
    // Church
    // ------------------------------------------------------------------
    let churchMesh = null;
    const churchTexture = textureLoader.load('/church.png', (texture) => {
      track(texture);
      texture.minFilter = THREE.LinearFilter;
      const geometry = track(new THREE.PlaneGeometry(1, 1));
      const material = track(new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      }));
      churchMesh = new THREE.Mesh(geometry, material);
      churchMesh.position.set(0.0, 0.22, 0.0);
      scene.add(churchMesh);
      handleResize();
    });

    // ------------------------------------------------------------------
    // Jeep
    // ------------------------------------------------------------------
    let jeepMesh = null;
    const jeepTexture = textureLoader.load('/jeep-couple.png', (texture) => {
      track(texture);
      texture.minFilter = THREE.LinearFilter;
      const geometry = track(new THREE.PlaneGeometry(1, 1));
      const material = track(new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthTest: false
      }));
      jeepMesh = new THREE.Mesh(geometry, material);
      jeepMesh.renderOrder = 999;
      jeepMesh.position.set(1.2, -1.45, 2.0);
      scene.add(jeepMesh);
      handleResize();
    });

    // ------------------------------------------------------------------
    // Input / scroll
    // ------------------------------------------------------------------
    const handleMouseMove = (e) => {
      mouseRef.current.set(
        (e.clientX / window.innerWidth) - 0.5,
        (e.clientY / window.innerHeight) - 0.5
      );
    };

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const containerHeight = rect.height || 560;
      const start = viewportHeight;
      const end = (viewportHeight - containerHeight) / 2;
      const progress = (start - rect.top) / (start - end);
      scrollRef.current.targetProgress = Math.max(0, Math.min(1, progress));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    setTimeout(handleScroll, 100);

    const handleResize = () => {
      const w = container.clientWidth || 300;
      const h = container.clientHeight || 560;
      const aspect = w / h;

      const baseAspect = 400 / 560;
      const tanBase = Math.tan((45 * Math.PI) / 360);
      const targetTan = (tanBase * baseAspect) / aspect;
      camera.fov = (Math.atan(targetTan) * 360) / Math.PI;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      const baseVisibleHeight = 2 * Math.tan((45 * Math.PI) / 360) * CAMERA_Z;

      if (churchMesh && churchTexture.image) {
        const a = churchTexture.image.width / churchTexture.image.height;
        const churchHeight = baseVisibleHeight * 0.94;
        churchMesh.scale.set(churchHeight * a, churchHeight, 1);
        churchMesh.position.set(0.0, 0.22, 0.0);
      }
      if (jeepMesh && jeepTexture.image) {
        const a = jeepTexture.image.width / jeepTexture.image.height;
        const jeepHeight = baseVisibleHeight * 0.58;
        jeepMesh.scale.set(jeepHeight * a, jeepHeight, 1);
      }
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      const pTarget = scrollRef.current.targetProgress;
      scrollRef.current.progress += (pTarget - scrollRef.current.progress) * 0.07;
      const eased = scrollRef.current.progress;

      camera.position.x += (mouseRef.current.x * 0.4 - camera.position.x) * 0.05;
      camera.position.y += (-mouseRef.current.y * 0.4 - camera.position.y) * 0.05;
      camera.position.z = CAMERA_Z;
      camera.lookAt(0, 0, 0);

      // Dust particles drift downward
      const positionsAttr = particles.geometry.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        const data = particleData[i];
        data.phase += 0.004;
        data.y -= data.speed;
        if (data.y < -4.5) {
          data.y = 4.5;
          data.x = (Math.random() - 0.5) * 6;
        }
        positionsAttr.setX(i, data.x + Math.sin(data.phase) * 0.12);
        positionsAttr.setY(i, data.y);
      }
      positionsAttr.needsUpdate = true;
      particles.rotation.y = elapsed * 0.012;

      // Church bob
      if (churchMesh) {
        churchMesh.position.y = 0.22 + Math.sin(elapsed * 0.7) * 0.03;
      }

      // Jeep drives in on scroll
      if (jeepMesh) {
        const startThreshold = 0.75;
        const jeepProgress = Math.max(0, (eased - startThreshold) / (1 - startThreshold));
        jeepMesh.position.x = 1.2 - 1.2 * jeepProgress;
        jeepMesh.position.y = -1.45;
        jeepMesh.position.z = 2.0;
        jeepMesh.rotation.y = mouseRef.current.x * 0.18;
      }

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      disposables.forEach((obj) => obj.dispose && obj.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '18px',
        backgroundColor: 'transparent'
      }}
    />
  );
};

export default ThreeBackground;
