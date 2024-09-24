import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

function getFullscreenTriangle() {
  const geometry = new THREE.BufferGeometry()
  const vertices = new Float32Array([-1, -1, 3, -1, -1, 3])
  const uvs = new Float32Array([0, 0, 2, 0, 0, 2])

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 2))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

  return geometry
}

// Basic shader postprocess based on the template https://gist.github.com/RenaudRohlinger/bd5d15316a04d04380e93f10401c40e7
// USAGE: Simply call usePostprocess hook in your r3f component to apply the shader to the canvas as a postprocess effect
const usePostProcess = () => {
 
  return null
}

export default usePostProcess
