'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface NeuralInterfaceProps {
  active?: boolean;
  complexity?: 'low' | 'medium' | 'high';
  color?: string;
  className?: string;
  pulseRate?: number;
  showDataStreams?: boolean;
}

/**
 * Neural Interface Component
 * 
 * A futuristic 3D neural network visualization using Three.js
 * Creates an animated network of nodes and connections that reacts to data
 */
export default function NeuralInterface({
  active = true,
  complexity = 'medium',
  color = '#00ff41',
  className = '',
  pulseRate = 1.5,
  showDataStreams = true
}: NeuralInterfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const nodesRef = useRef<THREE.Mesh[]>([]);
  const edgesRef = useRef<THREE.Line[]>([]);
  const dataStreamParticlesRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number>(0);
  
  // Determine node count based on complexity
  const getNodeCount = () => {
    switch (complexity) {
      case 'low': return 50;
      case 'high': return 200;
      case 'medium':
      default: return 100;
    }
  };

  // Initialize and clean up Three.js
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    
    // Setup Three.js if container exists
    if (containerRef.current) {
      // Scene setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      
      // Camera setup with wide FOV for dramatic effect
      const camera = new THREE.PerspectiveCamera(
        75, 
        containerRef.current.clientWidth / containerRef.current.clientHeight, 
        0.1, 
        1000
      );
      camera.position.z = 15;
      cameraRef.current = camera;
      
      // Renderer with post-processing for cyberpunk glow
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
      });
      renderer.setSize(
        containerRef.current.clientWidth, 
        containerRef.current.clientHeight
      );
      renderer.setClearColor(0x000000, 0);
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;
      
      // Create neural network
      createNeuralNetwork(scene, getNodeCount());
      
      // Add data stream particles if enabled
      if (showDataStreams) {
        createDataStreamParticles(scene);
      }
      
      // Start animation
      const animate = () => {
        frameIdRef.current = requestAnimationFrame(animate);
        
        // Rotate the entire network slowly
        scene.rotation.y += 0.001;
        scene.rotation.x += 0.0005;
        
        // Pulse the nodes
        animateNodes(active, pulseRate);
        
        // Animate data particles
        if (showDataStreams && dataStreamParticlesRef.current) {
          animateDataParticles();
        }
        
        renderer.render(scene, camera);
      };
      
      animate();
      
      // Handle window resize
      const handleResize = () => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
        
        cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(
          containerRef.current.clientWidth, 
          containerRef.current.clientHeight
        );
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(frameIdRef.current);
        
        if (rendererRef.current && rendererRef.current.domElement && containerRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        
        // Dispose geometries and materials
        nodesRef.current.forEach(node => {
          node.geometry.dispose();
          (node.material as THREE.Material).dispose();
        });
        
        edgesRef.current.forEach(edge => {
          edge.geometry.dispose();
          (edge.material as THREE.Material).dispose();
        });
        
        if (dataStreamParticlesRef.current) {
          dataStreamParticlesRef.current.geometry.dispose();
          (dataStreamParticlesRef.current.material as THREE.Material).dispose();
        }
      };
    }
  }, [active, complexity, pulseRate, showDataStreams]);
  
  // Create neural network nodes and connections
  const createNeuralNetwork = (scene: THREE.Scene, nodeCount: number) => {
    const nodes: THREE.Mesh[] = [];
    const edges: THREE.Line[] = [];
    
    // Parse color to RGB for custom shaders
    const colorValue = new THREE.Color(color);
    
    // Create nodes
    const nodeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const nodeMaterial = new THREE.MeshBasicMaterial({ 
      color: colorValue,
      transparent: true,
      opacity: 0.8
    });
    
    // Create nodes in layers (more structured than random placement)
    const layers = 5;
    const nodesPerLayer = Math.ceil(nodeCount / layers);
    
    for (let layer = 0; layer < layers; layer++) {
      for (let i = 0; i < nodesPerLayer && nodes.length < nodeCount; i++) {
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
        
        // Position in a layered structure with some randomness
        node.position.x = (Math.random() * 10) - 5;
        node.position.y = (Math.random() * 10) - 5;
        node.position.z = (layer * 5) - 10; // Distribute layers in z-axis
        
        // Store original scale for pulsing animation
        (node as any).originalScale = Math.random() * 0.5 + 0.5; 
        node.scale.set(
          (node as any).originalScale, 
          (node as any).originalScale, 
          (node as any).originalScale
        );
        
        // Add to scene and references
        scene.add(node);
        nodes.push(node);
      }
    }
    
    // Create connections between nodes
    const edgeGeometry = new THREE.BufferGeometry();
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: colorValue,
      transparent: true, 
      opacity: 0.3
    });
    
    // Connect nodes within layers and between adjacent layers
    for (let i = 0; i < nodes.length; i++) {
      // Calculate node layer
      const nodeLayer = Math.floor(i / nodesPerLayer);
      
      // Connect to several random nodes in the same or adjacent layers
      const connectionsCount = Math.floor(Math.random() * 3) + 2;
      
      for (let c = 0; c < connectionsCount; c++) {
        // Determine which layer to connect to (same, previous, or next)
        let targetLayer = nodeLayer + (Math.floor(Math.random() * 3) - 1);
        targetLayer = Math.max(0, Math.min(layers - 1, targetLayer));
        
        // Pick a random node from that layer
        const startIdx = targetLayer * nodesPerLayer;
        const endIdx = Math.min((targetLayer + 1) * nodesPerLayer, nodes.length);
        const targetIdx = startIdx + Math.floor(Math.random() * (endIdx - startIdx));
        
        if (targetIdx !== i && targetIdx < nodes.length) {
          const points = [
            nodes[i].position.clone(),
            nodes[targetIdx].position.clone()
          ];
          
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(lineGeometry, edgeMaterial.clone());
          
          scene.add(line);
          edges.push(line);
        }
      }
    }
    
    // Store references for animation
    nodesRef.current = nodes;
    edgesRef.current = edges;
  };
  
  // Create data stream particles flowing through the network
  const createDataStreamParticles = (scene: THREE.Scene) => {
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    
    // Generate random particles throughout the scene
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() * 20) - 10;
      positions[i3 + 1] = (Math.random() * 20) - 10;
      positions[i3 + 2] = (Math.random() * 20) - 10;
      
      // Store particle speed for animation
      speeds[i] = Math.random() * 0.05 + 0.01;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    dataStreamParticlesRef.current = particleSystem;
  };
  
  // Animate nodes with pulsing effect
  const animateNodes = (isActive: boolean, rate: number) => {
    if (!nodesRef.current.length) return;
    
    // Calculate pulse multiplier based on time
    const time = Date.now() * 0.001;
    const pulse = isActive ? (Math.sin(time * rate) * 0.2 + 1) : 1;
    
    // Apply pulse to all nodes
    nodesRef.current.forEach(node => {
      const baseScale = (node as any).originalScale || 1;
      
      // Apply pulse with individual variation
      const nodeIndex = nodesRef.current.indexOf(node);
      const phaseOffset = (nodeIndex % 10) * 0.1; // Different nodes pulse at different phases
      const nodePulse = isActive 
        ? (Math.sin((time + phaseOffset) * rate) * 0.2 + 1) 
        : 1;
      
      node.scale.set(
        baseScale * nodePulse,
        baseScale * nodePulse,
        baseScale * nodePulse
      );
      
      // Also pulse opacity for extra effect
      if (isActive) {
        (node.material as THREE.MeshBasicMaterial).opacity = 
          0.5 + Math.sin((time + phaseOffset) * rate) * 0.3;
      }
    });
    
    // Pulse edge opacity for connected look
    edgesRef.current.forEach((edge, index) => {
      if (isActive) {
        const phaseOffset = (index % 12) * 0.1;
        (edge.material as THREE.LineBasicMaterial).opacity = 
          0.1 + Math.sin((time + phaseOffset) * rate) * 0.2;
      }
    });
  };
  
  // Animate data stream particles
  const animateDataParticles = () => {
    if (!dataStreamParticlesRef.current) return;
    
    const positions = (dataStreamParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    const speeds = (dataStreamParticlesRef.current.geometry.attributes.speed as THREE.BufferAttribute).array as Float32Array;
    
    // Move particles along paths
    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;
      
      // Calculate direction vector toward nearest node
      let nearestNode = null;
      let minDist = 1000;
      
      for (const node of nodesRef.current) {
        const dx = node.position.x - positions[i3];
        const dy = node.position.y - positions[i3 + 1];
        const dz = node.position.z - positions[i3 + 2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        if (dist < minDist) {
          minDist = dist;
          nearestNode = node;
        }
      }
      
      if (nearestNode && minDist > 0.5) {
        // Move toward nearest node
        positions[i3] += (nearestNode.position.x - positions[i3]) * speeds[i];
        positions[i3 + 1] += (nearestNode.position.y - positions[i3 + 1]) * speeds[i];
        positions[i3 + 2] += (nearestNode.position.z - positions[i3 + 2]) * speeds[i];
      } else {
        // If close to a node, teleport to a new random position
        positions[i3] = (Math.random() * 20) - 10;
        positions[i3 + 1] = (Math.random() * 20) - 10;
        positions[i3 + 2] = (Math.random() * 20) - 10;
      }
    }
    
    // Update particles
    dataStreamParticlesRef.current.geometry.attributes.position.needsUpdate = true;
  };

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full min-h-[300px] ${className}`}
      style={{ 
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Overlay elements can be added here */}
    </div>
  );
}