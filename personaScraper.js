const rp = require('request-promise');
const cheerio = require('cheerio');
const urls = require('./urls')
const mythContainer = [];

const scrapeFetcher = (url) => 
  rp(url)
  .then(function(html) {
    const $ = cheerio.load(html);

    let name;
    let contents = '';
    let currentElement;
    let startScraping = false;
    let endScraping = false;

    const headerTopics  = $('#firstHeading, h2, h2 ~ p');
    headerTopics.each(function(i, elem) {
      currentElement = $(this);
      
      endScraping = currentElement.text().valueOf() === new String("Appearances").valueOf();

      if (currentElement[0].tagName === "h1") {
        name = currentElement.text().trim();
      }
      else if (currentElement[0].tagName === "h2" && currentElement.has("#History").length > 0) {
        startScraping = true;
      }
      else if (endScraping) {
        // exit when found <h2>Appearances</h2>
        return false;
      }
      else if (startScraping) {
        // append the scraped contents
        if (contents === '') {
          contents = currentElement.text();
        } else {
          contents += '\n' + currentElement.text();
        }
      }  
    });

    // remove citations such as [2][3] 
    contents = contents.replace(/ *\[[^)]*\] */g, "");
    
    const demon = {
      name: name,
      history: contents,
      origins: []
    }
    return demon;

  });

const scrapeFetchers = [];
urls.forEach((url) => {
  scrapeFetchers.push(scrapeFetcher(url));
});

Promise.all(scrapeFetchers)
  .then((contents) => {
    mythContainer.push(...contents);
    return mythContainer;
  })
  .then((result) => {
    // output final result
    console.log(JSON.stringify(result, null, 2));
  });