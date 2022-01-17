const puppeteer = require("puppeteer");
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
        puppeteerOptions: { ...puppeteerArgs, headless: true },
      });

  let buffers = [];

  await cluster.task(async ({ page, data: { content, output, selector } }) => {
    const buffer = await makeScreenshot(page, {
      ...options,
      content,
      output,
      selector,
    });
    buffers.push(buffer);
  });

  const shouldBatch = Array.isArray(content);
  const contents = shouldBatch ? content : [{ ...content, output, selector }];

  contents.forEach((content) => {
    const { output, selector: contentSelector, ...pageContent } = content;
    cluster.queue({
      output,
      content: pageContent,
      selector: contentSelector ? contentSelector : selector,
    });
  });

  return shouldBatch ? buffers : buffers[0];
};
