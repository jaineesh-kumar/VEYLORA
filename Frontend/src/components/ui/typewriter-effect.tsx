
import React, { useState, useEffect } from 'react';


interface TypewriterEffectProps {
  text: { text: string; className?: string }[];
  cursorClassName?: string;
}


export const TypewriterEffect: React.FC<TypewriterEffectProps> = ({ text, cursorClassName }) => {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);


  useEffect(() => {
    if (currentTextIndex < text.length) {
      const currentText = text[currentTextIndex].text;
      if (charIndex < currentText.length) {
        const timeout = setTimeout(() => {
          setDisplayedText((prev) => prev + currentText[charIndex]);
          setCharIndex(charIndex + 1);
        }, 50);
        return () => clearTimeout(timeout);
        setCurrentTextIndex(1);
      }
    }
  }, [charIndex, currentTextIndex, text]);


  return (
    <span className={text[currentTextIndex]?.className || ''}>
      {displayedText}
      <span className={cursorClassName || 'bg-white w-1 h-5 inline-block ml-1 animate-blink'}>|</span>
    </span>
  );
};


