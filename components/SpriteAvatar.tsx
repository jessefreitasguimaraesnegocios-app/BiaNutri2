
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type AvatarVariant = 'baby_panda' | 'fitness_panda' | 'chef_panda' | 'gamer_panda';
export type AvatarPose = 'idle' | 'wave' | 'walking' | 'happy' | 'sad' | 'thinking' | 'pointing';

interface SpriteAvatarProps {
    variant: AvatarVariant;
    pose: AvatarPose;
    className?: string;
    onClick?: () => void;
}

// Configuration for the sprite sheets
// Assuming the generated sheets are roughly 3x3 or 4x3 grids.
// We will define "crop windows" (percentage coordinates) for each pose.
// Since AI generation varies, these are estimates that might need tuning.
const POSE_MAP: Record<AvatarPose, { x: number; y: number; scale: number }> = {
    idle: { x: 0, y: 0, scale: 1 },    // Top-Left
    wave: { x: 100, y: 0, scale: 1 },    // Top-Right ish (assuming 3 cols)
    walking: { x: 50, y: 0, scale: 1 },    // Top-Center
    happy: { x: 0, y: 50, scale: 1 },    // Middle-Left
    pointing: { x: 50, y: 50, scale: 1 },    // Middle-Center
    thinking: { x: 100, y: 50, scale: 1 },    // Middle-Right
    sad: { x: 50, y: 100, scale: 1 },    // Bottom-Center
};

// We'll use a 3x3 grid assumption:
// 0,0  50,0  100,0
// 0,50 50,50 100,50
// 0,100 ...
// This maps to background-position percentages.

const SpriteAvatar: React.FC<SpriteAvatarProps> = ({ variant, pose, className = '', onClick }) => {

    const getAssetPath = (v: AvatarVariant) => {
        switch (v) {
            case 'baby_panda': return '/assets/avatars/baby_panda.png';
            case 'fitness_panda': return '/assets/avatars/fitness_panda.png';
            case 'chef_panda': return '/assets/avatars/chef_panda.png';
            case 'gamer_panda': return '/assets/avatars/gamer_panda.png';
            default: return '/assets/avatars/baby_panda.png';
        }
    };

    // Animation variants for the "Container" itself to breathe/move
    const containerVariants = {
        idle: { y: [0, -5, 0], transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } },
        walking: { x: [-2, 2, -2], rotate: [-1, 1, -1], transition: { repeat: Infinity, duration: 0.5 } },
        happy: { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 0.8 } },
        sad: { y: 5, rotate: 5 },
        thinking: { rotate: [0, 5, 0, -5, 0], transition: { repeat: Infinity, duration: 2 } },
        wave: { rotate: [0, 10, 0, 10, 0], transition: { repeat: Infinity, duration: 1 } },
        pointing: { x: [0, 5, 0], transition: { repeat: Infinity, duration: 1 } }
    };

    const currentPose = POSE_MAP[pose] || POSE_MAP.idle;

    return (
        <motion.div
            className={`relative overflow-hidden cursor-pointer ${className}`}
            onClick={onClick}
            variants={containerVariants as any}
            animate={pose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Sprite Viewer Window */}
            {/* We utilize a div with background-image to "crop" the sprite sheet */}
            <div
                className="w-full h-full"
                style={{
                    backgroundImage: `url(${getAssetPath(variant)})`,
                    backgroundSize: '300%', // Zooming in to show ~1/3rd of the width (3 cols)
                    backgroundPosition: `${currentPose.x}% ${currentPose.y}%`,
                    backgroundRepeat: 'no-repeat',
                    filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.2))'
                }}
                role="img"
                aria-label={`Panda avatar sleeping in ${pose} pose`}
            />
        </motion.div>
    );
};

export default SpriteAvatar;
