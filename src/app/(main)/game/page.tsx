
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertCircle,
  CheckCircle,
  Fish,
  Gamepad2,
  GraduationCap,
  Lightbulb,
  Loader2,
  ShieldX,
  Trophy,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import {
  generateStatement,
  verifyStatement,
  StatementOutput,
  VerificationOutput,
} from '@/ai/flows/game-flow';
import { Progress } from '@/components/ui/progress';

type GameState = 'idle' | 'loading' | 'playing' | 'answered';
const TOTAL_QUESTIONS = 5;

function LearningHub() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl font-bold flex items-center gap-3">
          <GraduationCap className="h-8 w-8" />
          Learning Hub
        </CardTitle>
        <CardDescription>
          Expand your knowledge on how to identify and combat misinformation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full space-y-2">
          <AccordionItem value="item-1">
            <AccordionTrigger>
                <div className='flex items-center gap-3'>
                    <Lightbulb />
                    What is Misinformation? A Quick Guide
                </div>
            </AccordionTrigger>
            <AccordionContent className='prose prose-sm max-w-none text-muted-foreground'>
              <p>
                <strong>Misinformation</strong> is false or inaccurate information that is spread, regardless of intent to deceive. It's different from <strong>disinformation</strong>, which is deliberately created and shared to mislead people.
              </p>
              <h4>Key Characteristics:</h4>
              <ul>
                <li>It often plays on emotions like fear, anger, or excitement.</li>
                <li>It can be based on a grain of truth but is twisted or taken out of context.</li>
                <li>It spreads rapidly on social media through shares and reposts.</li>
              </ul>
              <h4>How to Prevent It:</h4>
              <p>
                Always pause and think before sharing. Check the source, look for evidence, and if you're unsure, don't share it. A quick search on a reputable fact-checking website can often reveal the truth.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
                 <div className='flex items-center gap-3'>
                    <Fish />
                    What is Phishing? Don't Get Hooked
                </div>
            </AccordionTrigger>
            <AccordionContent className='prose prose-sm max-w-none text-muted-foreground'>
              <p>
                <strong>Phishing</strong> is a type of scam where attackers impersonate a legitimate organization (like a bank, a social media site, or your email provider) to trick you into giving up sensitive information.
              </p>
              <h4>Common Tactics:</h4>
              <ul>
                <li>Emails or text messages with a sense of urgency, like "Your account has been compromised, click here to secure it."</li>
                <li>Fake login pages that look identical to the real ones.</li>
                <li>Unexpected attachments or links from seemingly known contacts whose accounts may have been hacked.</li>
              </ul>
              <h4>How to Spot It:</h4>
              <p>
                Check the sender's email address for slight misspellings. Hover over links to see the actual URL before clicking. Be wary of generic greetings like "Dear Customer." And remember, a real company will never ask for your password via email.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>
                <div className='flex items-center gap-3'>
                    <ShieldX />
                    Recognizing Common Online Scams
                </div>
            </AccordionTrigger>
            <AccordionContent className='prose prose-sm max-w-none text-muted-foreground'>
              <p>
                Scammers are always finding new ways to trick people, but many scams fall into common categories.
              </p>
              <h4>Examples of Scams:</h4>
              <ul>
                <li><strong>"You've Won a Prize!"</strong>: A classic scam that asks you to pay a small fee to receive a large prize that never materializes.</li>
                <li><strong>Tech Support Scams</strong>: A pop-up or call warns you of a virus on your computer and asks for remote access or payment to "fix" a non-existent problem.</li>
                <li><strong>Investment Scams</strong>: Promises of guaranteed high returns with little to no risk. If it sounds too good to be true, it probably is.</li>
              </ul>
              <h4>Golden Rule:</h4>
              <p>
                Be skeptical of unsolicited offers. Never give out personal information, financial details, or passwords to someone who contacted you unexpectedly. Verify any request through an official, separate channel (e.g., call the company's official phone number).
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

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
      <main className="mx-auto w-full max-w-2xl space-y-8">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <Gamepad2 className="h-8 w-8" />
              Gamified learning
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
        
        <LearningHub />
      </main>
    </div>
  );
}

    