import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useStorage } from "./storage";

export type Scores = Record<string, number>;

interface Context {
  scores: Scores;
  players: string[];
  setPlayers: (playerList: string[]) => void;
  setScore: (
    player: string,
    score: number | ((prevScore: number) => number)
  ) => void;
}

const ScoreContext = createContext<Context>({
  scores: {},
  players: [],
  setPlayers: () => {},
  setScore: () => {},
});
export const useScores = () => useContext(ScoreContext);

export function ScoreProvider(props: PropsWithChildren) {
  const { children } = props;
  const { getData, saveData } = useStorage();
  const [scores, setScores] = useState<Scores>({});

  useEffect(() => {
    getData("scores", (fetchedScores) => {
      setScores(fetchedScores as Scores);
    });
  }, []);

  useEffect(() => {
    saveData("scores", scores);
  }, [scores]);

  const players = useMemo(() => Object.keys(scores), [scores]);

  const setPlayers = useCallback((playerList: string[]) => {
    const newScores: Record<string, number> = {};
    playerList.forEach((player) => {
      newScores[player] = 0;
    });
    setScores(newScores);
  }, []);

  const setScore = useCallback(
    (player: string, score: number | ((prevScore: number) => number)) => {
      setScores((prevScores) => {
        const isValueCallback = typeof score === "function";
        const newScore = isValueCallback ? score(prevScores[player]) : score;
        return {
          ...prevScores,
          [player]: newScore > 0 ? newScore : 0,
        };
      });
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      scores,
      players,
      setPlayers,
      setScore,
    }),
    [scores, players, setPlayers, setScore]
  );

  return (
    <ScoreContext.Provider value={contextValue}>
      {children}
    </ScoreContext.Provider>
  );
}
