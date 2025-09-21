
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
  XCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  generateStatement,
  verifyStatement,
  StatementOutput,
  VerificationOutput,
} from '@/ai/flows/game-flow';

type GameState = 'idle' | 'loading' | 'playing' | 'answered';

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [statement, setStatement] = useState<StatementOutput | null>(null);
  const [result, setResult] = useState<VerificationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartGame = async () => {
    setGameState('loading');
    setError(null);
    setResult(null);
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
  };

  // Automatically start game on component mount
  useEffect(() => {
    handleStartGame();
  }, []);

  const getResultIcon = () => {
    if (!result) return null;
    if (result.isCorrect) {
        return <CheckCircle className="h-10 w-10 text-green-500" />;
    } else {
        return <XCircle className="h-10 w-10 text-red-500" />;
    }
  }

  const getResultText = () => {
     if (!result) return null;
     if (result.isCorrect) {
        return <h3 className="text-xl font-bold">Correct!</h3>;
    } else {
        return <h3 className="text-xl font-bold">Incorrect! The answer was {result.correctAnswer}.</h3>;
    }
  }


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
              Test your ability to spot misinformation. Is the statement below
              real or fake?
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

            {gameState === 'loading' && (
              <div className="flex min-h-[150px] items-center justify-center rounded-lg bg-muted p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            
            {(gameState === 'playing' || gameState === 'answered') && statement && (
              <div className="min-h-[150px] flex items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-center text-lg font-medium">
                <p>&quot;{statement.statement}&quot;</p>
              </div>
            )}
            
            {gameState === 'playing' && (
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
            
            {gameState === 'answered' && result && (
                <div className='space-y-4'>
                     <div className="flex items-center space-x-4 rounded-lg bg-muted p-4">
                        {getResultIcon()}
                        <div>
                        {getResultText()}
                        </div>
                    </div>
                     <Card>
                        <CardHeader>
                            <CardTitle className='text-xl'>Explanation</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p className="text-muted-foreground">{result.explanation}</p>
                        </CardContent>
                    </Card>
                </div>
            )}
            
          </CardContent>
           <CardFooter className="flex-col sm:flex-row gap-2">
            {gameState === 'answered' ? (
                 <>
                    <Button onClick={handleStartGame} className="w-full">
                        Next Statement
                    </Button>
                    <Button onClick={handleExitGame} variant="outline" className="w-full">
                        Exit Game
                    </Button>
                </>
            ) : gameState !== 'idle' && gameState !== 'loading' ? (
                 <Button onClick={handleExitGame} variant="outline" className="w-full">
                    Exit Game
                </Button>
            ) : null }
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
