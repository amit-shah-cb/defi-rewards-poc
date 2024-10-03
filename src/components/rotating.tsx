import React, { useRef, useState, useEffect, use } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, animated, easings } from '@react-spring/three';
import { set } from 'zod';

export const RotatingCircle = () => {
  const debugMap = useLoader(THREE.TextureLoader, 'https://threejs.org/examples/textures/uv_grid_opengl.jpg')
  const meshRef = useRef();
  const [isRotating, setIsRotating] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const rotationSpeed = Math.PI * .15;

  const [springProps, setSpringProps] = useSpring(() => ({
    rotation: 0,
    config: {
      duration: 1000,
      easing: easings.easeInQuad,
    },
  }));

  useFrame((state, delta) => {
    if (isRotating) {
        // console.log("rotating:",(meshRef.current as any).rotation.z);
      (meshRef.current as any).rotation.z+= rotationSpeed;
    }
  });

  useEffect(() => {
    if (isStopping) {
      const currentRotation = (meshRef.current as any).rotation.z;
    //   console.log("current:",currentRotation);
    //   console.log("rotations:",Math.floor(currentRotation / (Math.PI * 2)) * Math.PI * 2 )
      const targetRotation = (Math.floor(currentRotation / (Math.PI * 2)) * Math.PI * 2) + (Math.PI *2) + Math.PI * .25;
    //   console.log("target:",targetRotation);
      setSpringProps({  
        from: { rotation: currentRotation },
        to: { rotation: targetRotation },      
        config: {
          duration: ((targetRotation-currentRotation)/rotationSpeed * 400),
          easing: easings.easeOutElastic,
        },
        onRest: () => {
            setIsStopping(false);
        },
       

      });
    }
  }, [isStopping]);

  const handleStart = () => {
    if (!isRotating) {
      const startRotation = (meshRef.current as any).rotation.z;
      const endRotation = startRotation + Math.PI *2  ; // Full rotation
      setSpringProps({
        from: { rotation: startRotation },
        to: { rotation: endRotation },
        //rotation: endRotation,
        config: {
          duration: 1000,
          easing: easings.easeInCubic,
        },
        onRest: () => {
          setIsRotating(true);
        },
      });
    }
  };

  const handleStop = () => {
    if (isRotating) {
      setIsRotating(false);
      setIsStopping(true);
    //   const currentRotation = (meshRef.current as any).rotation.z;
    //   console.log("current:",currentRotation);
    //   console.log("rotations:",Math.floor(currentRotation / (Math.PI * 2)) * Math.PI * 2 )
    //   const targetRotation = (Math.floor(currentRotation / (Math.PI * 2)) * Math.PI * 2) + Math.PI * 2.25;
    //   console.log("target:",targetRotation);
    //   setSpringProps({  
    //     from: { rotation: currentRotation },
    //     to: { rotation: targetRotation },      
    //     config: {
    //       duration: 1000,
    //       easing: easings.easeOutElastic,
    //     },
    //   });
    }
  };

  useEffect(() => {
    window.addEventListener('startRotation', handleStart);
    window.addEventListener('stopRotation', handleStop);

    return () => {
      window.removeEventListener('startRotation', handleStart);
      window.removeEventListener('stopRotation', handleStop);
    };
  }, [isRotating]);

  return (
    <>
      <animated.mesh 
        ref={meshRef} 
        rotation-z={springProps.rotation}
      >
        <group>
        <mesh position={[0,0,0]} rotation-z={Math.PI}>
            <circleGeometry args={[1, 32, 0, Math.PI *.5]} />
            <meshStandardMaterial color="orange" emissive={new THREE.Color("orange")} emissiveIntensity={1.8}/>
        </mesh>
        <mesh position={[0,0,0]} rotation-z={Math.PI*2}>
            <circleGeometry args={[1, 32, 0, Math.PI *.5]} />
            <meshStandardMaterial color="orange" emissive={new THREE.Color("green")} emissiveIntensity={3.8}/>
        </mesh>
        <mesh position={[0,0,0]} rotation-z={Math.PI*1.5}>
            <circleGeometry args={[1, 32, 0, Math.PI *.5]} />
            <meshStandardMaterial color="blue" emissive={new THREE.Color("blue")} emissiveIntensity={.8}/>
        </mesh>
        <mesh position={[0,0,0]} rotation-z={Math.PI*.5}>
            <circleGeometry args={[1, 32, 0, Math.PI *.5]} />
            <meshStandardMaterial color="red" emissive={new THREE.Color("red")} emissiveIntensity={2.8}/>
        </mesh>
        </group>
      </animated.mesh>
      
      <ambientLight intensity={0.5} />
      {/* <pointLight position={[10, 10, 10]} /> */}
    </>
  );
};
