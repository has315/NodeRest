const Browser = require('zombie');
var connection = require('../db');

browser = new Browser()


let zombie = {

    get_cik: (person) => {
        browser.visit("https://www.izbori.ba/Default.aspx?CategoryID=509&Lang=3").then(() => {
            console.log(browser.text("title"));

            let first_name = person.first_name;
            let last_name = person.last_name;
            let jmbg = person.jmbg;

            browser.fill("#Prezime", first_name);
            browser.fill("#Ime", last_name);
            browser.fill("#JMBG", jmbg);

            browser.document.forms[0].submit();

            browser.wait(() => {
                console.log("Form submit ok");

                let label1 = browser.document.getElementsByClassName("Label1");
                let label2 = browser.document.getElementsByClassName("Label2");

                // Access response data
                let result = {};
                for (let i = 0; i < label1.length; ++i)
                    result[label1[i].innerHTML] = label2[i].innerHTML;

                if (label1.length == label2.length) {
                    // Access response data
                    person.voting_location = result[4];
                    person.voting_location_address = result[5];
                    person.voting_location_name = result[6]
                    person.voting_location_municipality = result[7];
                }
                let sql = `UPDATE vote SET ? WHERE jmbg == ${person.jmbg}`;
                connection.query(sql, data, (err, results) => {
                    if (err) throw err;
                    res.send(JSON.stringify({
                        "status": 200,
                        "error": null,
                        "response": results
                    }));
                })
            })
        });
        return person;
    }

}



module.exports = zombie;