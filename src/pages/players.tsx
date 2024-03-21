import { Anchor, Heading, PageContent, Text, TextArea } from "grommet";
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

  useEffect(() => {
    setPlayers(value.split("\n").filter((v) => v));
  }, [value]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setValue(event.target.value);
    },
    []
  );

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
        style={{ height: "400px" }}
      />
    </PageContent>
  );
}

export default Players;
