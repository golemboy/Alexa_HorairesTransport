'use strict';

var flatten = (arr) => {
    return Array.prototype.concat(...arr);
}

module.exports.to_replies = function (arr) {
  return arr.map( (elem) =>  {return {'type': 'text', 'content':elem}}  );
}

module.exports.schedules_to_replies = function (arr) {
  return flatten(arr).map( (elem) =>  {    
    let value = elem.destination+':'+elem.message;
    return {'type': 'text', 'content':value}
  }  );
}


const dico = {'mn':'minute', 'termine':'terminé'}

var translate = (value) => {
  let res = undefined;
  res = value.toLowerCase().trim().split(' ').map( (s) => { 
    let val = undefined
    val = dico[s]
    if(val === undefined) val = s
    return val
  }  ).join(' ');
    
  if(res === undefined) res = value.toLowerCase().trim();
  return res;
}


module.exports.display = (output) => {
  let result = '<speak>'
  
  // output.forEach(element => {
    
  // });
  
  for(let i = 0; i<output.length;i++) {
    let element = output[i]
    if (element.message === "SERVICE TERMINE") {
      result += 'destination '+element.destination+' : service terminé.'
      break;
    }
    else {
      result += 'destination '+element.destination+' dans '+translate(element.message)+'<break time="1s"/>'
    }
  };
  result += '<speak/>'
  return result
}

module.exports.send_error = (error,memory) => {
      let response = {}
      response.replies = [{
        'type': 'text',
          'content': error.result.message,
      }]

      response.conversation = {
        'memory': memory
      }

      return response
}
