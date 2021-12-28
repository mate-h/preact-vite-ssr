import { PageContext, PageProps } from "types";
import admin from "firebase-admin";
import { reduceSnapshot } from "utils";

export { onBeforeRender }

async function onBeforeRender(pageContext: PageContext) {
  // fetch todos for current user
  const db = admin.firestore();
  const todos = await db.collection("todos").get();
  const pageProps: PageProps = {
    todos: reduceSnapshot(todos)
  }
  return {
    pageContext: {
      pageProps
    }
  }
}