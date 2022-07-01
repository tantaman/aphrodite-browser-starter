import * as React from "react";
import { createRoot } from "react-dom/client";

import { createResolver } from "@aphro/absurd-sql-connector";
import { anonymous, sql } from "@aphro/runtime-ts";
import TodoTable from "./generated/Todo.sqlite.sql";
import TodoListTable from "./generated/TodoList.sqlite.sql";
import { context, Context } from "@aphro/runtime-ts";
import App from "./App.js";
import TodoList from "./generated/TodoList.js";
import TodoListMutations from "./generated/TodoListMutations.js";

createResolver()
  .then((resolver) => {
    // TODO: framework should take care of viewer creation?
    const ctx = context(anonymous(), resolver);
    start(ctx);
  })
  .catch((e) => console.error(e));

async function bootstrap(ctx: Context): Promise<TodoList> {
  const db = ctx.dbResolver.engine("sqlite").db("test");

  // Since we don't yet support migrations. Drop during development.
  // await Promise.allSettled([
  //   db.query(sql`DROP TABLE IF EXISTS todo`),
  //   db.query(sql`DROP TABLE IF EXISTS todolist`),
  // ]);

  await Promise.all([
    db.query(sql.__dangerous__rawValue(TodoListTable)),
    db.query(sql.__dangerous__rawValue(TodoTable)),
  ]);

  const lists = await TodoList.queryAll(ctx).gen();
  let list: TodoList;
  let _;
  if (lists.length === 0) {
    [_, list] = TodoListMutations.create(ctx, {}).save();
  } else {
    list = lists[0];
  }

  return list;
}

async function start(ctx: Context) {
  const list = await bootstrap(ctx);

  const root = createRoot(document.getElementById("container"));
  root.render(<App list={list} />);
}
