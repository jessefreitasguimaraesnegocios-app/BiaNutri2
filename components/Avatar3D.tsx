
import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Avatar3DProps {
    variant?: string; // Kept for class or logic if needed, but mainly visual
    src: string;
    className?: string;
    onInteract?: () => void;
}

const Avatar3D: React.FC<Avatar3DProps> = ({ variant, src, className = '', onInteract }) => {
    const ref = useRef<HTMLDivElement>(null);

    // Motion values for 3D tilt effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();

        // Normalize mouse position from -0.5 to 0.5
        const width = rect.width;
        const height = rect.height;
        const mouseXPos = e.clientX - rect.left;
        const mouseYPos = e.clientY - rect.top;

        const xPct = (mouseXPos / width) - 0.5;
        const yPct = (mouseYPos / height) - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onInteract}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={`relative cursor-pointer perspective-1000 ${className}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <div
                className="relative w-64 h-64 md:w-80 md:h-80 transition-all duration-300 pointer-events-none"
                style={{ transform: "translateZ(20px)" }}
            >
                {/* Holographic/Shadow effect base */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-xl opacity-50 transform translate-y-4" />

                <img
                    src={src}
                    alt="Panda Avatar"
                    className="w-full h-full object-contain filter drop-shadow-2xl"
                    style={{
                        // Basic crop to hide other sprites if needed, 
                        // but since user approved the sheet, we show it all or just center it.
                        // For a "card" effect, showing the full sheet is acceptable as a "collection item", 
                        // or better, let's assume the user will pick one status. 
                        // For now, rendering full image.
                    }}
                />
            </div>
        </motion.div>
    );
};

export default Avatar3D;
