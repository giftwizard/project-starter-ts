import { DistinctQuestion, prompt } from 'inquirer';

import { Runner, TypescriptStarterCLIOptions, validateName } from './utils';

export async function inquire(): Promise<TypescriptStarterCLIOptions> {
  const packageNameQuestion: DistinctQuestion = {
    filter: (answer: string) => answer.trim(),
    message: '📦 Enter the new package name:',
    name: 'projectName',
    type: 'input',
    validate: validateName,
  };

  enum ProjectType {
    Node = 'node',
    Library = 'lib',
  }
  const projectTypeQuestion: DistinctQuestion = {
    choices: [
      { name: 'Node.js application', value: ProjectType.Node },
      { name: 'Javascript library', value: ProjectType.Library },
    ],
    message: '🔨 What are you making?',
    name: 'type',
    type: 'list',
  };

  const packageDescriptionQuestion: DistinctQuestion = {
    filter: (answer: string) => answer.trim(),
    message: '💬 Enter the package description:',
    name: 'description',
    type: 'input',
  };

  const runnerQuestion: DistinctQuestion = {
    choices: [
      { name: 'npm', value: Runner.Npm },
      { name: 'yarn', value: Runner.Yarn },
    ],
    message: '🚄 Will this project use npm or yarn?',
    name: 'runner',
    type: 'list',
    default: Runner.Yarn,
  };

  enum TypeDefinitions {
    none = 'none',
    node = 'node',
    dom = 'dom',
    nodeAndDom = 'both',
  }

  const typeDefsQuestion: DistinctQuestion = {
    choices: [
      {
        name: `None — the library won't use any globals or modules from Node.js or the DOM`,
        value: TypeDefinitions.none,
      },
      {
        name: `Node.js — parts of the library require access to Node.js globals or built-in modules`,
        value: TypeDefinitions.node,
      },
      {
        name: `DOM — parts of the library require access to the Document Object Model (DOM)`,
        value: TypeDefinitions.dom,
      },
      {
        name: `Both Node.js and DOM — some parts of the library require Node.js, other parts require DOM access`,
        value: TypeDefinitions.nodeAndDom,
      },
    ],
    message: '📚 Which global type definitions do you want to include?',
    name: 'definitions',
    type: 'list',
    default: TypeDefinitions.node,
    when: (answers) => answers.type === ProjectType.Library,
  };

  enum Extras {
    vscode = 'vscode',
  }
  const extrasQuestion: DistinctQuestion = {
    choices: [
      {
        checked: true,
        name: 'Include VS Code debugging config',
        value: Extras.vscode,
      },
    ],
    message: '🚀 More fun stuff:',
    name: 'extras',
    type: 'checkbox',
  };

  return prompt([
    packageNameQuestion,
    projectTypeQuestion,
    packageDescriptionQuestion,
    runnerQuestion,
    typeDefsQuestion,
    extrasQuestion,
  ]).then((answers) => {
    const {
      definitions,
      description,
      extras,
      projectName,
      runner,
      type,
    } = answers as {
      readonly definitions?: TypeDefinitions;
      readonly description: string;
      readonly extras: ReadonlyArray<string>;
      readonly projectName: string;
      readonly runner: Runner;
      readonly type: ProjectType;
    };
    return {
      description,
      domDefinitions: definitions
        ? [TypeDefinitions.dom, TypeDefinitions.nodeAndDom].includes(
            definitions
          )
        : false,
      install: true,
      nodeDefinitions: definitions
        ? [TypeDefinitions.node, TypeDefinitions.nodeAndDom].includes(
            definitions
          )
        : type === ProjectType.Node,
      projectName,
      runner,
      vscode: extras.includes(Extras.vscode),
    };
  });
}
