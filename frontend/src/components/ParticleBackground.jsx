import React, { useRef, useEffect } from 'react';

export const ParticleBackground = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particles = [];
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = document.documentElement.scrollHeight;
        }
        resizeCanvas();
        const createParticles = () => {
            particles = [];
            let particleCount = (canvas.height * canvas.width) / 12000;
            for(let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                    radius: Math.random() * 1.5 + 1, vx: Math.random() * 0.5 - 0.25, vy: Math.random() * 0.5 - 0.25
                });
            }
        };
        const animate = () => {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx = -p.vx;
                if (p.y < 0 || p.y > canvas.height) p.vy = -p.vy;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(192, 132, 252, 0.4)'; ctx.fill();
            });
        };
        createParticles(); animate();
        window.addEventListener('resize', () => { resizeCanvas(); createParticles(); });
    }, []);
    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0 opacity-20"></canvas>;
};
