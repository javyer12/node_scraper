// dataImpulse para contratar proxies
const puppeteer = require("puppeteer");
const xlsx = require('xlsx');


(async () => {
  const URL = "https://espndeportes.espn.com/futbol/equipos";
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(URL); //{waitUntil:'networkidle2'})//{waitUntil:'networkidle2'} esta expresion le dice que espere unos segundos mientras la pagina carga.

  const title = await page.title();
  console.log(title);

  let products = [];
  let nextPage = true;
  while (nextPage) {
    const newProducts = await page.evaluate(() => {
      const products = Array.from(
        document.querySelectorAll(".ContentList__Item")
      );

      return products.map((product) => {
        const Team = product.querySelector("h2.di").innerText;
        const schedule = document.querySelector('.TeamLinks__Links .AnchorLink').href

        return {
          'Team':Team,
          'Schedule':schedule
        };
      });
    });
    
    products = [...products, ...newProducts];
    console.log(products)

    nextPage = await page.evaluate(() => {
      const nextButton = document.querySelector(".s-pagination-next");

      if (nextButton) {
        nextButton.click();
        return true;
      }
      return false;
    });
  }

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(products);
  const path = 'teams.xlsx';

  xlsx.utils.book_append_sheet(wb,ws,"Teams");
  xlsx.writeFile(wb, path);

  await browser.close();
})();
