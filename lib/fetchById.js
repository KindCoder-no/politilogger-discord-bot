const axios = require('axios');


async function fetchById(id){

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://politiloggen-vis-frontend.bks-prod.politiet.no/api/messagethread/getbyid?id=' + id,
  headers: { }
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

module.exports = fetchById;