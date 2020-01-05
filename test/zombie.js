const Browser = require('zombie');
browser = new Browser()

let zombie = {

    get_cik: function (data) {
        let person = data;
        browser.visit("https://www.izbori.ba/Default.aspx?CategoryID=509&Lang=3", () => {
            console.log(browser.text("title"));

            let first_name = person.first_name;
            let last_name = person.last_name;
            let jmbg = person.jmbg;

            browser.fill("#Prezime", first_name);
            browser.fill("#Ime", last_name);
            browser.fill("#JMBG", jmbg);

            browser.pressButton("#ctl04_cmdProvjeri", () => {
                console.log("Form submit ok");

                let label1 = browser.document.getElementsByClassName("Label1");
                let label2 = browser.document.getElementsByClassName("Label2");

                if (label1.length == label2.length) {
                    // Access response data
                    person.voting_location = result[4];
                    person.voting_location_address = result[5];
                    person.voting_location.name = result[6]
                    person.voting_location.municipality = result[7];
                }
            })
        }).done();
        return person;
    }

}



module.exports = zombie;