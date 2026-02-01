
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import Panda from './Panda';

interface VirtualPetSceneProps {
    animationName: string;
    message?: string;
    modelType?: 'glb' | 'fbx' | 'auto';
    url?: string;
}

const VirtualPetScene: React.FC<VirtualPetSceneProps> = ({ animationName, message, modelType = 'auto', url }) => {
    return (
        <div className="w-full h-full relative">
            <Canvas shadows camera={{ position: [0, 1, 4], fov: 45 }}>
                <ambientLight intensity={1} />
                <directionalLight position={[3, 3, 3]} intensity={1} castShadow />

                <Suspense fallback={null}>
                    {/* Only render Panda if url is provided, or rely on internal defaults if not? 
                        The new Panda component strictly requires URL for non-auto.
                        But wait, the new Panda component has url as REQUIRED.
                        So we MUST pass it. If not provided here, we might fail.
                        Let's make sure pass it. */}
                    <Panda animation={animationName} modelType={modelType} url={url!} />

                    {/* Speech Bubble attached to 3D space */}
                    {message && (
                        <Html position={[0, 2.2, 0]} center className="pointer-events-none w-max">
                            <div className="bg-white dark:bg-slate-800 p-2 px-4 rounded-xl shadow-lg border-2 border-brand-100 dark:border-brand-900 animate-in fade-in zoom-in duration-300">
                                <p className="text-sm font-bold text-slate-700 dark:text-brand-300 whitespace-nowrap">
                                    {message}
                                </p>
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 rotate-45 border-b-2 border-r-2 border-brand-100 dark:border-brand-900"></div>
                            </div>
                        </Html>
                    )}
                </Suspense>

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 1.5}
                />
            </Canvas>
        </div>
    );
};

export default VirtualPetScene;
