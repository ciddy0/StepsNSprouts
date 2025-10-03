import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { ensureHealthServiceInitialized, getTodaysSteps } from '../../services/steps';

export default function StepsTestScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const GOAL = 10000;

  useEffect(() => {
    const loadStepData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const initialized = await ensureHealthServiceInitialized();
        setIsInitialized(initialized);

        if (initialized) {
          const todaySteps = await getTodaysSteps();
          console.log('Fetched steps:', todaySteps);
          setSteps(todaySteps);
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

  // Calculate progress locally using the single steps value
  const progress = steps / GOAL;
  const remaining = Math.max(0, GOAL - steps);
  const goalMet = steps >= GOAL;

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
          <Text style={{ fontSize: 16, marginBottom: 5 }}>
            Goal: {GOAL}
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 5 }}>
            Progress: {Math.round(progress * 100)}%
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 5 }}>
            Goal Met: {goalMet ? 'Yes' : 'No'}
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 5 }}>
            Remaining: {remaining}
          </Text>
        </>
      )}
    </View>
  );
}