"use client";

import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { motion } from "framer-motion";

type Destination = {
  city: string;
  country: string;
  clues: string[];
  fun_fact: string[];
  trivia: string[];
};

export default function HomePage() {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [clueIndex, setClueIndex] = useState(0);
  const { width, height } = useWindowSize();

  useEffect(() => {
    fetchDestination();
  }, []);

  // Fetch destination + options from backend
  const fetchDestination = async () => {
    setIsCorrect(null);
    setSelectedAnswer(null);
    setClueIndex(0);
    try {
      const response = await fetch("http://localhost:5000/api/get-destination");
      const data = await response.json();
      setDestination(data.destination);
      setOptions(data.options);
    } catch (error) {
      console.error("Error fetching destination:", error);
    }
  };

  // Handle answer selection
  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === destination?.city;
    setIsCorrect(correct);
    setScore((prev) => ({
      correct: correct ? prev.correct + 1 : prev.correct,
      incorrect: !correct ? prev.incorrect + 1 : prev.incorrect,
    }));
  };

  // Shuffle to the next clue
  const shuffleClue = () => {
    if (destination) {
      setClueIndex((prevIndex) => (prevIndex + 1) % destination.clues.length);
    }
  };

  // Generate a unique share link
  const generateInviteLink = () => {
    const currentUrl = window.location.href;
    return `${currentUrl}?inviteCode=${btoa(destination?.city || "")}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      {isCorrect && <Confetti width={width} height={height} />}

      <h1 className="text-3xl font-bold mb-6">🌍 Globetrotter Challenge</h1>

      {/* Score Tracking */}
      <div className="mb-4 text-lg">
        ✅ Correct: {score.correct} | ❌ Incorrect: {score.incorrect}
      </div>

      {destination ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg text-center"
        >
          <h2 className="text-xl font-semibold mb-4">Guess the Destination!</h2>
          <p className="text-md mb-2 flex items-center justify-center">
            🔎 Clue: {destination.clues[clueIndex]}
            <button
              onClick={shuffleClue}
              className="ml-3 bg-blue-500 px-2 py-1 text-sm rounded-lg text-white hover:bg-blue-600"
            >
              🔄 Shuffle
            </button>
          </p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {options.map((option) => (
              <motion.button
                key={option}
                whileTap={{ scale: 0.9 }}
                animate={
                  selectedAnswer && option !== destination.city
                    ? { x: [0, -5, 5, -5, 0] }
                    : {}
                }
                className={`p-3 rounded-lg text-lg font-semibold transition ${
                  selectedAnswer === option
                    ? option === destination.city
                      ? "bg-green-500"
                      : "bg-red-500"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                onClick={() => handleAnswer(option)}
                disabled={selectedAnswer !== null}
              >
                {option}
              </motion.button>
            ))}
          </div>

          {selectedAnswer && (
            <div className="mt-6">
              {isCorrect ? (
                <>
                  <motion.p
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-green-400 text-lg font-semibold"
                  >
                    🎉 Correct! It&apos;s {destination.city}!
                  </motion.p>
                  <p className="text-md mt-2">
                    Fun Fact: {destination.fun_fact[0]}
                  </p>
                </>
              ) : (
                <>
                  <motion.p
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-red-400 text-lg font-semibold"
                  >
                    😢 Oops! The correct answer was {destination.city}.
                  </motion.p>
                  <p className="text-md mt-2">
                    Fun Fact: {destination.fun_fact[0]}
                  </p>
                </>
              )}

              <button
                className="mt-4 bg-blue-500 px-4 py-2 rounded-lg text-white hover:bg-blue-600"
                onClick={fetchDestination}
              >
                🔄 Play Again
              </button>

              {/* Share Challenge Button */}
              <button
                className="mt-4 bg-yellow-500 px-4 py-2 rounded-lg text-black hover:bg-yellow-600"
                onClick={() =>
                  navigator.clipboard.writeText(generateInviteLink())
                }
              >
                🏆 Challenge a Friend
              </button>
            </div>
          )}
        </motion.div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
