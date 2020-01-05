const Browser = require('zombie');
browser = new Browser()


function get_cik(person) {
    browser.visit("https://www.izbori.ba/Default.aspx?CategoryID=509&Lang=3", () => {
        console.log(browser.text("title"));

        let first_name = person.first_name;
        let last_name = person.last_name;
        let id = person.id;

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
}

person = {
    "first_name": "Dragan",
    "last_name": "Zrilic",
    "id": "1508996100097"
};

get_cik(person);