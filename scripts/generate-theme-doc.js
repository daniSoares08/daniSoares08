import fs from "fs";
import { themes } from "../themes/index.js";

const TARGET_FILE = "./themes/README.md";
const REPO_CARD_LINKS_FLAG = "<!-- REPO_CARD_LINKS -->";
const STAT_CARD_LINKS_FLAG = "<!-- STATS_CARD_LINKS -->";

const STAT_CARD_TABLE_FLAG = "<!-- STATS_CARD_TABLE -->";
const REPO_CARD_TABLE_FLAG = "<!-- REPO_CARD_TABLE -->";

const THEME_TEMPLATE = `## Available Themes

<!-- DO NOT EDIT THIS FILE DIRECTLY -->

With inbuilt themes, you can customize the look of the card without doing any manual customization.

Use \`?theme=THEME_NAME\` parameter like so:

\`\`\`md
![Anurag's GitHub stats](https://github-readme-stats.vercel.app/api?username=anuraghazra&theme=dark&show_icons=true)
\`\`\`

## Stats

> These themes works with all five our cards: Stats Card, Repo Card, Gist Card, Top languages Card and WakaTime Card.

| | | |
| :--: | :--: | :--: |
${STAT_CARD_TABLE_FLAG}

## Repo Card

> These themes works with all five our cards: Stats Card, Repo Card, Gist Card, Top languages Card and WakaTime Card.

| | | |
| :--: | :--: | :--: |
${REPO_CARD_TABLE_FLAG}

${STAT_CARD_LINKS_FLAG}

${REPO_CARD_LINKS_FLAG}


[add-theme]: https://github.com/anuraghazra/github-readme-stats/edit/master/themes/index.js

Want to add a new theme? Consider reading the [contribution guidelines](../CONTRIBUTING.md#themes-contribution) :D
`;

const createRepoMdLink = (theme) => {
  return `\n[${theme}_repo]: https://github-readme-stats.vercel.app/api/pin/?username=anuraghazra&repo=github-readme-stats&cache_seconds=86400&theme=${theme}`;
};
const createStatMdLink = (theme) => {
  return `\n[${theme}]: https://github-readme-stats.vercel.app/api?username=anuraghazra&show_icons=true&hide=contribs,prs&cache_seconds=86400&theme=${theme}`;
};

const generateLinks = (fn) => {
  return Object.keys(themes)
    .map((name) => fn(name))
    .join("");
};

const createTableItem = ({ link, label, isRepoCard }) => {
  if (!link || !label) {
    return "";
  }
  return `\`${label}\` ![${link}][${link}${isRepoCard ? "_repo" : ""}]`;
};

const generateTable = ({ isRepoCard }) => {
  const rows = [];
  const themesFiltered = Object.keys(themes).filter(
    (name) => name !== (isRepoCard ? "default" : "default_repocard"),
  );

  for (let i = 0; i < themesFiltered.length; i += 3) {
    const one = themesFiltered[i];
    const two = themesFiltered[i + 1];
    const three = themesFiltered[i + 2];

    let tableItem1 = createTableItem({ link: one, label: one, isRepoCard });
    let tableItem2 = createTableItem({ link: two, label: two, isRepoCard });
    let tableItem3 = createTableItem({ link: three, label: three, isRepoCard });

    if (three === undefined) {
      tableItem3 = `[Add your theme][add-theme]`;
    }
    rows.push(`| ${tableItem1} | ${tableItem2} | ${tableItem3} |`);

    // if it's the last row & the row has no empty space push a new row
    if (three && i + 3 === themesFiltered.length) {
      rows.push(`| [Add your theme][add-theme] | | |`);
    }
  }

  return rows.join("\n");
};

const buildReadme = () => {
  return THEME_TEMPLATE.split("\n")
    .map((line) => {
      if (line.includes(REPO_CARD_LINKS_FLAG)) {
        return generateLinks(createRepoMdLink);
      }
      if (line.includes(STAT_CARD_LINKS_FLAG)) {
        return generateLinks(createStatMdLink);
      }
      if (line.includes(REPO_CARD_TABLE_FLAG)) {
        return generateTable({ isRepoCard: true });
      }
      if (line.includes(STAT_CARD_TABLE_FLAG)) {
        return generateTable({ isRepoCard: false });
      }
      return line;
    })
    .join("\n");
};

fs.writeFileSync(TARGET_FILE, buildReadme());
