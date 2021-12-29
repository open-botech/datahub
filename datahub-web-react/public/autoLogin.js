const requestOptions = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'datahub', password: 'datahub' }),
};
fetch('/logIn', requestOptions).then(()=>{

})