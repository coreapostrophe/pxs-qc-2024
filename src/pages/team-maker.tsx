import {
  Anchor,
  Box,
  Button,
  Card,
  Heading,
  PageContent,
  Text,
  TextInput,
} from "grommet";
import { FormPreviousLink } from "grommet-icons";
import { PageKind, usePages } from "../hooks/page";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useScores } from "../hooks/score";

function shuffleArray<T>(array: T[]) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function chunkArray<T>(array: T[], numberOfChunks: number) {
  const result: T[][] = [];
  array.forEach((item, index) => {
    const group = index % numberOfChunks;
    const groupExists = Boolean(result?.[group]);
    if (groupExists) {
      result[group].push(item);
    } else {
      result[group] = [item];
    }
  });
  return result;
}

function TeamMaker() {
  const { players } = useScores();
  const { setActivePage } = usePages();
  const [groupCount, setGroupCount] = useState(1);
  const [shuffledPlayers, setShuffledPlayers] = useState(players);

  const shufflePlayers = useCallback(() => {
    setShuffledPlayers(shuffleArray(players));
  }, [players]);

  const groupedPlayers = useMemo(
    () => chunkArray(shuffledPlayers, groupCount),
    [shuffledPlayers, groupCount]
  );

  useEffect(() => {
    shufflePlayers();
  }, []);

  const handleChangeCount = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const parsedValue = parseInt(event.target.value) ?? 1;
      const clampedValueMin = parsedValue < 1 ? 1 : parsedValue;
      const clampedValueMax =
        clampedValueMin > players.length ? players.length : clampedValueMin;
      setGroupCount(clampedValueMax);
    },
    []
  );

  const handleReshuffle = useCallback(() => shufflePlayers(), [shufflePlayers]);

  return (
    <PageContent>
      <Anchor
        icon={<FormPreviousLink />}
        label="Back"
        onClick={() => setActivePage(PageKind.home)}
      />
      <Heading level="2">Team Maker</Heading>
      <Box
        flex
        gap="medium"
        align="center"
        justify="start"
        direction="row-responsive"
        margin={{ bottom: "large" }}
      >
        <Text>Groups</Text>
        <TextInput
          type="number"
          value={groupCount}
          onChange={handleChangeCount}
        />
        <Button label="Make" onClick={handleReshuffle} />
      </Box>
      <Box>
        <Box wrap direction="row-responsive" justify="stretch">
          {Boolean(players.length) ? (
            groupedPlayers.map(
              (group) =>
                Boolean(group.length) && (
                  <Card pad="medium" margin="small">
                    {group.map((player) => (
                      <Box>{player}</Box>
                    ))}
                  </Card>
                )
            )
          ) : (
            <Box flex>
              <Text textAlign="center" color="dark-2">
                No Players
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </PageContent>
  );
}

export default TeamMaker;
