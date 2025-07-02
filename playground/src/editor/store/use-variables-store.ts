import { ExpressionError } from "../workflow";

export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
}

export const getVariablesStore = () => {
  const variables = [
    {
      id: "variable1",
      key: "var1",
      value: "Hello, World!",
    },
    {
      id: "variable2",
      key: "var2",
      value: "1000",
    },
    {
      id: "variable3",
      key: "var3",
      value: "1000",
    },
  ];
  
  const variablesAsObject = () => {
    const asObject = variables.reduce<
      Record<string, string | boolean | number>
    >((acc, variable) => {
      acc[variable.key] = variable.value;
      return acc;
    }, {});

    return new Proxy(asObject, {
      set() {
        throw new ExpressionError(
          "Cannot assign values to variables at runtime"
        );
      },
    });
  };

  return {
    variables,
    variablesAsObject,
  };
};
