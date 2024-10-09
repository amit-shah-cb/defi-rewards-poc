import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass';
import { RenderPixelatedPass } from 'three/examples/jsm/postprocessing/RenderPixelatedPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { Canvas, extend, Object3DNode, useFrame, useThree } from '@react-three/fiber';
import { Vector2, WebGLRenderTarget } from 'three';
import { useRef, useEffect } from 'react';

import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader'
import { BlendShader } from 'three/examples/jsm/shaders/BlendShader'

extend({
  RenderPass,
  EffectComposer,
  OutlinePass,
  DotScreenPass,
  RenderPixelatedPass,
  UnrealBloomPass,
});

declare global {
  namespace JSX {
    interface IntrinsicElements {
      outlinePass: Object3DNode<OutlinePass, typeof OutlinePass>;
      dotScreenPass: Object3DNode<DotScreenPass, typeof DotScreenPass>;
      renderPixelatedPass: Object3DNode<RenderPixelatedPass, typeof RenderPixelatedPass>;
      unrealBloomPass: Object3DNode<UnrealBloomPass, typeof UnrealBloomPass>;
    }
  }
}

export interface ThreeEffectsProps {
    motionBlurEnabled: boolean;
    }

// Uncomment the passes you want to use
export const ThreeEffects = ({motionBlurEnabled}:ThreeEffectsProps) => {
  const { camera, gl, scene } = useThree();
  const composer = useRef<EffectComposer>();

  useEffect(() => {
    composer.current = new EffectComposer(gl);
    composer.current.addPass(new RenderPass(scene, camera));

   
   
    // const pixelatedPass = new RenderPixelatedPass(6, scene, camera);
    // composer.current.addPass(pixelatedPass);

    const bloomPass = new UnrealBloomPass(
      new Vector2(window.innerWidth, window.innerHeight),
      .7,
      .5,
      1.4
    );
    composer.current.addPass(bloomPass);
    
    if(motionBlurEnabled){
        // save pass
        const savePass = new SavePass(new WebGLRenderTarget(window.innerWidth, window.innerHeight))

        // blend pass
        const blendPass = new ShaderPass(BlendShader, 'tDiffuse1')
        blendPass.uniforms['tDiffuse2'].value = savePass.renderTarget.texture
        blendPass.uniforms['mixRatio'].value = .95

        // output pass
        const outputPass = new ShaderPass(CopyShader)
        composer.current.addPass(blendPass)
        composer.current.addPass(savePass)
        composer.current.addPass(outputPass)
    }
    // const dotScreenPass = new DotScreenPass(
    //   new Vector2(window.innerWidth, window.innerHeight),
    //   0.5,
    //   0.8
    // );
    // composer.current.addPass(dotScreenPass);

    // const outlinePass = new OutlinePass(new Vector2(window.innerWidth, window.innerHeight), scene, camera);
    // composer.current.addPass(outlinePass);

    // Resize the composer when the window size changes
    composer.current.setSize(window.innerWidth, window.innerHeight);
  }, [gl, scene, camera]);

  useFrame(() => {
    composer.current?.render();
  }, 1);

  return null;
};