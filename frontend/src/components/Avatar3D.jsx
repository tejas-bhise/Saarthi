/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState, memo } from 'react';
import { useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";


// ============================================
// 🎭 NATURAL LIP SYNC
// ============================================
const LipSyncManager = ({ scene, isSpeaking, currentText }) => {
  useEffect(() => {
    if (!scene || !isSpeaking || !currentText) return;

    const meshes = [];
    scene.traverse((child) => {
      if (child.isMesh && child.morphTargetInfluences && child.morphTargetDictionary) {
        meshes.push(child);
      }
    });

    if (meshes.length === 0) return;

    let animationFrame = 0;
    let currentPhonemeIndex = 0;

    const applyViseme = () => {
      meshes.forEach(mesh => {
        const dict = mesh.morphTargetDictionary;
        
        Object.keys(dict).forEach(key => {
          if (key.toLowerCase().includes('viseme') || key.toLowerCase().includes('mouth')) {
            mesh.morphTargetInfluences[dict[key]] *= 0.75;
          }
        });

        const visemeKeys = Object.keys(dict).filter(k => 
          k.toLowerCase().includes('viseme') || k.toLowerCase().includes('mouth')
        );
        
        if (visemeKeys.length > 0) {
          const wave = Math.sin(animationFrame * 0.45);
          const isOpening = wave > 0;
          
          if (isOpening) {
            const targetKey = visemeKeys[currentPhonemeIndex % visemeKeys.length];
            const intensity = 0.25 + (Math.abs(wave) * 0.35);
            mesh.morphTargetInfluences[dict[targetKey]] = intensity;
            
            if (animationFrame % 5 === 0) {
              currentPhonemeIndex++;
            }
          }
        }
      });
      animationFrame++;
    };

    const lipSyncInterval = setInterval(applyViseme, 35);

    return () => {
      clearInterval(lipSyncInterval);
      meshes.forEach(mesh => {
        if (mesh.morphTargetInfluences) {
          for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
            mesh.morphTargetInfluences[i] = 0;
          }
        }
      });
    };
  }, [isSpeaking, currentText, scene]);

  return null;
};


// ============================================
// 🎭 FEMALE AVATAR (Priya)
// ============================================
const FemaleAvatar = memo(({ avatarMode, isAISpeaking, currentText, onIntroComplete, skipIntro }) => {
  const group = useRef();
  const mixerRef = useRef();
  const actionsRef = useRef({});
  const currentActionRef = useRef(null);
  const talkingIndexRef = useRef(0);
  const idleIndexRef = useRef(0);
  const danceIndexRef = useRef(0);
  const hasCalledIntroRef = useRef(false);
  const isIdleCycleActiveRef = useRef(true);
  const isTalkingCycleActiveRef = useRef(false);

  const { scene } = useGLTF("/avatars/priya.glb");
  
  const walk1Gltf = useGLTF("/animations/female/F_Walk_002.glb");
  const walk2Gltf = useGLTF("/animations/female/F_Walk_003.glb");
  const dance1Gltf = useGLTF("/animations/female/F_Dances_001.glb");
  const dance2Gltf = useGLTF("/animations/female/F_Dances_004.glb");
  const dance3Gltf = useGLTF("/animations/female/F_Dances_005.glb");
  const dance4Gltf = useGLTF("/animations/female/F_Dances_006.glb");
  const dance5Gltf = useGLTF("/animations/female/F_Dances_007.glb");
  const jog1Gltf = useGLTF("/animations/female/F_Jog_001.glb");
  const idle1Gltf = useGLTF("/animations/female/F_Standing_Idle_001.glb");
  const idleVar1Gltf = useGLTF("/animations/female/F_Standing_Idle_Variations_001.glb");
  const idleVar2Gltf = useGLTF("/animations/female/F_Standing_Idle_Variations_002.glb");
  const idleVar3Gltf = useGLTF("/animations/female/F_Standing_Idle_Variations_003.glb");
  const idleVar4Gltf = useGLTF("/animations/female/F_Standing_Idle_Variations_004.glb");
  const idleVar5Gltf = useGLTF("/animations/female/F_Standing_Idle_Variations_005.glb");
  const idleVar6Gltf = useGLTF("/animations/female/F_Standing_Idle_Variations_006.glb");
  const idleVar7Gltf = useGLTF("/animations/female/F_Standing_Idle_Variations_007.glb");
  const idleVar8Gltf = useGLTF("/animations/female/F_Standing_Idle_Variations_008.glb");
  const idleVar9Gltf = useGLTF("/animations/female/F_Standing_Idle_Variations_009.glb");
  const talk1Gltf = useGLTF("/animations/female/F_Talking_Variations_001.glb");
  const talk2Gltf = useGLTF("/animations/female/F_Talking_Variations_002.glb");
  const talk3Gltf = useGLTF("/animations/female/F_Talking_Variations_003.glb");
  const talk4Gltf = useGLTF("/animations/female/F_Talking_Variations_004.glb");
  const talk5Gltf = useGLTF("/animations/female/F_Talking_Variations_005.glb");
  const talk6Gltf = useGLTF("/animations/female/F_Talking_Variations_006.glb");

  useEffect(() => {
    if (!scene) return;

    mixerRef.current = new THREE.AnimationMixer(scene);

    const animationsData = {
      walk: { clips: walk1Gltf.animations, speed: 0.7 },
      walk2: { clips: walk2Gltf.animations, speed: 0.7 },
      dance1: { clips: dance1Gltf.animations, speed: 0.6 },
      dance2: { clips: dance2Gltf.animations, speed: 0.6 },
      dance3: { clips: dance3Gltf.animations, speed: 0.6 },
      dance4: { clips: dance4Gltf.animations, speed: 0.6 },
      dance5: { clips: dance5Gltf.animations, speed: 0.6 },
      jog: { clips: jog1Gltf.animations, speed: 0.7 },
      idle: { clips: idle1Gltf.animations, speed: 0.6 },
      idleVar1: { clips: idleVar1Gltf.animations, speed: 0.6 },
      idleVar2: { clips: idleVar2Gltf.animations, speed: 0.6 },
      idleVar3: { clips: idleVar3Gltf.animations, speed: 0.6 },
      idleVar4: { clips: idleVar4Gltf.animations, speed: 0.6 },
      idleVar5: { clips: idleVar5Gltf.animations, speed: 0.6 },
      idleVar6: { clips: idleVar6Gltf.animations, speed: 0.6 },
      idleVar7: { clips: idleVar7Gltf.animations, speed: 0.6 },
      idleVar8: { clips: idleVar8Gltf.animations, speed: 0.6 },
      idleVar9: { clips: idleVar9Gltf.animations, speed: 0.6 },
      talk1: { clips: talk1Gltf.animations, speed: 0.7 },
      talk2: { clips: talk2Gltf.animations, speed: 0.7 },
      talk3: { clips: talk3Gltf.animations, speed: 0.7 },
      talk4: { clips: talk4Gltf.animations, speed: 0.7 },
      talk5: { clips: talk5Gltf.animations, speed: 0.7 },
      talk6: { clips: talk6Gltf.animations, speed: 0.7 },
    };

    Object.entries(animationsData).forEach(([name, config]) => {
      if (config.clips?.length > 0) {
        const action = mixerRef.current.clipAction(config.clips[0]);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.timeScale = config.speed;
        actionsRef.current[name] = action;
      }
    });

    if (!hasCalledIntroRef.current && !skipIntro) {
      hasCalledIntroRef.current = true;
      setTimeout(() => {
        playIdleCycle();
        if (onIntroComplete) {
          onIntroComplete({
            message: "Hi! I'm Priya, your Biology tutor. I'm so excited to explore the fascinating world of life sciences with you today!",
            companionId: 'priya_biology',
          });
        }
      }, 800);
    } else if (skipIntro) {
      hasCalledIntroRef.current = true;
      playIdleCycle();
    }

    return () => mixerRef.current?.stopAllAction();
  }, [scene, skipIntro]);

  const playIdleCycle = () => {
    if (!isIdleCycleActiveRef.current || isTalkingCycleActiveRef.current) return;
    const idleVariations = ['idleVar1', 'idleVar2', 'idleVar3', 'idleVar4', 'idleVar5', 'idleVar6', 'idleVar7', 'idleVar8', 'idleVar9'];
    const variation = idleVariations[idleIndexRef.current % idleVariations.length];
    playAnimation(variation, () => {
      idleIndexRef.current++;
      playIdleCycle();
    });
  };

  const playTalkingCycle = () => {
    if (!isTalkingCycleActiveRef.current) {
      isIdleCycleActiveRef.current = true;
      playIdleCycle();
      return;
    }
    const talkingAnimations = ['talk1', 'talk2', 'talk3', 'talk4', 'talk5', 'talk6'];
    const currentTalk = talkingAnimations[talkingIndexRef.current % talkingAnimations.length];
    playAnimation(currentTalk, () => {
      talkingIndexRef.current++;
      if (isTalkingCycleActiveRef.current) {
        playTalkingCycle();
      } else {
        isIdleCycleActiveRef.current = true;
        playIdleCycle();
      }
    });
  };

  const playAnimation = (name, onFinish) => {
    const action = actionsRef.current[name];
    if (!action) {
      onFinish?.();
      return;
    }

    if (currentActionRef.current && currentActionRef.current !== action) {
      currentActionRef.current.fadeOut(0.2);
    }

    action.reset().fadeIn(0.2).play();
    currentActionRef.current = action;

    if (onFinish) {
      const handler = (e) => {
        if (e.action === action) {
          mixerRef.current.removeEventListener("finished", handler);
          onFinish();
        }
      };
      mixerRef.current.addEventListener("finished", handler);
    }
  };

  useEffect(() => {
    if (!actionsRef.current.idleVar1) return;

    if (avatarMode === 'dance') {
      isIdleCycleActiveRef.current = false;
      isTalkingCycleActiveRef.current = false;
      
      const danceAnimations = ['dance1', 'dance2', 'dance3', 'dance4', 'dance5'];
      const danceAnim = danceAnimations[danceIndexRef.current % danceAnimations.length];
      danceIndexRef.current++;
      
      if (actionsRef.current[danceAnim]) {
        const action = actionsRef.current[danceAnim];
        if (currentActionRef.current) currentActionRef.current.fadeOut(0.2);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.reset().fadeIn(0.2).play();
        currentActionRef.current = action;
        
        const handler = () => {
          mixerRef.current.removeEventListener("finished", handler);
          isIdleCycleActiveRef.current = true;
          isTalkingCycleActiveRef.current = false;
          playIdleCycle();
        };
        mixerRef.current.addEventListener("finished", handler);
      }
      return;
    }

    if (avatarMode === 'walk' || avatarMode === 'jog') {
      isIdleCycleActiveRef.current = false;
      isTalkingCycleActiveRef.current = false;
      
      if (actionsRef.current[avatarMode]) {
        const action = actionsRef.current[avatarMode];
        if (currentActionRef.current) currentActionRef.current.fadeOut(0.2);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.reset().fadeIn(0.2).play();
        currentActionRef.current = action;
        
        const handler = () => {
          mixerRef.current.removeEventListener("finished", handler);
          isIdleCycleActiveRef.current = true;
          isTalkingCycleActiveRef.current = false;
          playIdleCycle();
        };
        mixerRef.current.addEventListener("finished", handler);
      }
      return;
    }

    if (isAISpeaking) {
      isIdleCycleActiveRef.current = false;
      isTalkingCycleActiveRef.current = true;
      talkingIndexRef.current = 0;
      playTalkingCycle();
    } else {
      isTalkingCycleActiveRef.current = false;
      isIdleCycleActiveRef.current = true;
      playIdleCycle();
    }
  }, [avatarMode, isAISpeaking]);

  useEffect(() => {
    const clock = new THREE.Clock();
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      mixerRef.current?.update(clock.getDelta());
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <group ref={group}>
      <primitive object={scene} scale={1.6} position={[0, -2.2, 0]} />
      <LipSyncManager scene={scene} isSpeaking={isAISpeaking} currentText={currentText} />
    </group>
  );
});

FemaleAvatar.displayName = 'FemaleAvatar';


// ============================================
// 🎭 MALE AVATAR (Omkar)
// ============================================
const MaleAvatar = memo(({ avatarMode, isAISpeaking, currentText, onIntroComplete, skipIntro }) => {
  const group = useRef();
  const mixerRef = useRef();
  const actionsRef = useRef({});
  const currentActionRef = useRef(null);
  const talkingIndexRef = useRef(0);
  const idleIndexRef = useRef(0);
  const danceIndexRef = useRef(0);
  const hasCalledIntroRef = useRef(false);
  const hasPlayedWaveRef = useRef(false);
  const isIdleCycleActiveRef = useRef(true);
  const isTalkingCycleActiveRef = useRef(false);

  const { scene } = useGLTF("/avatars/omkar.glb");
  
  const walk1Gltf = useGLTF("/animations/male/M_Walk_001.glb");
  const walk2Gltf = useGLTF("/animations/male/M_Walk_002.glb");
  const dance1Gltf = useGLTF("/animations/male/M_Dances_001.glb");
  const dance2Gltf = useGLTF("/animations/male/M_Dances_002.glb");
  const dance3Gltf = useGLTF("/animations/male/M_Dances_003.glb");
  const dance4Gltf = useGLTF("/animations/male/M_Dances_004.glb");
  const dance5Gltf = useGLTF("/animations/male/M_Dances_005.glb");
  const dance6Gltf = useGLTF("/animations/male/M_Dances_006.glb");
  const dance7Gltf = useGLTF("/animations/male/M_Dances_007.glb");
  const dance8Gltf = useGLTF("/animations/male/M_Dances_008.glb");
  const dance9Gltf = useGLTF("/animations/male/M_Dances_009.glb");
  const dance11Gltf = useGLTF("/animations/male/M_Dances_011.glb");
  const waveGltf = useGLTF("/animations/male/M_Standing_Expressions_001.glb");
  const idle1Gltf = useGLTF("/animations/male/M_Standing_Idle_001.glb");
  const idle2Gltf = useGLTF("/animations/male/M_Standing_Idle_002.glb");
  const idleVar1Gltf = useGLTF("/animations/male/M_Standing_Idle_Variations_001.glb");
  const idleVar2Gltf = useGLTF("/animations/male/M_Standing_Idle_Variations_002.glb");
  const idleVar3Gltf = useGLTF("/animations/male/M_Standing_Idle_Variations_003.glb");
  const idleVar4Gltf = useGLTF("/animations/male/M_Standing_Idle_Variations_004.glb");
  const idleVar8Gltf = useGLTF("/animations/male/M_Standing_Idle_Variations_008.glb");
  const talk1Gltf = useGLTF("/animations/male/M_Talking_Variations_001.glb");
  const talk2Gltf = useGLTF("/animations/male/M_Talking_Variations_002.glb");
  const talk3Gltf = useGLTF("/animations/male/M_Talking_Variations_003.glb");
  const talk4Gltf = useGLTF("/animations/male/M_Talking_Variations_004.glb");
  const talk5Gltf = useGLTF("/animations/male/M_Talking_Variations_005.glb");
  const talk6Gltf = useGLTF("/animations/male/M_Talking_Variations_006.glb");
  const talk7Gltf = useGLTF("/animations/male/M_Talking_Variations_007.glb");
  const talk8Gltf = useGLTF("/animations/male/M_Talking_Variations_008.glb");
  const talk9Gltf = useGLTF("/animations/male/M_Talking_Variations_009.glb");
  const talk10Gltf = useGLTF("/animations/male/M_Talking_Variations_010.glb");

  useEffect(() => {
    if (!scene) return;

    mixerRef.current = new THREE.AnimationMixer(scene);

    const animationsData = {
      walk: { clips: walk1Gltf.animations, speed: 0.7 },
      walk2: { clips: walk2Gltf.animations, speed: 0.7 },
      dance1: { clips: dance1Gltf.animations, speed: 0.6 },
      dance2: { clips: dance2Gltf.animations, speed: 0.6 },
      dance3: { clips: dance3Gltf.animations, speed: 0.6 },
      dance4: { clips: dance4Gltf.animations, speed: 0.6 },
      dance5: { clips: dance5Gltf.animations, speed: 0.6 },
      dance6: { clips: dance6Gltf.animations, speed: 0.6 },
      dance7: { clips: dance7Gltf.animations, speed: 0.6 },
      dance8: { clips: dance8Gltf.animations, speed: 0.6 },
      dance9: { clips: dance9Gltf.animations, speed: 0.6 },
      dance11: { clips: dance11Gltf.animations, speed: 0.6 },
      wave: { clips: waveGltf.animations, speed: 0.6 },
      idle1: { clips: idle1Gltf.animations, speed: 0.6 },
      idle2: { clips: idle2Gltf.animations, speed: 0.6 },
      idleVar1: { clips: idleVar1Gltf.animations, speed: 0.6 },
      idleVar2: { clips: idleVar2Gltf.animations, speed: 0.6 },
      idleVar3: { clips: idleVar3Gltf.animations, speed: 0.6 },
      idleVar4: { clips: idleVar4Gltf.animations, speed: 0.6 },
      idleVar8: { clips: idleVar8Gltf.animations, speed: 0.6 },
      talk1: { clips: talk1Gltf.animations, speed: 0.7 },
      talk2: { clips: talk2Gltf.animations, speed: 0.7 },
      talk3: { clips: talk3Gltf.animations, speed: 0.7 },
      talk4: { clips: talk4Gltf.animations, speed: 0.7 },
      talk5: { clips: talk5Gltf.animations, speed: 0.7 },
      talk6: { clips: talk6Gltf.animations, speed: 0.7 },
      talk7: { clips: talk7Gltf.animations, speed: 0.7 },
      talk8: { clips: talk8Gltf.animations, speed: 0.7 },
      talk9: { clips: talk9Gltf.animations, speed: 0.7 },
      talk10: { clips: talk10Gltf.animations, speed: 0.7 },
    };

    Object.entries(animationsData).forEach(([name, config]) => {
      if (config.clips?.length > 0) {
        const action = mixerRef.current.clipAction(config.clips[0]);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.timeScale = config.speed;
        actionsRef.current[name] = action;
      }
    });

    // ✅ SAME TIMING AS PRIYA (800ms)
    if (!hasCalledIntroRef.current && !skipIntro) {
      hasCalledIntroRef.current = true;
      setTimeout(() => {
        playIdleCycle();
        if (onIntroComplete) {
          onIntroComplete({
            message: "Hey there! I'm Omkar, your AI tutor. I'm excited to explore artificial intelligence and machine learning concepts with you today!",
            companionId: 'omkar_ai',
          });
        }
      }, 800); // ✅ CHANGED FROM VARIABLE TO 800ms (same as Priya)
    } else if (skipIntro) {
      hasCalledIntroRef.current = true;
      playIdleCycle();
    }

    return () => mixerRef.current?.stopAllAction();
  }, [scene, skipIntro]);

  const playIdleCycle = () => {
    if (!isIdleCycleActiveRef.current || isTalkingCycleActiveRef.current) return;
    const idleVariations = ['idleVar1', 'idleVar2', 'idleVar3', 'idleVar4', 'idleVar8'];
    const variation = idleVariations[idleIndexRef.current % idleVariations.length];
    playAnimation(variation, () => {
      idleIndexRef.current++;
      playIdleCycle();
    });
  };

  const playTalkingCycle = () => {
    if (!isTalkingCycleActiveRef.current) {
      isIdleCycleActiveRef.current = true;
      playIdleCycle();
      return;
    }
    const talkingAnimations = ['talk1', 'talk2', 'talk3', 'talk4', 'talk5', 'talk6', 'talk7', 'talk8', 'talk9', 'talk10'];
    const currentTalk = talkingAnimations[talkingIndexRef.current % talkingAnimations.length];
    playAnimation(currentTalk, () => {
      talkingIndexRef.current++;
      if (isTalkingCycleActiveRef.current) {
        playTalkingCycle();
      } else {
        isIdleCycleActiveRef.current = true;
        playIdleCycle();
      }
    });
  };

  const playAnimation = (name, onFinish) => {
    const action = actionsRef.current[name];
    if (!action) {
      onFinish?.();
      return;
    }

    if (currentActionRef.current && currentActionRef.current !== action) {
      currentActionRef.current.fadeOut(0.2);
    }

    action.reset().fadeIn(0.2).play();
    currentActionRef.current = action;

    if (onFinish) {
      const handler = (e) => {
        if (e.action === action) {
          mixerRef.current.removeEventListener("finished", handler);
          onFinish();
        }
      };
      mixerRef.current.addEventListener("finished", handler);
    }
  };

  useEffect(() => {
    if (!actionsRef.current.idleVar1) return;

    if (avatarMode === 'wave') {
      isIdleCycleActiveRef.current = false;
      isTalkingCycleActiveRef.current = false;
      
      if (actionsRef.current.wave) {
        const action = actionsRef.current.wave;
        if (currentActionRef.current) currentActionRef.current.fadeOut(0.2);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.reset().fadeIn(0.2).play();
        currentActionRef.current = action;
        
        const handler = () => {
          mixerRef.current.removeEventListener("finished", handler);
          isIdleCycleActiveRef.current = true;
          isTalkingCycleActiveRef.current = false;
          playIdleCycle();
        };
        mixerRef.current.addEventListener("finished", handler);
      }
      return;
    }

    if (avatarMode === 'dance') {
      isIdleCycleActiveRef.current = false;
      isTalkingCycleActiveRef.current = false;
      
      const danceAnimations = ['dance1', 'dance2', 'dance3', 'dance4', 'dance5', 'dance6', 'dance7', 'dance8', 'dance9', 'dance11'];
      const danceAnim = danceAnimations[danceIndexRef.current % danceAnimations.length];
      danceIndexRef.current++;
      
      if (actionsRef.current[danceAnim]) {
        const action = actionsRef.current[danceAnim];
        if (currentActionRef.current) currentActionRef.current.fadeOut(0.2);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.reset().fadeIn(0.2).play();
        currentActionRef.current = action;
        
        const handler = () => {
          mixerRef.current.removeEventListener("finished", handler);
          isIdleCycleActiveRef.current = true;
          isTalkingCycleActiveRef.current = false;
          playIdleCycle();
        };
        mixerRef.current.addEventListener("finished", handler);
      }
      return;
    }

    if (avatarMode === 'walk') {
      isIdleCycleActiveRef.current = false;
      isTalkingCycleActiveRef.current = false;
      
      if (actionsRef.current[avatarMode]) {
        const action = actionsRef.current[avatarMode];
        if (currentActionRef.current) currentActionRef.current.fadeOut(0.2);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.reset().fadeIn(0.2).play();
        currentActionRef.current = action;
        
        const handler = () => {
          mixerRef.current.removeEventListener("finished", handler);
          isIdleCycleActiveRef.current = true;
          isTalkingCycleActiveRef.current = false;
          playIdleCycle();
        };
        mixerRef.current.addEventListener("finished", handler);
      }
      return;
    }

    if (isAISpeaking) {
      isIdleCycleActiveRef.current = false;
      isTalkingCycleActiveRef.current = true;
      talkingIndexRef.current = 0;
      playTalkingCycle();
    } else {
      isTalkingCycleActiveRef.current = false;
      isIdleCycleActiveRef.current = true;
      playIdleCycle();
    }
  }, [avatarMode, isAISpeaking]);

  useEffect(() => {
    const clock = new THREE.Clock();
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      mixerRef.current?.update(clock.getDelta());
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <group ref={group}>
      <primitive object={scene} scale={1.6} position={[0, -2.2, 0]} />
      <LipSyncManager scene={scene} isSpeaking={isAISpeaking} currentText={currentText} />
    </group>
  );
});

MaleAvatar.displayName = 'MaleAvatar';

export const Avatar3D = ({ avatarMode, companionId, isAISpeaking, currentText, onIntroComplete, skipIntro = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  const isFemale = companionId === 'priya_biology';

  if (!companionId) return null;

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-xl z-10 bg-gradient-to-br from-purple-900 to-indigo-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
            <p className="font-bold">Loading {isFemale ? "Priya" : "Omkar"}...</p>
          </div>
        </div>
      )}

      <Canvas onCreated={() => setTimeout(() => setIsLoading(false), 2000)} camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />

        {isFemale ? (
          <FemaleAvatar 
            avatarMode={avatarMode} 
            isAISpeaking={isAISpeaking} 
            currentText={currentText} 
            onIntroComplete={onIntroComplete}
            skipIntro={skipIntro}
          />
        ) : (
          <MaleAvatar 
            avatarMode={avatarMode} 
            isAISpeaking={isAISpeaking} 
            currentText={currentText} 
            onIntroComplete={onIntroComplete}
            skipIntro={skipIntro}
          />
        )}
      </Canvas>
    </div>
  );
};

useGLTF.preload("/avatars/priya.glb");
useGLTF.preload("/avatars/omkar.glb");
