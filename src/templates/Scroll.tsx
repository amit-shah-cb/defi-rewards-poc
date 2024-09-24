// https://github.com/studio-freight/lenis
// TODO refactor for app-directory
// See https://github.com/pmndrs/react-three-next/pull/123

// 1 - wrap <Component {...pageProps} /> with <Scroll /> in _app.jsx
// 2 - add <ScrollTicker /> wherever in the canvas
// 3 - enjoy
import { addEffect, useFrame } from '@react-three/fiber'
import { useEffect } from 'react'
import { useRef } from 'react'
import * as THREE from 'three'

const state = {
  top: 0,
  progress: 0,
}

const { damp } = THREE.MathUtils

export default function Scroll({ children }) {
  const content = useRef(null)
  const wrapper = useRef(null)

  
}

export const ScrollTicker = ({ smooth = 9999999 }) => {
  useFrame(({ viewport, camera }, delta) => {
    camera.position.y = damp(camera.position.y, -state.progress * viewport.height, smooth, delta)
  })

  return null
}
