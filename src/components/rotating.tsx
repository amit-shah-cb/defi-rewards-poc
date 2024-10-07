import React, { useRef, useState, useEffect, useMemo} from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { MeshReflectorMaterial, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, animated, easings } from '@react-spring/three';
import { typeWriterFont,britneyFont } from '@/components/font';


export interface ArcItem{
    text: string;
    textColor:string;
    color: string;
    winString?: string;
    translation?: THREE.Vector3;
}
export interface RotatingCircleProps {
  items: ArcItem[];
  rarity?: number;
}
export function Triangle() {
  const geometry = useMemo(() => {
    const vertices = new Float32Array([
      0, 1, 0, // Vertex 1
      -1, -1, 0, // Vertex 2
      1, -1, 0, // Vertex 3
    ]);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    return geometry;
  }, []);

  return (
    <mesh>
      <bufferGeometry attach="geometry" {...geometry} />
      <meshBasicMaterial  color="#c35817" />
    </mesh>
  );
}

export const RotatingCircle = ({items, rarity}:RotatingCircleProps) => {
  const debugMap = useLoader(THREE.TextureLoader, 'https://threejs.org/examples/textures/uv_grid_opengl.jpg')
  const meshRef = useRef();
  const [isRotating, setIsRotating] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [highlightWedge, setHighlightWedge] = useState(0);
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

  const resetWedgeColors = () => {
    items.forEach(function(item:ArcItem,index) {       
        (meshRef.current as any).children[1].children[index].children[0].material.color.set("blue");   
        (meshRef.current as any).children[1].children[index].children[0].material.emissive.set("blue");
        (meshRef.current as any).children[1].children[index].children[0].material.emissiveIntensity = 0.8;
        (meshRef.current as any).children[1].children[index].children[1].material.color.set("white");
    });
  }

  useEffect(() => {
    if(!highlightWedge){
        resetWedgeColors();
    }
  },[highlightWedge]);

  useFrame((state, delta) => {    
    //  console.log("wedgeIndex:",wedgeIndex);
    if (isRotating) {
        // console.log("rotating:",(meshRef.current as any).rotation.z);
      (meshRef.current as any).rotation.z+= rotationSpeed;
    }    
    if(highlightWedge>=1) {
        (meshRef.current as any).children[1].children[highlightWedge-1].children[0].material.color.set("#e56717");   
        (meshRef.current as any).children[1].children[highlightWedge-1].children[0].material.emissive.set("#e56717");
        (meshRef.current as any).children[1].children[highlightWedge-1].children[0].material.emissiveIntensity = 4.3036;
        (meshRef.current as any).children[1].children[highlightWedge-1].children[1].material.color.set("black");

    }
   
  });

  useEffect(() => {
    if (isStopping && rarity>=0) {
        const index = rarity+1;
      const selection = ((index-1) * wedge) + halfPointWedge;
      console.log("selection:",selection);
      const currentRotation = (meshRef.current as any).rotation.z;
      console.log("currentRotation:",currentRotation);
      const targetRotation = (Math.floor(currentRotation / (Math.PI * 2)) * Math.PI * 2)+ 2*(Math.PI *2) - (rarity*wedge) + halfPointWedge;// + selection;// Math.PI * .25;   
      setHighlightWedge(index);            
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
  }, [isStopping,rarity]);

  useEffect(()=>{
    if(!isRotating && !rarity){
        // handleStart();
    }
  },[isRotating,rarity]);

  const handleStart = () => {
    console.log("called handleStart:",rarity);
    if (!isRotating && !rarity) {
      const startRotation = (meshRef.current as any).rotation.z;
      const endRotation = startRotation + Math.PI *2  ; // Full rotation
      setHighlightWedge(0);      
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
    }
  };

  

  useEffect(() => {
    window.addEventListener('startRotation', handleStart);
    window.addEventListener('stopRotation', handleStop);

    return () => {
      window.removeEventListener('startRotation', handleStart);
      window.removeEventListener('stopRotation', handleStop);
    };
  });

  return (
    <>
      <group scale={[.2,.1,1]} position={[0,radius,.1]} rotation-z={Math.PI}>
        <Triangle />
      </group>
      <group>
        
        {/* <mesh position={[0,radius,0]} rotation-z={Math.PI/4} scale={[1.1,1.2,1]}>
                <boxGeometry args={[radius*.3,radius*.3,.2]} />
                <meshBasicMaterial color="orange" opacity={0.1}/>
            </mesh> */}
            <mesh position={[0,0,.01]} rotation-z={Math.PI}>
                <sphereGeometry args={[radius*.15, 128, ]} />
                <meshBasicMaterial color="white"/>
            </mesh>
      </group>
      <animated.mesh 
        ref={meshRef} 
        rotation-z={springProps.rotation}
      >
        <group>
            <mesh position={[0,0,-.3]} rotation-z={Math.PI}>
                <circleGeometry args={[radius+4*wedgeDistance, 128, ]} />
                <meshBasicMaterial color="white"/>
            </mesh>
            
            
        </group>
        <group>
        {items.map(function(item,index) {
        return (

            <group
            key={item.text+index+"group"} 
            rotation-z={Math.PI * (index *(2/items.length))} position={item.translation}>
                <mesh key={item.text+index}>                                        
                    <circleGeometry args={[radius, 32, 0, Math.PI *((2/items.length))] } />
                    <meshStandardMaterial 
                    color={item.color} 
                    emissive={new THREE.Color(item.color)} 
                    emissiveIntensity={.8}
                    side={THREE.DoubleSide}/>
                </mesh>
                {/* <Text
                    key={item.text+index+"text"}
                    scale={[radius/6, radius/6, 0]}
                    color={item.textColor} // default
                    position={ [radius/2.5,radius/2.5,.1]}
                    rotation-z={Math.PI*.25 }
                    // rotate-z={Math.PI * (index *(2/items.length))/2}
                >
                    {(index+1)*100}pts
                </Text> */}
                 <mesh key={item.text+index+"text"} position={ [radius/4,radius/5,.1]} rotation-z={Math.PI*.25 }>              
                      <textGeometry args={[item.text, {font:typeWriterFont, size:0.08, height: .0, depth:0., bevelEnabled:false }]}/>
                      <meshBasicMaterial attach='material' color={item.textColor}/>
                  </mesh>
            </group>
            
        )
        })}
        </group>
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
      </animated.mesh>
     
      <ambientLight intensity={0.5} />
      {/* <pointLight position={[10, 10, 10]} /> */}
      
    </>
  );
};
