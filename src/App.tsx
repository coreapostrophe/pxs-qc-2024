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
import { StorageProvider } from "./hooks/storage";
import Brackets from "./pages/brackets";
import Randomizer from "./pages/randomizer";

const pageMap: PageMap = {
  home: <Home />,
  players: <Players />,
  brackets: <Brackets />,
  randomizer: <Randomizer />,
};

function App() {
  return (
    <Grommet full theme={grommet} themeMode="dark">
      <StorageProvider>
        <ScoreProvider>
          <Pages pageMap={pageMap} />
        </ScoreProvider>
      </StorageProvider>
    </Grommet>
  );
}

export default App;
