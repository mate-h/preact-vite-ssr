import { app } from "./firebase-client";
import { deepClone, fullStateDiff, id } from "./utils";
import { getFirestore, doc, runTransaction } from "firebase/firestore";
import { Module, StateKeys, useStore } from "./store";
import { merge, omit, set } from "lodash";

// mirror the storeon state to firebase
// within the current user's scope

/** State key to config mapping */
type Config = Record<StateKeys, {
  /** Path to a collection in Firestore */
  collection?: string;
  /** Whether to use onSnapshot listener, default false */
  realtime?: boolean;
}>;
export type SavedState = "saving" | "saved" | "error";

export type State = {
  savedStates: Record<StateKeys, Record<string, SavedState>>;
};

export type Events = {
  "@save": { path: StateKeys; value: Record<string, any> };
  "@push": { path: StateKeys; id: string }[];
  "@error": { path: StateKeys; id: string }[];
  "@retry": StateKeys;
};

export function save(paths: StateKeys[], config?: Config) {
  // support Record<string, any>
  // autosave to firestore collection
  const db = getFirestore(app);

  let module: Module = (store) => {
    function getConfig(path: StateKeys) {
      const {
        collection = path,
        realtime = true,
      } = config?.[path] || {};
      return { collection, realtime };
    }

    store.on("@init", (init) => {
      const userId = init.pageProps.user?.uid || init.id;
      let initStates = paths.reduce((acc, key) => {
        let initValue = init[key];
        if (initValue && typeof initValue === "object") {
          acc[key] = deepClone(initValue);
        } else {
          console.warn(`No initial state for path: "${key}"`);
          acc[key] = {};
        }
        return acc;
      }, {} as Record<StateKeys, Record<string, any>>);
      let prevStates = deepClone(initStates);
      function updateInit(path: StateKeys, newValue: Record<string, any>) {
        initStates = set(initStates, path, deepClone(newValue));
      }
      function updatePrev() {
        prevStates = deepClone(initStates);
      }
      function revertInit() {
        initStates = deepClone(prevStates);
      }

      store.on("@changed", async (state) => {
        function comparePaths() {
          type Item = ReturnType<typeof fullStateDiff>[0] & { path: StateKeys };
          return paths.reduce((acc, path) => {
            const initValue = initStates[path];
            // check if initValue is an instance of Record<string, any>
            if (initValue && typeof initValue === "object") {
              const newValue = state[path] as Record<string, any>;
              // compare the current state to the init state
              const diffs = fullStateDiff(initValue, newValue);
              if (diffs.length >= 1) {
                acc.push(...diffs.map((diff) => ({ path, ...diff })));
                // updateInit(path, deepClone(newValue));
              }
            }
            return acc;
          }, [] as Item[]);
        }
        // for each path in the config
        // update the firestore collection
        const documentRefs = comparePaths().map((diff) => {
          // add role for new documents
          let data = diff.current as any;
          if (diff.type === "set" && userId) {
            data.roles = {
              [userId]: "owner",
            };
          }
          return {
            operation: diff.type,
            ref: doc(db, getConfig(diff.path).collection, diff.id),
            data: diff.current as any,
            path: diff.path,
            id: diff.id,
          };
        });
        // TODO: batch requests if there is no network

        if (documentRefs.length >= 1 && userId) {
          // update init state to avoid infinite loop
          documentRefs.forEach((d) => {
            if (d.operation === "set" || d.operation === "update") {
              initStates = set(initStates, [d.path, d.id], deepClone(d.data));
            } else if (d.operation === "delete") {
              const s = initStates[d.path];
              initStates = set(initStates, d.path, omit(s, d.id));
            }
          });
          store.dispatch(
            "@push",
            documentRefs.map((d) => ({ path: d.path, id: d.id }))
          );
          await runTransaction(db, async (transaction) => {
            for (const { ref, data, operation } of documentRefs) {
              if (operation === "set") {
                await transaction.set(ref, data);
              } else if (operation === "update") {
                await transaction.update(ref, data);
              } else if (operation === "delete") {
                await transaction.delete(ref);
              }
            }
          }).catch((e) => {
            console.error(e);
            store.dispatch(
              "@error",
              documentRefs.map((d) => ({ path: d.path, id: d.id }))
            );
          });
          
          // passive @save for non-realtime updates
          paths.forEach((path) => {
            const {realtime} = getConfig(path);
            if (!realtime) {
              store.dispatch("@save", { path, value: initStates[path] });
            }
          });
        } else if (!userId) {
          // TODO: persist to local storage temporarily
        }
      });

      store.on("@push", (state, event) => {
        let savedStates = state.savedStates;
        event.forEach(({ path, id }) => {
          savedStates = set(savedStates, [path, id], "saving" as SavedState);
        });
        return set(state, "savedStates", savedStates);
      });

      store.on("@error", (state, event) => {
        let savedStates = state.savedStates;
        event.forEach(({ path, id }) => {
          savedStates = set(savedStates, [path, id], "error" as SavedState);
        });

        // revert init state
        // revertInit();
        // this will trigger a re-push because init state is out of sync
        return set(state, "savedStates", savedStates);
      });

      store.on("@retry", (state, path) => {
        let savedStates = state.savedStates[path];
        // for any error state, set to saving
        const newStates = Object.fromEntries(
          Object.entries(savedStates).map(([id, s]) => {
            if (s === "error") {
              return [id, "saving"];
            }
            return [id, s];
          })
        );
        // revert init state at path and set saved states
        initStates[path] = deepClone(prevStates[path]);
        // trigger re-push with difference in init state and current state
        return set(state, ["savedStates", path], newStates);
      });

      store.on("@save", (state, event) => {
        // update previous state
        updatePrev();

        let savedStates = state.savedStates;
        const ids = Object.keys(event.value);
        ids.forEach((id) => {
          savedStates = set(
            savedStates,
            [event.path, id],
            "saved" as SavedState
          );
        });

        const clonedValue = JSON.stringify(event.value);
        initStates = set(initStates, event.path, JSON.parse(clonedValue));
        // merge store value with fresh data
        const localData = state[event.path];
        const newData = JSON.parse(clonedValue);
        state = set(state, event.path, merge(localData, newData));
        return set(state, "savedStates", savedStates);
      });

      // return initial state
      return {
        savedStates: paths.reduce((acc, curr) => {
          // empty Record<string, SavedState>
          acc[curr] = {};
          return acc;
        }, {} as State["savedStates"]),
      };
    });

    store.on("@init", async (init) => {
      const userId = init.pageProps.user?.uid || init.id;
      if (!import.meta.env.SSR && import.meta.env.VITE_ENV_SCRIPT !== "dev") {
        const { onSnapshot, collection, where, query } = await import(
          "firebase/firestore"
        );

        // setup snapshot listeners for each path
        paths.forEach((path) => {
          const {collection: name, realtime} = getConfig(path);
          if (!realtime) {
            return;
          }
          // listen for changes to the collection within the current user's scope
          const queryRef = query(
            collection(db, name),
            where("roles." + userId, "==", "owner")
          );
          onSnapshot(queryRef, (snapshot) => {
            const docs = snapshot.docs.map((doc) => doc.data());
            if (docs.length === 0) {
              store.dispatch("@save", { path, value: {} });
              return;
            }
            const newState: Record<string, any> = docs.reduce((acc, doc) => {
              acc[doc.id] = doc;
              return acc;
            }, {});
            store.dispatch("@save", {
              path,
              value: newState,
            });
          });
        });
      }
    });
  };
  return module;
}

export function useSavedState(path: StateKeys, id: string) {
  const { savedStates } = useStore("savedStates");
  const savedState = savedStates[path][id];
  return savedState;
}

export function useSavedStates(path: StateKeys) {
  const { savedStates } = useStore("savedStates");
  if (!savedStates) {
    return {};
  }
  const savedState = savedStates[path];
  if (!savedState) {
    return {};
  }
  return savedState;
}
