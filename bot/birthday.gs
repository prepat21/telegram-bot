function myBDays() {
  
  var dbID = "1_uTuz-vw_fokEY0nPosU25WqAjyacVmapFL8UPr9bdc"; // NA db id
  var dbSheetName = "HOU Birthdays" // db Sheet name
  
  var rangeFirst = "B2:B";
  var rangeMid = "G2:G";
  var rangeLast = "C2:C";
  var rangeDOB = "A2:A";
  var rangePhoneNumber = "F2:F";
  var rangeCenter = "E2:E";
  var rangeRegion = "D2:D";
  
  //var toEmail = "shivang07@gmail.com";
  var chatID = -323090958;
  var accessInfo = [ [chatID], ["Southwest"] ];
  
  
  //---------------------------------------------------------------------
  //var accessInfo = ss.getSheetByName('HOU Birthdays').getRange('B2:F').getValues();
  //accessInfo = transpose(accessInfo); // transpose the data 
  //var idxInfo = accessInfo[0].indexOf(chatId); // gets index in access list if it exists, otherwise 0

  
  
  
  var dbSheet = SpreadsheetApp.openById(dbID).getSheetByName(dbSheetName); // NA db id
  
  // Get values
  var valFirst = dbSheet.getRange(rangeFirst).getValues();
  var valMid = dbSheet.getRange(rangeMid).getValues();
  var valLast = dbSheet.getRange(rangeLast).getValues();
  var valDOB = dbSheet.getRange(rangeDOB).getValues();
  var valPhoneNumber = dbSheet.getRange(rangePhoneNumber).getValues();
  var valCenter = dbSheet.getRange(rangeCenter).getValues();
  var valRegion = dbSheet.getRange(rangeRegion).getValues();
  
  // todays date
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth(); //January is 0!
  
  //--------------------------------------------------------------------
  // ENTER LOOP
  for(var i=0; i<valDOB.length; i++){ 
    
    // add hours to date
    if (is_date(valDOB[i][0])){
      valDOB[i][0].setHours(valDOB[i][0].getHours() + 4); // need to add hours because its in EST.
    }
    // check against current day
    if (is_date(valDOB[i][0]) && dd==valDOB[i][0].getDate() && mm==valDOB[i][0].getMonth()){
      
      for(var idxInfo=0; idxInfo<accessInfo[1].length; idxInfo++){
//      for(var idxInfo=2; idxInfo<3; idxInfo++){
        if (valCenter[i][0]==accessInfo[1][idxInfo] || valRegion[i][0]==accessInfo[1][idxInfo]){
          
          var name = valFirst[i][0] + " " + valLast[i][0]
          //var bdayStr = "Today is "+ name + "'s birthday";+
          var body = "<strong>Birthday Reminder</strong>: " + "\nName: " + name + "\nPhone: " + valPhoneNumber[i][0] + "\nFather: " + valMid[i][0]; 
          
          //        Logger.log(name+body+accessInfo[0][idxInfo]);
          
          
          // Send a message back to confirm logging of issue
          var payload = {
            'method': 'sendMessage',
            'chat_id': String(accessInfo[0][idxInfo]),
            'text': body,
            'parse_mode': 'HTML',
          }
          var data = {
            "method": "post",
            "payload": payload
          }
          // POST
          UrlFetchApp.fetch(telegramUrl + '/', data);          
          
        } // end if around ids
      } // end for loop
              
    }

      
//      MailApp.sendEmail(toEmail,
//                        bdayStr,
//                        body);
    
  }
  var tmp=1;
}





var is_date = function(input) {
  if ( Object.prototype.toString.call(input) === "[object Date]" ) 
    return true;
  return false;   
};
