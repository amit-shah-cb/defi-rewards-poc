import { useFrame, useLoader } from "@react-three/fiber";
import {  useEffect, useRef, useState } from "react";
import { TextureLoader } from 'three/src/loaders/TextureLoader'


import * as THREE from 'three'

export const Circle = () => {
    const debugMap = useLoader(TextureLoader, 'https://threejs.org/examples/textures/uv_grid_opengl.jpg')
    
  const circleRef = useRef();
    useFrame(() => {    
        (circleRef.current as any).rotation.z += .01;
    });

    

  return (
    <mesh ref={circleRef}  >
      <circleGeometry args={[2, 32.0]} />
      {/* <meshMatcapMaterial color={"orange"} /> */}
      <meshBasicMaterial map={debugMap} />
      
    </mesh>
  );
};