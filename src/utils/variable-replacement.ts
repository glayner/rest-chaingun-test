export function replaceMarkers(data: any, variables: Record<string, any>) {
  if (typeof data === "string") {
    return replaceVariable(data, variables);
  } else if (Array.isArray(data)) {
    data = data.map((item) => replaceMarkers(item, variables));
  } else if (typeof data === "object" && data !== null) {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        data[key] = replaceMarkers(data[key], variables);
      }
    }
  }
  return data;
}

function replaceVariable(data: string, variables: Record<string, any>) {
  const singleVariableRegex = /^{{(.*?)}}$/;
  const inlineVariableRegex = /{{(.*?)}}/g;

  // Verifica se a string é exatamente uma única variável
  const singleVariableMatch = data.match(singleVariableRegex);

  if (singleVariableMatch && !singleVariableMatch[1].includes("}}")) {
    try {
      return new Function("variables", `return variables.${singleVariableMatch[1]}`)(variables);
    } catch {
      return "";
    }
  }

  // Substitui variáveis inline em strings compostas
  return data.replace(inlineVariableRegex, (_, expression) => {
    try {
      const value = new Function("variables", `return variables.${expression}`)(variables);
      return value !== undefined ? value : "";
    } catch {
      return "";
    }
  });
}
