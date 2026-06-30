export function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export async function loadChildrenForParents<TParent, TChild>(
  parents: TParent[],
  loadChildren: (parent: TParent) => Promise<TChild[]>,
  assignChildren: (parent: TParent, children: TChild[]) => void
) {
  for (const parent of parents) {
    assignChildren(parent, await loadChildren(parent));
  }
}
