"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

interface MathProblemProps {
  difficulty: "EASY" | "MEDIUM" | "HARD";
  onCorrectAnswer: () => void;
}

export default function MathProblem({ difficulty, onCorrectAnswer }: MathProblemProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState<"+" | "*">("+");
  const [userAnswer, setUserAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const generateProblem = () => {
    let n1 = 0, n2 = 0, op: "+" | "*" = "+";
    
    // Generate numbers based on difficulty, ensuring positive results
    switch (difficulty) {
      case "EASY":
        n1 = Math.floor(Math.random() * 10) + 1; // 1-10
        n2 = Math.floor(Math.random() * 10) + 1; // 1-10
        op = "+";
        break;
      case "MEDIUM":
        if (Math.random() < 0.5) {
          n1 = Math.floor(Math.random() * 20) + 10; // 10-29
          n2 = Math.floor(Math.random() * 20) + 1; // 1-20
          op = "+";
        } else {
          n1 = Math.floor(Math.random() * 5) + 1; // 1-5
          n2 = Math.floor(Math.random() * 5) + 1; // 1-5
          op = "*";
        }
        break;
      case "HARD":
        if (Math.random() < 0.5) {
          n1 = Math.floor(Math.random() * 50) + 20; // 20-69
          n2 = Math.floor(Math.random() * 30) + 5; // 5-34
          op = "+";
        } else {
          n1 = Math.floor(Math.random() * 7) + 2; // 2-8
          n2 = Math.floor(Math.random() * 7) + 2; // 2-8
          op = "*";
        }
        break;
    }
    
    setNum1(n1);
    setNum2(n2);
    setOperator(op);
    
    // Calculate correct answer
    const answer = op === "+" ? n1 + n2 : n1 * n2;
    setCorrectAnswer(answer);
    setUserAnswer("");
    setIsCorrect(false);
  };
  
  useEffect(() => {
    generateProblem();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [difficulty]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setUserAnswer(value);
      
      // Check answer after a short delay
      if (value !== "") {
        const answer = parseInt(value);
        if (answer === correctAnswer) {
          setIsCorrect(true);
          setTimeout(() => {
            onCorrectAnswer();
            generateProblem();
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, 300); // Short delay for visual feedback
        } else if (value.length >= correctAnswer.toString().length) {
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
        }
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (userAnswer === "") return;
      
      const answer = parseInt(userAnswer);
      if (answer === correctAnswer) {
        setIsCorrect(true);
        setTimeout(() => {
          onCorrectAnswer();
          generateProblem();
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 300);
      } else {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    }
  };
  
  const displayOperator = operator === "*" ? "×" : operator;
  
  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="flex flex-col items-center gap-12 w-full">
        <div className={`flex items-center justify-center ${isShaking ? 'animate-shake' : ''}`}>
          <div className="math-problem">
            {num1}
          </div>
          <div className="math-operator">
            {displayOperator}
          </div>
          <div className="math-problem">
            {num2}
          </div>
        </div>
        
        <div className="relative w-full max-w-[400px] px-4 mb-12">
          <Input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={userAnswer}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={`relative w-full h-16 text-center text-7xl border-0 border-b-2 bg-transparent outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-0 focus:shadow-none ${isCorrect ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]' : 'border-white/20'}`}
            style={{ boxShadow: 'none' }}
            placeholder=""
            autoFocus
          />
          <div className="absolute -bottom-8 left-0 w-full text-center">
            <div className="swiss-label">Enter Answer</div>
          </div>
        </div>
      </div>
    </div>
  );
}
