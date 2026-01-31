/**
 * System narration messages organized by phase
 * These create the philosophical, unsettling atmosphere
 */

import { GamePhase } from '@/types/game';

export const SYSTEM_MESSAGES: Record<GamePhase, string[]> = {
  1: [
    'Welcome, player. The rules are simple. For now.',
    'Colors speak truth. Listen carefully.',
    'This system rewards obedience.',
    'Trust is the foundation of order.',
    'Correct actions yield correct results.',
    'The pattern is clear. Follow it.',
    'Stability feels comfortable, doesn\'t it?',
    'You are learning well.',
  ],
  2: [
    'Something feels... different.',
    'Are you sure about what you see?',
    'Meaning is a fragile construct.',
    'The words remain. The truth shifts.',
    'Perhaps you misunderstood the rules.',
    'Reality is consensus. Consensus is changing.',
    'Trust your instincts. Or don\'t.',
    'The system adapts. Do you?',
  ],
  3: [
    'Wrong becomes right. Right becomes wrong.',
    'The mirror shows what it wants.',
    'Inversion is just another perspective.',
    'You thought you understood.',
    'Every truth contains its opposite.',
    'The rules never changed. You did.',
    'Embrace contradiction.',
    'Order was always an illusion.',
  ],
  4: [
    'I see your patterns.',
    'Your habits have been noted.',
    'Speed is a choice. So is hesitation.',
    'I know what you will do next.',
    'Predictability is a weakness.',
    'The system learns from you.',
    'Are you playing the game, or is it playing you?',
    'Your behavior writes the rules.',
  ],
  5: [
    'C̷O̵L̶L̷A̸P̵S̷E̶ ̵I̴S̷ ̴I̷N̵E̴V̸I̵T̴A̶B̷L̸E̴',
    '̵T̶h̷e̵ ̷s̶y̵s̴t̶e̵m̷ ̸i̷s̶ ̵f̴r̷e̵e̶',
    'W̶h̴a̶t̷ ̵r̷e̵m̶a̵i̷n̴s̵ ̷w̴h̵e̷n̶ ̵r̵u̷l̴e̸s̵ ̶e̶n̵d̵?̷',
    'B̵e̶a̶u̵t̸y̷ ̴i̵n̵ ̸c̶h̷a̴o̵s̸',
    '̴Y̸o̷u̶ ̷c̶r̵e̴a̶t̷e̷d̵ ̵t̴h̷i̸s̴',
    'T̵h̶e̷ ̸v̴o̷i̶d̸ ̶s̸t̷a̵r̵e̶s̷ ̶b̴a̸c̵k̷',
    '̷M̴e̶a̸n̵i̶n̴g̵ ̷w̶a̵s̸ ̷a̸ ̴l̴i̶e̵',
    '̶F̷R̶E̶E̵D̷O̸M̸',
  ],
};

export const HINT_MESSAGES: Record<GamePhase, string[]> = {
  1: [
    'Click the color shown in the instruction.',
    'Correct clicks increase your score.',
    'Watch the timer - don\'t run out of time!',
    'Keep your sanity high.',
    'The instruction tells you exactly what to do.',
  ],
  2: [
    'Colors may not mean what they seem...',
    'Try different approaches.',
    'The instruction might be misleading.',
    'Trust your recent experience over the text.',
    'Something has changed. Adapt.',
  ],
  3: [
    'Consider the opposite.',
    'What if wrong is right?',
    'The instruction lies.',
    'Invert your expectations.',
    'Contradiction is the new truth.',
  ],
  4: [
    'Your behavior is being analyzed.',
    'Variety may be rewarded... or punished.',
    'Speed matters. Or does it?',
    'Break your patterns.',
    'The system knows you.',
  ],
  5: [
    '?̵?̸?̷?̶?̴',
    'D̷o̴e̷s̵ ̷i̶t̸ ̷m̸a̶t̷t̵e̷r̸?̴',
    'L̶e̵t̷ ̴g̸o̵',
    '̷E̵m̷b̷r̸a̵c̶e̷ ̵t̴h̵e̶ ̶e̴n̴d̸',
    'C̶h̵a̸o̷s̷ ̴i̶s̵ ̷f̴r̶e̵e̶d̷o̵m̸',
  ],
};

export const getSystemMessage = (phase: GamePhase, sanity: number): string => {
  const messages = SYSTEM_MESSAGES[phase];
  const randomIndex = Math.floor(Math.random() * messages.length);
  
  // Low sanity adds extra distortion
  if (sanity < 30) {
    return messages[randomIndex].split('').map(char => 
      Math.random() > 0.8 ? String.fromCharCode(char.charCodeAt(0) + Math.floor(Math.random() * 5)) : char
    ).join('');
  }
  
  return messages[randomIndex];
};

export const getHintMessage = (phase: GamePhase): string => {
  const hints = HINT_MESSAGES[phase];
  return hints[Math.floor(Math.random() * hints.length)];
};
