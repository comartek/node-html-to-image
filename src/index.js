const { Cluster } = require("puppeteer-cluster");

const { makeScreenshot } = require("./screenshot.js");

module.exports = async function (options) {
  const {
    html,
    content,
    output,
    selector = "body",
    puppeteerArgs = {},
    puppeteerCluster,
  } = options;

  if (!html) {
    throw Error("You must provide an html property.");
  }

  const cluster = puppeteerCluster
    ? puppeteerCluster
    : await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 2,
        puppeteerOptions: { ...puppeteerArgs, headless: false },
      });


  if (!cluster.ready) {
    cluster.task(async ({ page, data: { content, output, selector } }) => {
      const buffer = await makeScreenshot(page, {
        ...options,
        content,
        output,
        selector,
      });
      return buffer;
    })
    cluster.ready = true;
  }
  
  const ctx = { ...content, output, selector };
  const { output: _output, selector: contentSelector, ...pageContent } = ctx;

  return cluster.execute({
    output: _output,
    content: {
      ...pageContent,
    },
    selector: contentSelector ? contentSelector : selector,
  });
}
