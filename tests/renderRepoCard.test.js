import { queryByTestId } from "@testing-library/dom";
import "@testing-library/jest-dom";
import { cssToObject } from "@uppercod/css-to-object";
import { renderRepoCard } from "../src/cards/repo-card.js";
import { expect, it, describe } from "@jest/globals";

import { themes } from "../themes/index.js";

const data_repo = {
  repository: {
    nameWithOwner: "anuraghazra/convoychat",
    name: "convoychat",
    description: "Help us take over the world! React + TS + GraphQL Chat App",
    primaryLanguage: {
      color: "#2b7489",
      id: "MDg6TGFuZ3VhZ2UyODc=",
      name: "TypeScript",
    },
    starCount: 38000,
    forkCount: 100,
  },
};

describe("Test renderRepoCard", () => {
  it("should render correctly", () => {
    document.body.innerHTML = renderRepoCard(data_repo.repository);

    const [header] = document.getElementsByClassName("header");

    expect(header).toHaveTextContent("convoychat");
    expect(header).not.toHaveTextContent("anuraghazra");
    expect(document.getElementsByClassName("description")[0]).toHaveTextContent(
      "Help us take over the world! React + TS + GraphQL Chat App",
    );
    expect(queryByTestId(document.body, "stargazers")).toHaveTextContent("38k");
    expect(queryByTestId(document.body, "forkcount")).toHaveTextContent("100");
    expect(queryByTestId(document.body, "lang-name")).toHaveTextContent(
      "TypeScript",
    );
    expect(queryByTestId(document.body, "lang-color")).toHaveAttribute(
      "fill",
      "#2b7489",
    );
  });

  it("should display username in title (full repo name)", () => {
    document.body.innerHTML = renderRepoCard(data_repo.repository, {
      show_owner: true,
    });
    expect(document.getElementsByClassName("header")[0]).toHaveTextContent(
      "anuraghazra/convoychat",
    );
  });

  it("should trim header", () => {
    document.body.innerHTML = renderRepoCard({
      ...data_repo.repository,
      name: "some-really-long-repo-name-for-test-purposes",
    });

    expect(document.getElementsByClassName("header")[0].textContent).toBe(
      "some-really-long-repo-name-for-test...",
    );
  });

  it("should trim description", () => {
    document.body.innerHTML = renderRepoCard({
      ...data_repo.repository,
      description:
        "The quick brown fox jumps over the lazy dog is an English-language pangram—a sentence that contains all of the letters of the English alphabet",
    });

    expect(
      document.getElementsByClassName("description")[0].children[0].textContent,
    ).toBe("The quick brown fox jumps over the lazy dog is an");

    expect(
      document.getElementsByClassName("description")[0].children[1].textContent,
    ).toBe("English-language pangram—a sentence that contains all");

    // Should not trim
    document.body.innerHTML = renderRepoCard({
      ...data_repo.repository,
      description: "Small text should not trim",
    });

    expect(document.getElementsByClassName("description")[0]).toHaveTextContent(
      "Small text should not trim",
    );
  });

  it("should render emojis", () => {
    document.body.innerHTML = renderRepoCard({
      ...data_repo.repository,
      description: "This is a text with a :poop: poo emoji",
    });

    // poop emoji may not show in all editors but it's there between "a" and "poo"
    expect(document.getElementsByClassName("description")[0]).toHaveTextContent(
      "This is a text with a 💩 poo emoji",
    );
  });

  it("should hide language if primaryLanguage is null & fallback to correct values", () => {
    document.body.innerHTML = renderRepoCard({
      ...data_repo.repository,
      primaryLanguage: null,
    });

    expect(queryByTestId(document.body, "primary-lang")).toBeNull();

    document.body.innerHTML = renderRepoCard({
      ...data_repo.repository,
      primaryLanguage: { color: null, name: null },
    });

    expect(queryByTestId(document.body, "primary-lang")).toBeInTheDocument();
    expect(queryByTestId(document.body, "lang-color")).toHaveAttribute(
      "fill",
      "#333",
    );

    expect(queryByTestId(document.body, "lang-name")).toHaveTextContent(
      "Unspecified",
    );
  });

  it("should render default colors properly", () => {
    document.body.innerHTML = renderRepoCard(data_repo.repository);

    const styleTag = document.querySelector("style");
    const stylesObject = cssToObject(styleTag.innerHTML);

    const headerClassStyles = stylesObject[":host"][".header "];
    const descClassStyles = stylesObject[":host"][".description "];
    const iconClassStyles = stylesObject[":host"][".icon "];

    expect(headerClassStyles.fill.trim()).toBe("#2f80ed");
    expect(descClassStyles.fill.trim()).toBe("#434d58");
    expect(iconClassStyles.fill.trim()).toBe("#586069");
    expect(queryByTestId(document.body, "card-bg")).toHaveAttribute(
      "fill",
      "#fffefe",
    );
  });

  it("should render custom colors properly", () => {
    const customColors = {
      title_color: "5a0",
      icon_color: "1b998b",
      text_color: "9991",
      bg_color: "252525",
    };

    document.body.innerHTML = renderRepoCard(data_repo.repository, {
      ...customColors,
    });

    const styleTag = document.querySelector("style");
    const stylesObject = cssToObject(styleTag.innerHTML);

    const headerClassStyles = stylesObject[":host"][".header "];
    const descClassStyles = stylesObject[":host"][".description "];
    const iconClassStyles = stylesObject[":host"][".icon "];

    expect(headerClassStyles.fill.trim()).toBe(`#${customColors.title_color}`);
    expect(descClassStyles.fill.trim()).toBe(`#${customColors.text_color}`);
    expect(iconClassStyles.fill.trim()).toBe(`#${customColors.icon_color}`);
    expect(queryByTestId(document.body, "card-bg")).toHaveAttribute(
      "fill",
      "#252525",
    );
  });

  it("should render with all the themes", () => {
    Object.keys(themes).forEach((name) => {
      document.body.innerHTML = renderRepoCard(data_repo.repository, {
        theme: name,
      });

      const styleTag = document.querySelector("style");
      const stylesObject = cssToObject(styleTag.innerHTML);

      const headerClassStyles = stylesObject[":host"][".header "];
      const descClassStyles = stylesObject[":host"][".description "];
      const iconClassStyles = stylesObject[":host"][".icon "];

      expect(headerClassStyles.fill.trim()).toBe(
        `#${themes[name].title_color}`,
      );
      expect(descClassStyles.fill.trim()).toBe(`#${themes[name].text_color}`);
      expect(iconClassStyles.fill.trim()).toBe(`#${themes[name].icon_color}`);
      const backgroundElement = queryByTestId(document.body, "card-bg");
      const backgroundElementFill = backgroundElement.getAttribute("fill");
      expect([`#${themes[name].bg_color}`, "url(#gradient)"]).toContain(
        backgroundElementFill,
      );
    });
  });

  it("should render custom colors with themes", () => {
    document.body.innerHTML = renderRepoCard(data_repo.repository, {
      title_color: "5a0",
      theme: "radical",
    });

    const styleTag = document.querySelector("style");
    const stylesObject = cssToObject(styleTag.innerHTML);

    const headerClassStyles = stylesObject[":host"][".header "];
    const descClassStyles = stylesObject[":host"][".description "];
    const iconClassStyles = stylesObject[":host"][".icon "];

    expect(headerClassStyles.fill.trim()).toBe("#5a0");
    expect(descClassStyles.fill.trim()).toBe(`#${themes.radical.text_color}`);
    expect(iconClassStyles.fill.trim()).toBe(`#${themes.radical.icon_color}`);
    expect(queryByTestId(document.body, "card-bg")).toHaveAttribute(
      "fill",
      `#${themes.radical.bg_color}`,
    );
  });

  it("should render custom colors with themes and fallback to default colors if invalid", () => {
    document.body.innerHTML = renderRepoCard(data_repo.repository, {
      title_color: "invalid color",
      text_color: "invalid color",
      theme: "radical",
    });

    const styleTag = document.querySelector("style");
    const stylesObject = cssToObject(styleTag.innerHTML);

    const headerClassStyles = stylesObject[":host"][".header "];
    const descClassStyles = stylesObject[":host"][".description "];
    const iconClassStyles = stylesObject[":host"][".icon "];

    expect(headerClassStyles.fill.trim()).toBe(
      `#${themes.default.title_color}`,
    );
    expect(descClassStyles.fill.trim()).toBe(`#${themes.default.text_color}`);
    expect(iconClassStyles.fill.trim()).toBe(`#${themes.radical.icon_color}`);
    expect(queryByTestId(document.body, "card-bg")).toHaveAttribute(
      "fill",
      `#${themes.radical.bg_color}`,
    );
  });

  it("should not render star count or fork count if either of the are zero", () => {
    document.body.innerHTML = renderRepoCard({
      ...data_repo.repository,
      starCount: 0,
    });

    expect(queryByTestId(document.body, "stargazers")).toBeNull();
    expect(queryByTestId(document.body, "forkcount")).toBeInTheDocument();

    document.body.innerHTML = renderRepoCard({
      ...data_repo.repository,
      starCount: 1,
      forkCount: 0,
    });

    expect(queryByTestId(document.body, "stargazers")).toBeInTheDocument();
    expect(queryByTestId(document.body, "forkcount")).toBeNull();

    document.body.innerHTML = renderRepoCard({
      ...data_repo.repository,
      starCount: 0,
      forkCount: 0,
    });

    expect(queryByTestId(document.body, "stargazers")).toBeNull();
    expect(queryByTestId(document.body, "forkcount")).toBeNull();
  });

  it("should render badges", () => {
    document.body.innerHTML = renderRepoCard({
      ...data_repo.repository,
      isArchived: true,
    });

    expect(queryByTestId(document.body, "badge")).toHaveTextContent("Archived");

    document.body.innerHTML = renderRepoCard({
      ...data_repo.repository,
      isTemplate: true,
    });
    expect(queryByTestId(document.body, "badge")).toHaveTextContent("Template");
  });

  it("should not render template", () => {
    document.body.innerHTML = renderRepoCard({
      ...data_repo.repository,
    });
    expect(queryByTestId(document.body, "badge")).toBeNull();
  });

  it("should render translated badges", () => {
    document.body.innerHTML = renderRepoCard(
      {
        ...data_repo.repository,
        isArchived: true,
      },
      {
        locale: "cn",
      },
    );

    expect(queryByTestId(document.body, "badge")).toHaveTextContent("已归档");

    document.body.innerHTML = renderRepoCard(
      {
        ...data_repo.repository,
        isTemplate: true,
      },
      {
        locale: "cn",
      },
    );
    expect(queryByTestId(document.body, "badge")).toHaveTextContent("模板");
  });

  it("should render without rounding", () => {
    document.body.innerHTML = renderRepoCard(data_repo.repository, {
      border_radius: "0",
    });
    expect(document.querySelector("rect")).toHaveAttribute("rx", "0");
    document.body.innerHTML = renderRepoCard(data_repo.repository, {});
    expect(document.querySelector("rect")).toHaveAttribute("rx", "4.5");
  });

  it("should fallback to default description", () => {
    document.body.innerHTML = renderRepoCard({
      ...data_repo.repository,
      description: undefined,
      isArchived: true,
    });
    expect(document.getElementsByClassName("description")[0]).toHaveTextContent(
      "No description provided",
    );
  });

  it("should have correct height with specified `description_lines_count` parameter", () => {
    // Testing short description
    document.body.innerHTML = renderRepoCard(data_repo.repository, {
      description_lines_count: 1,
    });
    expect(document.querySelector("svg")).toHaveAttribute("height", "120");
    document.body.innerHTML = renderRepoCard(data_repo.repository, {
      description_lines_count: 3,
    });
    expect(document.querySelector("svg")).toHaveAttribute("height", "150");

    // Testing long description
    const longDescription =
      "A tool that will make a lot of iPhone/iPad developers' life easier. It shares your app over-the-air in a WiFi network. Bonjour is used and no configuration is needed.";
    document.body.innerHTML = renderRepoCard(
      { ...data_repo.repository, description: longDescription },
      {
        description_lines_count: 3,
      },
    );
    expect(document.querySelector("svg")).toHaveAttribute("height", "150");
    document.body.innerHTML = renderRepoCard(
      { ...data_repo.repository, description: longDescription },
      {
        description_lines_count: 1,
      },
    );
    expect(document.querySelector("svg")).toHaveAttribute("height", "120");
  });
});
