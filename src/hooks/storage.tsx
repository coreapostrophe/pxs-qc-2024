import {
  createContext,
  MutableRefObject,
  PropsWithChildren,
  useContext,
  useMemo,
  useRef,
} from "react";
import { Store } from "tauri-plugin-store-api";

interface Context {
  store: MutableRefObject<Store | null>;
  saveData: <T>(key: string, value: T) => void;
  getData: (
    key: string,
    successCallback: (value: unknown) => void | PromiseLike<void>
  ) => void;
  manualSave: () => void;
}

const StorageContext = createContext<Context>({
  store: { current: null },
  saveData: () => {},
  getData: () => {},
  manualSave: () => {},
});
export const useStorage = () => useContext(StorageContext);

export function StorageProvider(props: PropsWithChildren) {
  const store = useRef(new Store("save.dat"));

  const manualSave = () => {
    store.current.save().catch((e) => console.error(e));
  };

  const saveData = <T,>(key: string, value: T) => {
    store.current.set(key, value).catch((e) => console.error(e));
  };

  const getData = (
    key: string,
    successCallback: (value: unknown) => void | PromiseLike<void>
  ) => {
    store.current
      .get(key)
      .then(successCallback)
      .catch((e) => console.error(e));
  };

  const contextValue = useMemo(
    () => ({
      store,
      saveData,
      getData,
      manualSave,
    }),
    [store, saveData, getData, manualSave]
  );

  return (
    <StorageContext.Provider value={contextValue}>
      {props.children}
    </StorageContext.Provider>
  );
}
