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
import { useMemo } from "react";

function Home() {
  const { setActivePage } = usePages();
  const { scores } = useScores();

  const hasScores = useMemo(() => Object.keys(scores).length > 0, [scores]);
  const [scoreData, maxScore] = useMemo((): [
    { name: string; score: number }[],
    number
  ] => {
    const data = Object.entries(scores).map(([key, value]) => {
      return { name: key, score: value };
    });
    const maxScore = data.reduce((prev, curr) => {
      const { score } = curr;
      return score > prev ? score : prev;
    }, 0);
    return [data, maxScore];
  }, [scores]);

  return (
    <PageContent>
      <Heading>Activities</Heading>
      <Accordion multiple>
        <AccordionPanel label="Games">
          {hasScores && (
            <DataTable
              sort={{ direction: "desc", property: "score" }}
              margin={{ bottom: "medium" }}
              columns={[
                {
                  property: "name",
                  header: "Name",
                  primary: true,
                },
                {
                  property: "visual",
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
