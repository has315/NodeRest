const puppeteer = require('puppeteer');
const dbc = require('../anti-captcha/deathbycaptcha.js');
const connection = require('../db/mysql.js');

const username = 'has315'; // DBC account username
const password = 'Fnligvu5abca@'; // DBC account password

const token_params = JSON.stringify({
    'proxytype': 'HTTP',
    'googlekey': '6LeMdMkZAAAAANOAJps6_fS-qUkH4xa9GF2goczL',
    "min_score": 0.3,
    'pageurl': 'https://www.izbori.ba/Default.aspx?CategoryID=509&Lang=3'
});



const chromeOptions = {
    defaultViewport: null,
    slowMo: 10,
    headless: true,
    args: ['--no-sandbox']
};

let cik = {
    get_cik: async(data) => {
        const browser = await puppeteer.launch(chromeOptions);
        const page = await browser.newPage();
        const first_name = data.first_name;
        const last_name = data.last_name;
        const jmbg = data.jmbg;

        await page.goto('https://www.izbori.ba/Default.aspx?CategoryID=509&Lang=3')
        await page.type('#Prezime', first_name);
        await page.type('#Ime', last_name);
        await page.type('#JMBG', jmbg);

        // Death By Captcha Socket Client
        const client = new dbc.HttpClient(username, password);

        // Get user balance
        client.get_balance((balance) => {
            console.log('BALANCE IS: ', balance);
        });

        // Solve captcha with type 4 & token_params extra arguments
        client.decode({ extra: { type: 4, token_params: token_params } }, async(captcha) => {
            if (captcha) {
                console.log('Captcha ' + captcha['captcha'] + ' solved: ' + captcha['text']);
                await page.type('#g-recaptcha-response', captcha['text']);
                const js = `document.getElementById("g-recaptcha-response").innerHTML="${captcha['text']}";`;
                page.evaluate(js);
                await page.click('#ctl04_cmdProvjeri');
                // let results = {};
                const result = await page.$eval('.Result', e => e.innerHTML);

                const label1Regex = /<td class="Label1">(.*)<\/td><\/tr>/g;
                const label2Regex = /<td class="Label2">(.*)<\/td><\/tr>/g;
                const tagContentRegex = />(.*?)</;
                const keys = result.match(label1Regex).map(el => el.match(tagContentRegex)[1].trim().split(" ")[0].toLowerCase());
                const values = result.match(label2Regex).map(el => el.match(tagContentRegex)[1].trim());
                const object = {};
                for (let i = 0; i < keys.length; i++) {
                    object[keys[i]] = values[i];
                }
                data.voting_location = object["biračko"];
                data.voting_location_address = object["adresa"];
                data.voting_location_name = object["naziv"];
                data.voting_location_municipality = object["opština"];

                let sql = `UPDATE vote SET voting_location = '${data.voting_location}', voting_location_address = '${data.voting_location_address}', voting_location_name = '${data.voting_location_name}', voting_location_municipality = '${data.voting_location_municipality}' WHERE vote_id = '${data.vote_id}'`;
                connection.query(sql, data, (err, results) => {
                    if (err) throw err;
                    console.log(results);

                });
            }
        }).catch(err => console.error(err));
    }
}
module.exports = cik