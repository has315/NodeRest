const Browser = require('zombie');
// We're going to make requests to http://example.com/signup
// Which will be routed to our test server localhost:3000
// Browser.localhost('', 3000);

browser = new Browser()
browser.visit("https://www.izbori.ba/Default.aspx?CategoryID=509&Lang=3", () => {
  console.log(browser.text("title"));

  let first_name = "";
  let last_name = "";
  let id = ""

  browser.fill("#Prezime", first_name);
  browser.fill("#Ime", last_name);
  browser.fill("#JMBG", id);

  browser.pressButton("#ctl04_cmdProvjeri", () => {
    console.log("Form submit ok");
    console.log()

    let label1 = browser.document.getElementsByClassName("Label1");
    let label2 = browser.document.getElementsByClassName("Label2");

    if (label1.length == label2.length) {
      // Access response data
      let result = {};
      for (let i = 0; i < label1.length; ++i)
        result[label1[i].innerHTML] = label2[i].innerHTML;

      // Print result
      for (var key in result)
        if (result.hasOwnProperty(key))
          console.log(`${key}${result[key]}`);
    }
  })
})
