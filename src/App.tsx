import {
  Accordion,
  AccordionPanel,
  Box,
  Button,
  Clock,
  Grommet,
  Heading,
  Page,
  PageContent,
  Text,
  grommet,
} from "grommet";
import { PageMap, Pages } from "./hooks/page";
import Home from "./pages/home";
import { ScoreProvider } from "./hooks/score";
import Players from "./pages/players";

const pageMap: PageMap = {
  home: <Home />,
  players: <Players />,
};

function App() {
  return (
    <Grommet full theme={grommet} themeMode="dark">
      <ScoreProvider>
        <Pages pageMap={pageMap} />
      </ScoreProvider>
    </Grommet>
  );
}

export default App;
