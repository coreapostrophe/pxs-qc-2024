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

function Home() {
  return (
    <PageContent>
      <Heading>Activities</Heading>
      <Accordion multiple>
        <AccordionPanel label="Games">
          <DataTable
            margin={{ bottom: "medium" }}
            columns={[
              {
                property: "name",
                header: <Text>Name</Text>,
                primary: true,
              },
              {
                property: "score",
                header: "",
                render: (datum) => (
                  <Box pad={{ vertical: "xsmall" }}>
                    <Meter
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
            data={[
              { name: "Alan", score: 20 },
              { name: "Bryan", score: 30 },
              { name: "Chris", score: 40 },
              { name: "Eric", score: 80 },
            ]}
          />
          <Button primary label="Players" margin={{ bottom: "medium" }} />
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
