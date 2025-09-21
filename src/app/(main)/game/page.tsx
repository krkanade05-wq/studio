
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertCircle,
  CheckCircle,
  Gamepad2,
  Loader2,
  ShieldX,
  Trophy,
  XCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  generateStatement,
  verifyStatement,
  StatementOutput,
  VerificationOutput,
} from '@/ai/flows/game-flow';
import { Progress } from '@/components/ui/progress';

type GameState = 'idle' | 'loading' | 'playing' | 'answered';
const TOTAL_QUESTIONS = 5;

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [statement, setStatement] = useState<StatementOutput | null>(null);
  const [result, setResult] = useState<VerificationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);

  const handleStartGame = async () => {
    setGameState('loading');
    setError(null);
    setResult(null);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setQuestionNumber(1);
    try {
      const newStatement = await generateStatement();
      setStatement(newStatement);
      setGameState('playing');
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to load a new statement. Please try again.');
      setGameState('idle');
    }
  };

  const handleNextQuestion = async () => {
    setGameState('loading');
    setError(null);
    setResult(null);
    setQuestionNumber((prev) => prev + 1);
     try {
      const newStatement = await generateStatement();
      setStatement(newStatement);
      setGameState('playing');
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to load a new statement. Please try again.');
      setGameState('idle');
    }
  };

  const handleGuess = async (guess: 'Real' | 'Fake') => {
    if (!statement) return;
    setGameState('loading');
    setError(null);
    try {
      const verificationResult = await verifyStatement({
        statement: statement.statement,
        userGuess: guess,
      });
      setResult(verificationResult);
      if (verificationResult.isCorrect) {
        setCorrectAnswers((prev) => prev + 1);
      } else {
        setWrongAnswers((prev) => prev + 1);
      }
      setGameState('answered');
    } catch (err) {
      console.error('Error verifying statement:', err);
      setError('Failed to verify your answer. Please try again.');
      setGameState('playing'); // Revert to playing state on error
    }
  };

  const handleExitGame = () => {
    setGameState('idle');
    setStatement(null);
    setResult(null);
    setError(null);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setQuestionNumber(0);
  };

  const isGameOver = questionNumber > TOTAL_QUESTIONS;

  const getResultIcon = () => {
    if (!result) return null;
    if (result.isCorrect) {
      return <CheckCircle className="h-10 w-10 text-green-500" />;
    } else {
      return <XCircle className="h-10 w-10 text-red-500" />;
    }
  };

  const getResultText = () => {
    if (!result) return null;
    if (result.isCorrect) {
      return <h3 className="text-xl font-bold">Correct!</h3>;
    } else {
      return (
        <h3 className="text-xl font-bold">
          Incorrect! The answer was {result.correctAnswer}.
        </h3>
      );
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent p-4 md:p-8">
      <main className="mx-auto w-full max-w-2xl">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <Gamepad2 className="h-8 w-8" />
              Real or Fake? The Game
            </CardTitle>
            <CardDescription>
              Test your ability to spot misinformation, spam, and scams.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {gameState !== 'idle' && !isGameOver && (
                <div className='space-y-4'>
                     <div className="grid grid-cols-2 gap-4">
                        <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Correct</CardTitle>
                            <Trophy className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{correctAnswers}</div>
                        </CardContent>
                        </Card>
                        <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Incorrect</CardTitle>
                            <ShieldX className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{wrongAnswers}</div>
                        </CardContent>
                        </Card>
                    </div>
                    <div className='space-y-1'>
                        <Progress value={(questionNumber - 1) * (100 / TOTAL_QUESTIONS)} className="w-full" />
                        <p className="text-center text-xs text-muted-foreground">Question {questionNumber} of {TOTAL_QUESTIONS}</p>
                    </div>
                </div>
            )}

            {gameState === 'loading' && (
              <div className="flex min-h-[150px] items-center justify-center rounded-lg bg-muted p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}

            {isGameOver && (
                <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-8 text-center space-y-4">
                    <h2 className="text-2xl font-bold">Game Over!</h2>
                    <p className="text-muted-foreground">You finished the game with a score of {correctAnswers} out of {TOTAL_QUESTIONS}.</p>
                    <div className='flex gap-4 pt-4'>
                        <Button onClick={handleStartGame}>Play Again</Button>
                        <Button onClick={handleExitGame} variant="outline">Exit</Button>
                    </div>
                </div>
            )}

            {(gameState === 'playing' || gameState === 'answered') && statement && !isGameOver && (
              <div className="min-h-[150px] flex items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-center text-lg font-medium">
                <p>&quot;{statement.statement}&quot;</p>
              </div>
            )}

            {gameState === 'playing' && !isGameOver && (
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => handleGuess('Real')} size="lg">
                  Real
                </Button>
                <Button
                  onClick={() => handleGuess('Fake')}
                  variant="destructive"
                  size="lg"
                >
                  Fake
                </Button>
              </div>
            )}

            {gameState === 'answered' && result && !isGameOver && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 rounded-lg bg-muted p-4">
                  {getResultIcon()}
                  <div>{getResultText()}</div>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Explanation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {result.explanation}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

          </CardContent>
          <CardFooter className="flex-col sm:flex-row gap-2">
            {gameState === 'answered' && !isGameOver ? (
              <>
                <Button onClick={handleNextQuestion} className="w-full">
                  Next Statement
                </Button>
                <Button
                  onClick={handleExitGame}
                  variant="outline"
                  className="w-full"
                >
                  Exit Game
                </Button>
              </>
            ) : gameState !== 'idle' && gameState !== 'loading' && !isGameOver ? (
              <Button
                onClick={handleExitGame}
                variant="outline"
                className="w-full"
              >
                Exit Game
              </Button>
            ) : null}
            {gameState === 'idle' && !error && (
              <Button onClick={handleStartGame} className="w-full">
                Start Game
              </Button>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
