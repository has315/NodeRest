const Browser = require('zombie');
var connection = require('../db');

browser = new Browser()


let zombie = {

    get_cik: (data) => {
        browser.visit("https://www.izbori.ba/Default.aspx?CategoryID=509&Lang=3").then(() => {
            console.log(browser.text("title"));


            let first_name = data.first_name;
            let last_name = data.last_name;
            let jmbg = data.jmbg;

            browser.fill("#Prezime", first_name);
            browser.fill("#Ime", last_name);
            browser.fill("#JMBG", jmbg);


            browser.pressButton("#ctl04_cmdProvjeri", async () => {
                console.log("Form submit ok");

                let label1 = browser.document.getElementsByClassName("Label1");
                let label2 = browser.document.getElementsByClassName("Label2");

                // Access response data
                let result = {};
                for (let i = 0; i < label1.length; ++i)
                    result[label1[i].innerHTML] = label2[i].innerHTML;

                if (label1.length == label2.length) {
                    // Access response data
                    data.voting_location = result.voting_location;
                    data.voting_location_address = result.voting_location_address;
                    data.voting_location_name = result.voting_location_name;
                    data.voting_location_municipality = result.voting_location_municipality;
                }
                console.log(result);
                console.log(result[0]);
                console.log(result['Ime :']);
                let sql = `UPDATE vote SET voting_location = '${data.voting_location}', voting_location_address = '${data.voting_location_address}', voting_location_name = '${data.voting_location_name}', voting_location_municipality = '${data.voting_location_municipality}' WHERE jmbg = '${data.jmbg}'`;
                connection.query(sql, data, (err, results) => {
                    if (err) throw err;
                })
            })
        });
        return data;
    }

}



module.exports = zombie;