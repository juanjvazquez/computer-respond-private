import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath'
import { MathUtils} from 'three';
import { Depth, Displace, Fresnel, LayerMaterial } from 'lamina';
import { Sphere, Environment, Lightformer } from '@react-three/drei'

export const AnimatedBlob = React.memo(AnimatedBlobComponent);

function AnimatedBlobComponent({ isAudioPlaying, displaceProps, ...props }) {
  const ref = useRef();
  const rand = useMemo(() => Math.random(), []);
  const displaceRef = useRef();

  const displaceStrengthRef = useRef(0);
  
  useFrame(({ clock }, dt) => {
    ref.current.position.y = Math.sin(clock.elapsedTime + rand * 100) * 0.1 - 0.2;
  
    displaceRef.current.offset.x += 0.3 * dt;
  
    if (isAudioPlaying) {
      displaceStrengthRef.current = MathUtils.lerp(displaceStrengthRef.current, 0.3, 0.05);
    } else {
      displaceStrengthRef.current = MathUtils.lerp(displaceStrengthRef.current, 0.0, 0.05);
    }
  
    displaceRef.current.strength = displaceStrengthRef.current;
  });
  

  return (
    <group {...props}>
      <pointLight color="#bd00ff" intensity={1} position={[2.5, -3, 2.5]} />
      <pointLight color="#00ff9f" intensity={1} position={[2.5, 3, 2.5]} />
      <pointLight color="#001eff" intensity={0.7} position={[0, 4, -6]} />
      <Sphere
        ref={ref}
        args={[0.2, 128, 128]}
        color={'#DAF7A6'}
        opacity={1}
        transparent={true}
        scale={1}
      >
        <LayerMaterial
          color={'#DAF7A6'}
          lighting={'physical'}
          transmission={0.6}
          roughness={0.1}
          thickness={1}
        >
          <Depth
            near={0.4854}
            far={0.7661999999999932}
            origin={[-0.4920000000000004, 0.4250000000000003, 0]}
            colorA={'#DAF7A6'}
            colorB={'#DAF7A6'}
          />
          <Displace ref={displaceRef} strength={0} scale={5} offset={[0.09189000000357626, 0, 0]} />
          <Fresnel
            color={'#1F51FF'}
            bias={-0.3430000000000002}
            intensity={3.8999999999999946}
            power={3.3699999999999903}
            factor={1.119999999999999}
            mode={'screen'}
          />
        </LayerMaterial>
      </Sphere>
    </group>
  );
}

export function Env({ ps }) {
  const ref = useRef()
  useFrame((state, delta) => {
    if (!ps) {
      easing.damp3(ref.current.rotation, [Math.PI / 2, 0, state.clock.elapsedTime / 20 + state.pointer.x], 0.2, delta)
    }
  })
  return (
    <Environment frames={ps ? 1 : Infinity} resolution={256} background blur={0.8}>
      <group ref={ref}>
        <Lightformer intensity={2} form="ring" color="#00ff9f" rotation-y={Math.PI / 2} position={[-5, 0, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={2} form="ring" color="#00BCE1" rotation-y={Math.PI *2} position={[-5, -2, -1]} scale={[10, 10, 1]} />
      </group>
    </Environment>
  )
}
