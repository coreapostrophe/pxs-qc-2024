import {
  Anchor,
  Box,
  Button,
  Card,
  Form,
  FormField,
  Heading,
  PageContent,
  Select,
  Text,
} from "grommet";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useScores } from "../hooks/score";
import { FormPreviousLink } from "grommet-icons";
import { PageKind, usePages } from "../hooks/page";
import { useStorage } from "../hooks/storage";
import { playSfx } from "../utils/sfx";

function countDivision(num: number, divisor: number): number {
  const quotient = num / divisor;
  return quotient > 1 ? countDivision(quotient, divisor) + 1 : 1;
}

function PlayerSelect(props: { id: string }) {
  const { id } = props;
  const { players } = useScores();

  const options = useMemo(() => ["", ...players], [players]);
  return (
    <FormField name={id} htmlFor={`${id}-input`}>
      <Select
        name={id}
        id={`${id}-input`}
        options={options}
        defaultValue={""}
        onChange={() => playSfx()}
      />
    </FormField>
  );
}

function BracketColumn(props: { rowCount: number; idPrefix: string }) {
  const { rowCount, idPrefix } = props;
  return (
    <Box flex direction="column">
      {Array.from({ length: rowCount }, (_, i) => (
        <Box margin="xsmall" key={i} flex align="center" justify="center">
          <Card fill="horizontal" pad="small">
            <PlayerSelect id={`${idPrefix}-${i}-1`} />
            <PlayerSelect id={`${idPrefix}-${i}-2`} />
          </Card>
        </Box>
      ))}
    </Box>
  );
}

function Brackets() {
  const { players } = useScores();
  const { setActivePage } = usePages();
  const { saveData, getData } = useStorage();

  const [bracketData, setBracketData] = useState({});

  useEffect(() => {
    getData("brackets", (fetchedBracketData) => {
      setBracketData(fetchedBracketData as {});
    });
  }, []);

  useEffect(() => {
    saveData("brackets", bracketData);
  }, [bracketData]);

  const getBracketColumns = useCallback(
    (rowCount: number, idPrefix: string): ReactNode => {
      const quotient = Math.ceil(rowCount / 2);
      const column = (
        <BracketColumn
          rowCount={quotient}
          idPrefix={`${idPrefix}-${quotient}`}
        />
      );
      return quotient > 1 ? (
        <>
          {column}
          {getBracketColumns(quotient, idPrefix)}
        </>
      ) : (
        <>{column}</>
      );
    },
    []
  );

  const winnersBracket = useMemo(() => {
    const rowCount = players.length;
    return (
      <Box flex direction="row">
        {rowCount ? getBracketColumns(rowCount, "winners") : <Text>Empty</Text>}
      </Box>
    );
  }, []);

  const losersBracket = useMemo(() => {
    const rowCount = players.length;
    return (
      <Box flex direction="row">
        {rowCount ? getBracketColumns(rowCount, "losers") : <Text>Empty</Text>}
      </Box>
    );
  }, []);

  return (
    <PageContent>
      <Anchor
        icon={<FormPreviousLink />}
        label="Back"
        onClick={() => setActivePage(PageKind.home)}
      />
      <Form
        value={bracketData}
        onChange={(value) => setBracketData(value)}
        onReset={() => setBracketData({})}
      >
        <Heading level="2">Winners</Heading>
        {winnersBracket}
        <Heading level="2">Losers</Heading>
        {losersBracket}
        <Button
          fill="horizontal"
          margin={{ top: "medium" }}
          type="reset"
          label="Reset"
          onClick={() => playSfx()}
        />
      </Form>
    </PageContent>
  );
}

export default Brackets;
