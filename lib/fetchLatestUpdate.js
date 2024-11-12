const axios = require('axios');


async function fetchLatestUpdate(police_department, categories) {
  let data;

  switch (police_department) {
    case 'all':
      data = JSON.stringify({
        "category": categories,
        "skip": 0,
        "sortByEnum": "LastMessageOn",
        "take": 1
      });
      break;
    default:
      data = JSON.stringify({
        "district": police_department,
        "category": categories,
        "skip": 0,
        "sortByEnum": "LastMessageOn",
        "take": 1
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
    data: data
  };

  return axios.request(config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });

}

module.exports = fetchLatestUpdate;