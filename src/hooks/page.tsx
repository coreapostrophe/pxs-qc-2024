import { Page } from "grommet";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

export enum PageKind {
  home = "home",
  players = "players",
  brackets = "brackets",
  randomizer = "randomizer",
}
export type PageMap = Record<PageKind, ReactNode>;

interface Context {
  activePage: PageKind;
  setActivePage: React.Dispatch<React.SetStateAction<PageKind>>;
}

const PagesContext = createContext<Context>({
  activePage: PageKind.home,
  setActivePage: () => {},
});
export const usePages = () => useContext(PagesContext);

export function Pages(props: { pageMap: PageMap }) {
  const { pageMap } = props;
  const [activePage, setActivePage] = useState<PageKind>(PageKind.home);

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
