import React, { useRef, useState, useEffect, use } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, animated, easings } from '@react-spring/three';
import { set } from 'zod';

export interface ArcItem{
    text: string;
    color: string;
    winString?: string;
    translation?: THREE.Vector3;
}
export interface RotatingCircleProps {
  items: ArcItem[];
}

export const RotatingCircle = ({items}:RotatingCircleProps) => {
  const debugMap = useLoader(THREE.TextureLoader, 'https://threejs.org/examples/textures/uv_grid_opengl.jpg')
  const meshRef = useRef();
  const [isRotating, setIsRotating] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [targetRotation, setTargetRotation] = useState(null);
  const rotationSpeed = Math.PI * .1;

  const [springProps, setSpringProps] = useSpring(() => ({
    rotation: 0,
    config: {
      duration: 1000,
      easing: easings.easeInQuad,
    },
  }));
  const radius = 1;
  const TWO_PI = Math.PI * 2;
  const wedgeDistance = .02;
  const wedge = (TWO_PI/items.length);
  const halfPointWedge= wedge/2;
  const findTranslation = (index:number):THREE.Vector3=>{    
    const rotation = halfPointWedge + (index)*wedge;
    if(rotation <= Math.PI * 0.5|| (rotation >= Math.PI && rotation <= TWO_PI*.75)){
        return new THREE.Vector3(wedgeDistance*Math.cos(rotation),wedgeDistance*Math.sin(rotation),0);
    }else{
        return new THREE.Vector3(-wedgeDistance*Math.sin(rotation),-wedgeDistance*Math.cos(rotation),0);
    }

    }
    items.forEach(function(item:ArcItem,index) {
                const i = index;
                const translation = findTranslation(i);
                items[index].translation = translation;
    })


  useFrame((state, delta) => {
    if (isRotating) {
        // console.log("rotating:",(meshRef.current as any).rotation.z);
      (meshRef.current as any).rotation.z+= rotationSpeed;
    }
  });

  useEffect(() => {
    if (isStopping) {
      const currentRotation = (meshRef.current as any).rotation.z;
      const targetRotation = (Math.floor(currentRotation / (Math.PI * 2)) * Math.PI * 2) + (Math.PI *2) + Math.PI * .25;
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
      //Todo: convert index to rotation
      //setTargetRotation      
      setIsStopping(true);
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
        <mesh position={[0,0,-.2]} rotation-z={Math.PI}>
            <circleGeometry args={[radius+2*wedgeDistance, 128, ]} />
            <meshBasicMaterial color="blue"/>
        </mesh>
        {items.map(function(item,index) {
           
        return (
            
            <mesh key={item.text+index} rotation-z={Math.PI * (index *(2/items.length))} position={item.translation}>
                <circleGeometry args={[radius, 32, 0, Math.PI *((2/items.length))] } />
                <meshStandardMaterial color={item.color} emissive={new THREE.Color(item.color)} emissiveIntensity={1.8}/>
            </mesh>
        )
        })}
        {/* <mesh position={[0,0,0]} rotation-z={Math.PI}>
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
        </mesh> */}
        </group>
      </animated.mesh>
      <ambientLight intensity={0.5} />
      {/* <pointLight position={[10, 10, 10]} /> */}
    </>
  );
};
