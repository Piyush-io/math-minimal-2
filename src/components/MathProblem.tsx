"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";

interface MathProblemProps {
  difficulty: "EASY" | "MEDIUM" | "HARD";
  onCorrectAnswer: (operationType: "addition" | "multiplication", isCorrect: boolean, totalAttempts: number) => void;
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
  
  // First, wrap the generateProblem function with useCallback
const generateProblem = useCallback(() => {
  let n1 = 0, n2 = 0, op: "+" | "*" = "+";
  
  // Generate numbers based on difficulty, ensuring positive results
  switch (difficulty) {
    case "EASY":
      // Introduce more multiplication and a wider range of numbers
      if (Math.random() < 0.5) {
        n1 = Math.floor(Math.random() * 10) + 1; // 1-10
        n2 = Math.floor(Math.random() * 10) + 1; // 1-10
        op = "+"; 
      } else {
        n1 = Math.floor(Math.random() * 10) + 1; // 1-10
        n2 = Math.floor(Math.random() * 5) + 1; // 1-5
        op = "*"; // Allow multiplication
      }
      break;
    case "MEDIUM":
      if (Math.random() < 0.5) {
        n1 = Math.floor(Math.random() * 20) + 10; // 10-29
        n2 = Math.floor(Math.random() * 20) + 1; // 1-20
        op = "+";
      } else {
        n1 = Math.floor(Math.random() * 10) + 1; // 1-10
        n2 = Math.floor(Math.random() * 10) + 1; // 1-10
        op = "*"; // Allow multiplication
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
}, [difficulty]); // Only include difficulty as a dependency

// Then, modify the useEffect to use the memoized function
useEffect(() => {
  generateProblem();
  if (inputRef.current) {
    inputRef.current.focus();
  }
}, [difficulty, generateProblem]); // Now generateProblem is stable between renders
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setUserAnswer(value);
      
      // Check answer immediately when length matches
      if (value !== "" && value.length >= correctAnswer.toString().length) {
        const answer = parseInt(value);
        if (answer === correctAnswer) {
          setIsCorrect(true);
          setTimeout(() => {
            onCorrectAnswer(operator === "+" ? "addition" : "multiplication", true, 1);
            generateProblem();
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, 300);
        } else {
          setIsShaking(true);
          setTimeout(() => {
            setIsShaking(false);
            onCorrectAnswer(operator === "+" ? "addition" : "multiplication", false, 1);
            generateProblem();
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, 500);
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
          onCorrectAnswer(operator === "+" ? "addition" : "multiplication", true, 1);
          generateProblem();
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 300);
      } else {
        setIsShaking(true);
        setTimeout(() => {
          setIsShaking(false);
          onCorrectAnswer(operator === "+" ? "addition" : "multiplication", false, 1);
          generateProblem();
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 500);
      }
    }
  };
  
  const displayOperator = operator === "*" ? "×" : operator;
  
  return (
    <div className="w-full max-w-[600px] mx-auto">
      <div className={`flex flex-col items-center justify-center ${isShaking ? 'animate-shake' : ''}`}>
        <div className="flex items-center justify-center mb-8">
          <div className="math-problem text-[80px] md:text-[120px]">
            {num1}
          </div>
          <div className="math-operator text-[80px] md:text-[120px] mx-4 md:mx-8">
            {displayOperator}
          </div>
          <div className="math-problem text-[80px] md:text-[120px]">
            {num2}
          </div>
        </div>
        
        <div className="relative w-full max-w-[300px] md:max-w-[400px] px-4 mb-8 md:mb-12">
          <Input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={userAnswer}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={`relative w-full h-12 md:h-16 text-center text-5xl md:text-7xl border-0 border-b-2 bg-transparent outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-0 focus:shadow-none ${isCorrect ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]' : 'border-white/20'}`}
            style={{ boxShadow: 'none' }}
            placeholder=""
            autoFocus
          />
          <div className="absolute -bottom-6 md:-bottom-8 left-0 w-full text-center">
            <div className="swiss-label text-xs md:text-sm">Enter Answer</div>
          </div>
        </div>
      </div>
    </div>
  );
}
