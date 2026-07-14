"use client";

import React, { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  delay?: number;
}

export default function Typewriter({ text, delay = 25 }: TypewriterProps) {
  const [currentText, setCurrentText] = useState('');

  useEffect(() => {
    setCurrentText('');
    let index = 0;
    if (!text) return;

    const timer = setInterval(() => {
      setCurrentText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(timer);
      }
    }, delay);

    return () => clearInterval(timer);
  }, [text, delay]);

  return <span>{currentText}</span>;
}
