const axios = require('axios');


function fetchLatestUpdate(police_department, categories){
    let data;

    switch(police_department){
        case 'all':
            data = JSON.stringify({
                "category": categories,
                "skip": 0,
                "sortByEnum": "LastMessageOn",
                "take": 10
              });
            break;
        default:
            data = JSON.stringify({
                "district": police_department,
                "category": categories,
                "skip": 0,
                "sortByEnum": "LastMessageOn",
                "take": 10
              });
            break;
    }
      
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://politiloggen-vis-frontend.bks-prod.politiet.no/api/messagethread',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };
      
      return axios.request(config)
      .then((response) => {
        //console.log(JSON.stringify(response.data));
        return response.data;
      })
      .catch((error) => {
        console.log(error);
      });
      
}

module.exports = fetchLatestUpdate;