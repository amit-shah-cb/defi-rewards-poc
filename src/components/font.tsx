"use client";

import { useAccount, useBalance, useEnsName, useWatchContractEvent } from "wagmi";
import { bytesToBigInt, formatBlock, formatUnits } from "viem";
import {  useEffect, useRef, useState } from "react";

import * as THREE from 'three'

import { extend, Object3DNode, useFrame} from '@react-three/fiber'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'

declare module "@react-three/fiber" {
  interface ThreeElements {
    textGeometry: Object3DNode<TextGeometry, typeof TextGeometry>;
  }
}

import * as typewriter from '@/fonts/typewriter.json';
import * as britney from '@/fonts/britney.json';
export const typeWriterFont = new FontLoader().parse(typewriter);
export const britneyFont = new FontLoader().parse(britney) ;

