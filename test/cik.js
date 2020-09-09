const axios = require('axios');


let cik = {
    get_cik: (data) => {
        // Make a request for cik page
        axios.get('https://www.izbori.ba/Default.aspx?CategoryID=509&Lang=3')
            .then(function(response) {
                // handle success
                console.log(response);
            })
            .catch(function(error) {
                // handle error
                console.log(error);
            })
            .then(function() {
                // always executed
            });
    }
}



module.exports = cik;