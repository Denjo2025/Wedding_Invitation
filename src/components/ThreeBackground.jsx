import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground = () => {
  const containerRef = useRef(null);
  const requestRef = useRef(null);
  
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const scrollRef = useRef({ progress: 0, targetProgress: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let wVal = container.clientWidth || 300;
    let heightVal = container.clientHeight || 560;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, wVal / heightVal, 0.1, 100);
    camera.position.z = 8.0; 

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(wVal, heightVal);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particles Setup
    const particleCount = 45;
    const particleGeometry = new THREE.BufferGeometry();
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
        x, y, z,
        speedY: 0.003 + Math.random() * 0.005,
        speedX: (Math.random() - 0.5) * 0.0015,
        phase: Math.random() * Math.PI * 2
      });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 16;
    particleCanvas.height = 16;
    const pCtx = particleCanvas.getContext('2d');
    const radialGrad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
    radialGrad.addColorStop(0, 'rgba(232, 217, 181, 1)');
    radialGrad.addColorStop(0.4, 'rgba(201, 168, 76, 0.6)');
    radialGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    pCtx.fillStyle = radialGrad;
    pCtx.fillRect(0, 0, 16, 16);
    const pTexture = new THREE.CanvasTexture(particleCanvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.16,
      map: pTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.8
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Church 
    let churchMesh = null;
    const textureLoader = new THREE.TextureLoader();

    const churchTexture = textureLoader.load('/church.png', (texture) => {
      texture.minFilter = THREE.LinearFilter;
      const churchGeometry = new THREE.PlaneGeometry(1, 1);
      const churchMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      });
      churchMesh = new THREE.Mesh(churchGeometry, churchMaterial);
      churchMesh.position.set(0.0, 0.22, 0.0);
      scene.add(churchMesh);
      handleResize();
    });

    // Jeep 
    let jeepMesh = null;
    const jeepTexture = textureLoader.load('/jeep-couple.png', (texture) => {
      texture.minFilter = THREE.LinearFilter;
      const jeepGeometry = new THREE.PlaneGeometry(1, 1);
      const jeepMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthTest: false
      });
      jeepMesh = new THREE.Mesh(jeepGeometry, jeepMaterial);
      jeepMesh.renderOrder = 999;
      jeepMesh.position.set(1.2, -1.45, 2.0);
      scene.add(jeepMesh);
      handleResize();
    });

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseRef.current.set(x, y);
    };

    const handleScroll = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const containerHeight = rect.height || 560;
      const start = viewportHeight;
      const end = (viewportHeight - containerHeight) / 2;
      const current = rect.top;
      let progress = (start - current) / (start - end);
      progress = Math.max(0, Math.min(1, progress));
      scrollRef.current.targetProgress = progress;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    setTimeout(handleScroll, 100);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 300;
      const h = container.clientHeight || 560;
      const aspect = w / h;

      // Smart FOV matching the new container aspect ratio
      const baseAspect = 400 / 560; 
      const baseFov = 45;
      const tanBase = Math.tan((baseFov * Math.PI) / 360);
      const targetTan = (tanBase * baseAspect) / aspect;
      camera.fov = (Math.atan(targetTan) * 360) / Math.PI;

      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      const distance = camera.position.z; 
      const baseVisibleHeight = 2 * Math.tan((45 * Math.PI) / 360) * distance; 

      if (churchMesh && churchTexture.image) {
        const churchAspect = churchTexture.image.width / churchTexture.image.height;
        // Removed the aspectScale shrinking so it stays proportionately large!
        const churchHeight = baseVisibleHeight * 0.94; 
        const churchWidth = churchHeight * churchAspect;
        churchMesh.scale.set(churchWidth, churchHeight, 1);
        churchMesh.position.set(0.0, 0.22, 0.0);
      }

      if (jeepMesh && jeepTexture.image) {
        const jeepAspect = jeepTexture.image.width / jeepTexture.image.height;
        const jeepHeight = baseVisibleHeight * 0.58; 
        const jeepWidth = jeepHeight * jeepAspect;
        jeepMesh.scale.set(jeepWidth, jeepHeight, 1);
      }
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      const pCurrent = scrollRef.current.progress;
      const pTarget = scrollRef.current.targetProgress;
      scrollRef.current.progress += (pTarget - pCurrent) * 0.07;
      const easedProgress = scrollRef.current.progress;

      const targetCamX = mouseRef.current.x * 0.4;
      const targetCamY = -mouseRef.current.y * 0.4;
      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      if (churchMesh) {
        const churchBob = Math.sin(elapsed * 0.7) * 0.03;
        churchMesh.position.y = 0.22 + churchBob;
      }

      if (jeepMesh) {
        const elapsed = clock.getElapsedTime();
        const delay = 2.0;
        const driveInDuration = 1.0;
        const endX = 0;

        let targetX;
        if (elapsed < delay) {
          targetX = 3.0;
        } else {
          const driveProgress = Math.min(1, (elapsed - delay) / driveInDuration);
          const arrivalX = 3.0 + (1.2 - 3.0) * driveProgress;
          const scrollTargetX = 1.2 - ((1.2 - endX) * easedProgress);
          targetX = Math.max(arrivalX, scrollTargetX);
        }

        jeepMesh.position.x = targetX;
        jeepMesh.position.y = -1.45;
        jeepMesh.position.z = 2.0;
        const hoverRotY = mouseRef.current.x * 0.18;
        jeepMesh.rotation.z = 0;
        jeepMesh.rotation.y = hoverRotY;
      }

      const positionsAttr = particles.geometry.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        const data = particleData[i];
        data.y -= data.speedY;
        data.phase += 0.004;
        const driftX = data.x + Math.sin(data.phase) * 0.12;
        if (data.y < -4.5) {
          data.y = 4.5;
          data.x = (Math.random() - 0.5) * 6;
        }
        positionsAttr.setY(i, data.y);
        positionsAttr.setX(i, driftX);
      }
      positionsAttr.needsUpdate = true;
      particles.rotation.y = elapsed * 0.012;

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
      particles.geometry.dispose();
      particleMaterial.dispose();
      pTexture.dispose();
      if (churchMesh) {
        churchMesh.geometry.dispose();
        churchMesh.material.dispose();
        churchTexture.dispose();
      }
      if (jeepMesh) {
        jeepMesh.geometry.dispose();
        jeepMesh.material.dispose();
        jeepTexture.dispose();
      }
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