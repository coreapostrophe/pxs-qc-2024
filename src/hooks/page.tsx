import { Page } from "grommet";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { playSfx } from "../utils/sfx";

export enum PageKind {
  home = "home",
  players = "players",
  brackets = "brackets",
  randomizer = "randomizer",
  teamMaker = "teamMaker",
}
export type PageMap = Record<PageKind, ReactNode>;

interface Context {
  activePage: PageKind;
  setActivePage: (value: PageKind) => void;
}

const PagesContext = createContext<Context>({
  activePage: PageKind.home,
  setActivePage: () => {},
});
export const usePages = () => useContext(PagesContext);

export function Pages(props: { pageMap: PageMap }) {
  const { pageMap } = props;
  const [activePage, _setActivePage] = useState<PageKind>(PageKind.home);

  const setActivePage = (value: PageKind) => {
    playSfx();
    _setActivePage(value);
  };

  const contextValue = useMemo(
    () => ({
      activePage,
      setActivePage,
    }),
    [activePage, setActivePage]
  );
  return (
    <PagesContext.Provider value={contextValue}>
      <Page height="100vh" kind="narrow" pad={{ vertical: "medium" }}>
        {pageMap[activePage]}
      </Page>
    </PagesContext.Provider>
  );
}
