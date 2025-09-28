import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { ensureHealthServiceInitialized, getTodaysProgress, getTodaysSteps } from '../../services/steps';

export default function StepsTestScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<number>(0);
  const [progress, setProgress] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    const loadStepData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize health service
        const initialized = await ensureHealthServiceInitialized();
        setIsInitialized(initialized);

        if (initialized) {
          // Get today's steps
          const todaySteps = await getTodaysSteps();
          setSteps(todaySteps);

          // Get progress with default goal of 10000
          const progressData = await getTodaysProgress(10000);
          setProgress(progressData);
        } else {
          setError('Failed to initialize health service');
        }
      } catch (err) {
        setError(`Error: ${err}`);
        console.error('Steps test error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStepData();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading step data...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Health Service Test</Text>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        Initialized: {isInitialized ? 'Yes' : 'No'}
      </Text>

      {error ? (
        <Text style={{ color: 'red', fontSize: 16 }}>Error: {error}</Text>
      ) : (
        <>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>
            Today's Steps: {steps}
          </Text>

          {progress && (
            <>
              <Text style={{ fontSize: 16, marginBottom: 5 }}>
                Goal: {progress.goal}
              </Text>
              <Text style={{ fontSize: 16, marginBottom: 5 }}>
                Progress: {Math.round(progress.progress * 100)}%
              </Text>
              <Text style={{ fontSize: 16, marginBottom: 5 }}>
                Goal Met: {progress.goalMet ? 'Yes' : 'No'}
              </Text>
              <Text style={{ fontSize: 16, marginBottom: 5 }}>
                Remaining: {progress.remaining}
              </Text>
            </>
          )}
        </>
      )}
    </View>
  );
}