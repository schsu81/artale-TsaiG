function getMonth(d){
  return d.getMonth()+1
}

function getDay(d){
  return (""+d.getDate()).padStart(2, '0')
}


function getTimeRange(boolTimes){
  var times = [];
  if (boolTimes[0]) {times.push(dtimes[0]);}
  for (var i=1;i<dtimes.length;i++) {
    if ((boolTimes[i-1]+boolTimes[i])==1) {
      if (boolTimes[i-1]) {
        times.push(dtimes[i-1]);
      }else{
        times.push(dtimes[i]);
      }
    }
  }
  if (boolTimes[boolTimes.length-1]) {times.push(dtimes[boolTimes.length-1])}

  var cTimes = [];
  for (var i=0;i<times.length;i+=2){
    cTimes.push(times[i]+"~"+times[i+1]);
  }
  return cTimes
}

function list_remove(olist,item){
  var new_list = [];
  for (var i=0;i<olist.length;i++){
    if (olist[i]==item) {continue;}
    new_list.push(item);
  }  
  return new_list;
}