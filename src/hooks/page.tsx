import { Page } from "grommet";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

export enum PageKind {
  home = "home",
}
export type PageMap = Record<PageKind, ReactNode>;

export interface Context {
  activePage: PageKind;
  setActivePage: React.Dispatch<React.SetStateAction<PageKind>>;
}

export const PagesContext = createContext<Context>({
  activePage: PageKind.home,
  setActivePage: () => {},
});
export const usePages = () => useContext(PagesContext);

export function Pages(props: { pageMap: PageMap }) {
  const { pageMap } = props;
  const [activePage, setActivePage] = useState(PageKind.home);

  const contextValue = useMemo(
    () => ({
      activePage,
      setActivePage,
    }),
    [activePage, setActivePage]
  );

  return (
    <PagesContext.Provider value={contextValue}>
      <Page kind="narrow">{pageMap[activePage]}</Page>
    </PagesContext.Provider>
  );
}
