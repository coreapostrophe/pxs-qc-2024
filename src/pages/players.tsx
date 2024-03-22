import {
  Anchor,
  Box,
  Button,
  Heading,
  PageContent,
  Text,
  TextArea,
} from "grommet";
import { FormPreviousLink } from "grommet-icons";
import { PageKind, usePages } from "../hooks/page";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useScores } from "../hooks/score";

function Players() {
  const { players, setPlayers } = useScores();
  const { setActivePage } = usePages();
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(players.join("\n"));
  }, []);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setValue(event.target.value);
    },
    []
  );
  const handleSave = useCallback(() => {
    setPlayers(value.split("\n").filter((v) => v));
  }, [value]);

  return (
    <PageContent>
      <Anchor
        icon={<FormPreviousLink />}
        label="Back"
        onClick={() => setActivePage(PageKind.home)}
      />
      <Heading level="2">Players</Heading>
      <TextArea
        placeholder="type here"
        value={value}
        resize="vertical"
        onChange={handleChange}
        style={{ height: "300px" }}
      />
      <Box>
        <Button
          primary
          margin={{ vertical: "medium" }}
          label="Save"
          onClick={handleSave}
        />
      </Box>
    </PageContent>
  );
}

export default Players;
