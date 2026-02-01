
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

interface PandaModelProps {
    animationState:
    'idle' |
    'scanning' |
    'success' |
    'error' |
    'walk' |
    'sleep' |
    'play' |
    'eat' |
    'lowHealth';
}

const PandaModel: React.FC<PandaModelProps> = ({ animationState }) => {
    const groupRef = useRef<Group>(null);
    const headRef = useRef<Group>(null);
    const leftArmRef = useRef<Group>(null);
    const rightArmRef = useRef<Group>(null);

    useFrame((state) => {
        if (!groupRef.current || !headRef.current) return;
        const t = state.clock.getElapsedTime();

        // Base Idle Animation
        if (animationState === 'idle') {
            // Breathing vertical
            groupRef.current.position.y = Math.sin(t * 2) * 0.1 - 0.5;
            // Gentle rotation
            groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
            // Head bob
            headRef.current.rotation.x = Math.sin(t * 1.5) * 0.05;

            // Arms relaxed
            if (leftArmRef.current) leftArmRef.current.rotation.z = -0.5 + Math.sin(t) * 0.1;
            if (rightArmRef.current) rightArmRef.current.rotation.z = 0.5 - Math.sin(t) * 0.1;
        }

        // Scanning Animation (Attention)
        if (animationState === 'scanning') {
            // Lean forward
            groupRef.current.rotation.x = 0.2;
            groupRef.current.position.z = 0.5;
            groupRef.current.position.y = -0.5; // Reset height
            // Head looking around
            headRef.current.rotation.y = Math.sin(t * 5) * 0.3;

            // Arms up (typing/holding lens)
            if (leftArmRef.current) leftArmRef.current.rotation.x = -1.5;
            if (rightArmRef.current) rightArmRef.current.rotation.x = -1.5;
            if (leftArmRef.current) leftArmRef.current.rotation.z = 0;
            if (rightArmRef.current) rightArmRef.current.rotation.z = 0;
        }

        // Success Animation
        if (animationState === 'success') {
            // Jump
            groupRef.current.position.y = Math.abs(Math.sin(t * 8)) * 0.5 - 0.5;
            // Spin head
            headRef.current.rotation.y += 0.1;

            // Arms cheering
            if (leftArmRef.current) leftArmRef.current.rotation.z = 2.5;
            if (rightArmRef.current) rightArmRef.current.rotation.z = -2.5;
            if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
            if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
        }

        // Error Animation
        if (animationState === 'error') {
            // Head shake
            headRef.current.rotation.z = Math.sin(t * 15) * 0.2;
            groupRef.current.rotation.x = 0.5; // Look down
            groupRef.current.position.y = -0.5;
        }

        // WALK
        if (animationState === 'walk') {
            groupRef.current.position.y = Math.sin(t * 6) * 0.05 - 0.5;
            groupRef.current.position.x = Math.sin(t * 2) * 0.05;
            groupRef.current.position.z = Math.cos(t * 2) * 0.05;

            // head bouncing
            headRef.current.rotation.x = Math.sin(t * 4) * 0.08;

            // arms swinging
            if (leftArmRef.current) leftArmRef.current.rotation.z = -0.5 + Math.sin(t * 4) * 0.4;
            if (rightArmRef.current) rightArmRef.current.rotation.z = 0.5 - Math.sin(t * 4) * 0.4;
        }

        // SLEEP
        if (animationState === 'sleep') {
            groupRef.current.rotation.x = -0.4;
            groupRef.current.position.y = -0.7;

            headRef.current.rotation.x = -0.5;

            // breathing while sleeping
            groupRef.current.position.y = Math.sin(t * 1.2) * 0.03 - 0.7;

            // arms down relaxed 
            if (leftArmRef.current) leftArmRef.current.rotation.z = -0.8;
            if (rightArmRef.current) rightArmRef.current.rotation.z = 0.8;
            if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
            if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
        }

        // PLAY (jumping + waving)
        if (animationState === 'play') {
            groupRef.current.position.y = Math.abs(Math.sin(t * 6)) * 0.4 - 0.3;

            // waving arms
            if (leftArmRef.current) leftArmRef.current.rotation.z = Math.sin(t * 10) * 1.2;
            if (rightArmRef.current) rightArmRef.current.rotation.z = Math.sin(t * 10) * -1.2;

            headRef.current.rotation.y = Math.sin(t * 2) * 0.3;
        }

        // EAT
        if (animationState === 'eat') {
            // head bobbing forward
            headRef.current.rotation.x = Math.sin(t * 5) * 0.3 - 0.5;

            // arms up like holding food
            if (leftArmRef.current) leftArmRef.current.rotation.x = -1;
            if (rightArmRef.current) rightArmRef.current.rotation.x = -1;
            if (leftArmRef.current) leftArmRef.current.rotation.z = 0;
            if (rightArmRef.current) rightArmRef.current.rotation.z = 0;

            // small body wiggles
            groupRef.current.rotation.z = Math.sin(t * 3) * 0.05;
        }

        // LOW HEALTH (tired)
        if (animationState === 'lowHealth') {
            groupRef.current.rotation.x = 0.3;
            groupRef.current.position.y = -0.6;

            headRef.current.rotation.x = 0.3;
            headRef.current.rotation.z = Math.sin(t * 10) * 0.05;

            // arms dropping
            if (leftArmRef.current) leftArmRef.current.rotation.z = -1;
            if (rightArmRef.current) rightArmRef.current.rotation.z = 1;
        }
    });

    // Materials
    const blackMat = <meshStandardMaterial color="#333" roughness={0.6} />;
    const whiteMat = <meshStandardMaterial color="#fefefe" roughness={0.5} />;

    return (
        <group ref={groupRef} dispose={null} scale={[1.08, 1.08, 1.08]} position={[0, -0.5, 0]}>
            {/* --- BODY --- */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.65, 32, 32]} />
                {whiteMat}
            </mesh>

            {/* --- HEAD GROUP --- */}
            <group ref={headRef} position={[0, 0.9, 0]}>
                {/* Head Shape */}
                <mesh>
                    <sphereGeometry args={[0.55, 32, 32]} />
                    {whiteMat}
                </mesh>

                {/* Ears */}
                <mesh position={[-0.45, 0.45, 0]}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    {blackMat}
                </mesh>
                <mesh position={[0.45, 0.45, 0]}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    {blackMat}
                </mesh>

                {/* Eyes */}
                {/* Patch */}
                <mesh position={[-0.2, 0.1, 0.45]} rotation={[0, 0.2, 0]} scale={[1, 1.2, 0.5]}>
                    <sphereGeometry args={[0.16, 16, 16]} />
                    {blackMat}
                </mesh>
                <mesh position={[0.2, 0.1, 0.45]} rotation={[0, -0.2, 0]} scale={[1, 1.2, 0.5]}>
                    <sphereGeometry args={[0.16, 16, 16]} />
                    {blackMat}
                </mesh>
                {/* Eyeballs */}
                <mesh position={[-0.2, 0.12, 0.52]}>
                    <sphereGeometry args={[0.05, 12, 12]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                <mesh position={[0.2, 0.12, 0.52]}>
                    <sphereGeometry args={[0.05, 12, 12]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                {/* Pupils */}
                <mesh position={[-0.19, 0.12, 0.56]}>
                    <sphereGeometry args={[0.02, 8, 8]} />
                    <meshStandardMaterial color="black" />
                </mesh>
                <mesh position={[0.21, 0.12, 0.56]}>
                    <sphereGeometry args={[0.02, 8, 8]} />
                    <meshStandardMaterial color="black" />
                </mesh>

                {/* Nose */}
                <mesh position={[0, -0.05, 0.5]}>
                    <sphereGeometry args={[0.06, 16, 16]} />
                    {blackMat}
                </mesh>
            </group>

            {/* --- LIMBS --- */}
            {/* Arms */}
            <group ref={leftArmRef} position={[-0.55, 0.3, 0]}>
                <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0.3]}>
                    <capsuleGeometry args={[0.15, 0.5, 4, 8]} />
                    {blackMat}
                </mesh>
            </group>
            <group ref={rightArmRef} position={[0.55, 0.3, 0]}>
                <mesh position={[0, -0.2, 0]} rotation={[0, 0, -0.3]}>
                    <capsuleGeometry args={[0.15, 0.5, 4, 8]} />
                    {blackMat}
                </mesh>
            </group>

            {/* Legs */}
            <mesh position={[-0.35, -0.5, 0.3]} rotation={[-1, 0.2, 0]}>
                <capsuleGeometry args={[0.16, 0.4, 4, 8]} />
                {blackMat}
            </mesh>
            <mesh position={[0.35, -0.5, 0.3]} rotation={[-1, -0.2, 0]}>
                <capsuleGeometry args={[0.16, 0.4, 4, 8]} />
                {blackMat}
            </mesh>

            {/* Tail - small stub */}
            <mesh position={[0, -0.4, -0.5]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                {blackMat}
            </mesh>

        </group>
    );
};

export default PandaModel;
