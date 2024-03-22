import {
  Accordion,
  AccordionPanel,
  Box,
  Button,
  DataTable,
  Heading,
  Meter,
  PageContent,
  Text,
} from "grommet";
import { PageKind, usePages } from "../hooks/page";
import { useScores } from "../hooks/score";
import { useCallback, useEffect, useMemo } from "react";
import { Add, Subtract } from "grommet-icons";

function Home() {
  const { setActivePage } = usePages();
  const { scores, setScore } = useScores();

  const hasScores = useMemo(() => Object.keys(scores).length > 0, [scores]);
  const [scoreData, maxScore] = useMemo(() => {
    const data = Object.entries(scores).map(([key, value]) => {
      return { name: key, score: value };
    });
    const maxScore = data.reduce((prev, curr) => {
      const { score } = curr;
      return score > prev ? score : prev;
    }, 0);
    return [data, maxScore];
  }, [scores]);

  const handleIncrement = useCallback((player: string) => {
    setScore(player, (prevScore) => prevScore + 1);
  }, []);
  const handleDecrement = useCallback((player: string) => {
    setScore(player, (prevScore) => prevScore - 1);
  }, []);

  return (
    <PageContent>
      <Heading>Activities</Heading>
      <Accordion multiple>
        <AccordionPanel label="Games">
          {hasScores && (
            <DataTable
              sortable
              margin={{ bottom: "medium" }}
              columns={[
                {
                  property: "name",
                  header: "Name",
                  primary: true,
                },
                {
                  property: "visual",
                  sortable: false,
                  render: (datum) => (
                    <Box pad={{ vertical: "xsmall" }}>
                      <Meter
                        max={maxScore}
                        values={[{ value: datum.score }]}
                        thickness="small"
                        size="full"
                      />
                    </Box>
                  ),
                },
                {
                  property: "score",
                  header: "Score",
                  align: "center",
                },
                {
                  property: "actions",
                  header: "Actions",
                  align: "center",
                  sortable: false,
                  render: (datum) => (
                    <Box flex direction="row">
                      <Button
                        style={{ padding: "4px 8px" }}
                        icon={<Subtract />}
                        onClick={() => handleDecrement(datum.name)}
                      />
                      <Button
                        style={{ padding: "4px 8px" }}
                        icon={<Add />}
                        onClick={() => handleIncrement(datum.name)}
                      />
                    </Box>
                  ),
                },
              ]}
              data={scoreData}
            />
          )}
          <Button
            primary
            label="Players"
            margin={{ bottom: "medium" }}
            onClick={() => setActivePage(PageKind.players)}
          />
          <Button primary label="Bracket" margin={{ bottom: "medium" }} />
        </AccordionPanel>
        <AccordionPanel label="Hot Discussions">
          <Button primary label="Randomizer" margin={{ bottom: "medium" }} />
        </AccordionPanel>
      </Accordion>
    </PageContent>
  );
}

export default Home;
