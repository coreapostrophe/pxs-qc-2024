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

const pageMap: PageMap = {
  home: <Home />,
};

function App() {
  return (
    <Grommet full theme={grommet} themeMode="dark">
      <Pages pageMap={pageMap} />
    </Grommet>
  );
}

export default App;
