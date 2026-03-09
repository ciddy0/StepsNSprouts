import { getUserDocument } from "@/services/api/userService";
import { listenToAuth } from "@/services/firebase/auth";
import type { User } from "@/types/user";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type GameUserContextType = {
  user: User | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

const GameUserContext = createContext<GameUserContextType>({
  user: null,
  loading: true,
  error: null,
  refresh: async () => {},
});

export const GameUserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // wait for user google login to get user doc (user game data)
    const unsubscribe = listenToAuth((currentUser) => {
      // saves the ID of the user from the google login (this is like the random
      // numbers and letters of the ID we saw for each document while making the the collections)
      setAuthUid(currentUser ? currentUser.uid : null);
    });
    return unsubscribe;
  }, []);

  // this is just start of a new fuinction
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        // this is checking if the userID we got from google when we logged in is actually something
        // basically if not empty
        if (!authUid) {
          // if it is, that means there is no user to get so we set our user to null/nothing
          if (isMounted) setUser(null);
        } else {
          // in the case we do have an ID, we fetch the user data with line below
          const doc = await getUserDocument(authUid);
          // we then save the user data using the setUser function below
          if (isMounted) setUser(doc ?? null);
          //everything else dont matter just above ^^^
        }
      } catch (e) {
        if (isMounted) setError(e as Error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [authUid]);

  // get new uer data
  const refresh = async () => {
    if (!authUid) {
      setUser(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const doc = await getUserDocument(authUid);
      setUser(doc ?? null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({ user, loading, error, refresh }),
    [user, loading, error]
  );

  return (
    <GameUserContext.Provider value={value}>
      {children}
    </GameUserContext.Provider>
  );
};

export const useGameUser = () => useContext(GameUserContext);
