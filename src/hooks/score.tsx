import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

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
  const [scores, setScores] = useState<Scores>({});

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
        const newScore = isValueCallback ? prevScores[player] : score;
        prevScores[player] = newScore;
        return prevScores;
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
    [scores, setPlayers, setScore]
  );

  return (
    <ScoreContext.Provider value={contextValue}>
      {children}
    </ScoreContext.Provider>
  );
}
