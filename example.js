const nodeHtmlToImage = require("./src/index.js");
const { Cluster } = require("puppeteer-cluster");

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 10,
    puppeteerOptions: {
      headless: true,
      args: ['--no-sandbox'],
    },
  });

  cluster.on("taskerror", (err, data, willRetry) => {
    console.log("task error", data);
  });

  for (let i = 0; i < 200; i++) {
    try {
      nodeHtmlToImage({
        html: "<html><body>Hello world 🙌!</body></html>",
        puppeteerCluster: cluster,
      })  
    } catch (error) {
      console.log('ERRRRRRRRRORRRRR', error)
    }
    
  }
})();
