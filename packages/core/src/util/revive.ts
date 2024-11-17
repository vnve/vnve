export async function reviveList(
  childClassMap: ClassMap,
  childrenJSON: AnyJSON,
) {
  if (!childrenJSON) {
    return [];
  }

  const children = [];

  for (const json of childrenJSON) {
    const child = await reviveItem(childClassMap, json);

    children.push(child);
  }

  return children;
}

export async function reviveItem(childClassMap: ClassMap, childJSON: AnyJSON) {
  const ChildClass = childClassMap[childJSON.__type];
  const child = await ChildClass.fromJSON(childJSON);

  return child;
}
