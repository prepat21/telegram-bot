// 
// FILL IN THE GLOBAL VARIABLES token, webAppUrl and ssId
//

var token = "1108357098:AAFL0u3LtorvTp4O7dZkVMwdJryWQeVe6ng"; // FILL IN YOUR OWN TOKEN
var telegramUrl = "https://api.telegram.org/bot" + token;
var webAppUrl = "https://script.google.com/macros/s/AKfycbwykXQu8syx_H7H0UkbsY2ZSTEa9A_LgAvn-VUicw/exec";
var ssId = "1_uTuz-vw_fokEY0nPosU25WqAjyacVmapFL8UPr9bdc";
var ss = SpreadsheetApp.openById(ssId);
var superUsers = [-415334486]; 

// copied from http://ocordova.me/blog/telegram-bot-with-apps-script
function doPost(e) {
  var update = JSON.parse(e.postData.contents);

  // Make sure this is update is a type message
  if (update.hasOwnProperty('message')) {
    var msg = update.message;
    var chatId = msg.chat.id;
    var text = msg.text;
    var userId = msg.from.id;
    var fromName = msg.from.first_name + " " + msg.from.last_name;
    var toName = msg.chat.title;

    // Make sure the update is a command.
    if (msg.hasOwnProperty('entities') && msg.entities[0].type == 'bot_command') {

      // log the message
      ss.getSheetByName('Requests').appendRow([new Date(),fromName,userId,toName,chatId,text]);
      
      // check chatId for validation of group/user 0=chatid, 1 = region filter
      var accessInfo = ss.getSheetByName('Allowed_ChatId').getRange('B2:C').getValues();
      accessInfo = transpose(accessInfo); // transpose the data
      var idxInfo = accessInfo[0].indexOf(chatId); // gets index in access list if it exists, otherwise 0
      
      // check to see if chatid is in access list (exit otherwise)
      if (idxInfo == -1) return; // Exit as person is not on access list      
      
      // If the user sends the /quote command
      if (text == '/quote') {
        var url = 'http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1';
        var data = UrlFetchApp.fetch(url);
        var posts = JSON.parse(data);
        var post = posts.shift();
        
        // Delete the html tags and \n (newline)
        var cleanContent = post.content.replace(/<(?:.|\n)*?>/gm, "").replace(/\n/gm, "");
        
        // Format the quote
        var quote = '"' + cleanContent + '"\n — <strong>' + post.title + '</strong> ';

        var payload = {
          'method': 'sendMessage',
          'chat_id': String(chatId),
          'text': quote,
          'parse_mode': 'HTML'
        }

        var data = {
          "method": "post",
          "payload": payload
        }

        // Replace with your token
        UrlFetchApp.fetch(telegramUrl + '/', data);
        var test = 1;
      // ---------------------------------------------
      // # /image
      } else if (text == '/image') {
        // image url
        var gIDimage = '1hNh-lBPi4NYYS13-dXPDW-7K0Hn_RmlG';
//        var gIDimage = '1_dQLmGj0b5gA-Q6kvvxnFUBL_ulaMf-g';
        var url = 'https://drive.google.com/uc?id='+gIDimage;
//        var url = 'https://doc-0c-7s-docs.googleusercontent.com/docs/securesc/2drj1fahrbpgtp4dhndcin154g1ahd4q/aorm48n6sk2f5799kmsmuudlllt5aah4/1522101600000/02570572418403121426/00366022165056014721/0B9o1MNFt5ld1N3k1cm9tVnZxQjg?nonce=159v1vdnhoje2&user=00366022165056014721&hash=jr5g8asj1po4i3m4hmu6amhvdurtuc1r';
//        var url = 'https://www.gettyimages.ca/gi-resources/images/Homepage/Hero/UK/CMS_Creative_164657191_Kingfisher.jpg';
        var payload = {
          'method': 'sendPhoto',
          'chat_id': String(chatId),
          'photo': url,
        }
        var data = {
          "method": "post",
          "payload": payload
        }
        // Replace with your token
        UrlFetchApp.fetch(telegramUrl + '/', data);
      // ---------------------------------------------           
      } else if (text.indexOf("/send ") == 0) {
        
        var subText = text.split("/send ")[1] // everything after key.  First entry is blank ;
        // check if superuser and update
        for(var i = 0; i<superUsers.length; i++){
          if (userId==superUsers[i]) {
            for(var j=1; j<accessInfo[0].length; j++){
              // Send a message back to confirm logging of issue
              var payload = {
                'method': 'sendMessage',
                'chat_id': String(accessInfo[0][j]),
                'text': subText,
              }
              var data = {
                "method": "post",
                "payload": payload
              }
              // POST
              UrlFetchApp.fetch(telegramUrl + '/', data);
            } // end for loop
            
            break; // break to send only once
          } // end if superuser
        } // end for loop        
      // ---------------------------------------------           
      } else if (text.indexOf("/fix ") == 0) {
        
        var subText = text.split("/fix ")[1] // everything after key.  First entry is blank ;
        // Link subText to reporting task spreadsheet
        SpreadsheetApp.openById('1SIXgrqvOhnRScm0td0_DeTYuGIduCkQ-PdPAUWcxpfw')
            .getSheetByName('Burndown_list').appendRow([subText + ' -  from ' + fromName + ' in ' + toName]);
        
        // Send a message back to confirm logging of issue
        var payload = {
          'method': 'sendMessage',
          'chat_id': String(chatId),
          'text': 'Fix request logged.  Thanks.',
        }
        var data = {
          "method": "post",
          "payload": payload
        }
        // POST
        UrlFetchApp.fetch(telegramUrl + '/', data);
        
      // ---------------------------------------------           
      } else if (text.indexOf("/update ") == 0) {
        
        // check if superuser and update
        for(var i = 0; i<superUsers.length; i++){
          if (userId==superUsers[i]) {
            getRegionAggregate(); // should update na script
            var text = "Reporting status is now updated"
            break;
          } 
        }
        if (i==superUsers.length) { // userid is not in super group
          var text = "Sorry "+msg.from.first_name+"bhai, you are not allowed to use this feature";
        } // end if statement
        
        // Send a message back to confirm logging of issue
        var payload = {
          'method': 'sendMessage',
          'chat_id': String(chatId),
          'text': text,
        }
        var data = {
          "method": "post",
          "payload": payload
        }
        // POST
        UrlFetchApp.fetch(telegramUrl + '/', data);
        
      // ---------------------------------------------           
      }else if (text.indexOf("/status") == 0) {
        
        // reporting status sheet
        if (text.indexOf("2018") > -1) {
            var rss = SpreadsheetApp.openById('1sg8m4lK-3SWEVzc3oMyqlGuvRQRLxLFsT25WFnA8wAo'); // 2018 NA
        }else {
            var rss = SpreadsheetApp.openById('1H6OnHeQ2a6zKeqG2uG0gXL0ciSUnw0lQVrim5Zk5f_U'); // 2019 NA
        }
        var monStat = rss.getSheetByName('Monthly Status Bot');
        var timeUpdated = rss.getSheetByName('time_updated').getRange('A2').getValue();
        
        // defaults region and filter
        var subText = text.split("/status")[1].toLowerCase(); // everything after key.  First entry is blank ;
        var monthFilt = monStat.getRange("C4").getValue();
        var filtList = accessInfo[1][idxInfo].toLowerCase();
//        if(typeof regionFilt == "undefined"){
//          regionFilt = "";
//        } 
        var Months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
        // Check for month in string
        for(var imth = 0, size = Months.length; imth < size ; imth++){
          if (subText.indexOf(Months[imth]) > -1) {
            monthFilt = Months[imth];
            break;
          }
        }
        // region list
        var Regions = ['canada','midwest','northeast','southeast','southwest','west'];
        // Check for region for those with multiple options
        var regionFilt = "";
        for(var imth = 0, size = Months.length; imth < size ; imth++){
          if (filtList.toLowerCase().indexOf(Regions[imth]) > -1) {
            regionFilt = Regions[imth];
            break;
          }
        } // end for loop
        // Check for region for those with multiple options
        if (regionFilt==""){
          for(var imth = 0, size = Months.length; imth < size ; imth++){
            if (subText.indexOf(Regions[imth]) > -1) {
              regionFilt = Regions[imth];
              break;
            }
          } // end for loop
        } // end if
        // set spreadsheet region and month filters
        monStat.getRange("B7").setValue(monthFilt);
        monStat.getRange("A4").setValue(regionFilt);
        var nr  = monStat.getRange("B5").getValue();
        var nc  = monStat.getRange("C5").getValue();
        var TAB = monStat.getRange(9,1,nr,nc).getValues();
        // check to see if center is in list
        for(var i = 0; i<TAB.length; i++){
          if (filtList.indexOf(TAB[i][1].toLowerCase()) > -1) {
            TAB = [TAB[i]];
            break;
          }
        } // end for loop
        // Loop through and check for center filter
        for(var i = 0; i<TAB.length; i++){
          if (subText.indexOf(TAB[i][1].toLowerCase()) > -1) {
            TAB = [TAB[i]];
            break;
          }
        } // end for loop
        
        
        // formatted string check to make sure weeeks is accounted for
        var sendStr = Utilities.formatString('%-10s|%1s|%1s|%1s', "Center","T","S","G");
        for(var i = 0; i<nc-5; i++){ 
          sendStr = sendStr + Utilities.formatString('|%1d',i+1);
        }// end loop
        sendStr+='\n';
        // loop through mandals and add to string
        for(var i = 0; i<TAB.length; i++){ 
          if (TAB[i][1].length > 10) TAB[i][1]=TAB[i][1].substring(0,10);
          var ithStr = Utilities.formatString("%-10s",TAB[i][1]);
          for(var j = 2; j<TAB[i].length; j++){ 
            ithStr = ithStr+Utilities.formatString("|%1s",TAB[i][j])
          } // end inner loop
          sendStr = sendStr+ithStr+"\n";
        } // end outer loop
        // Format the quote
        var text = '<strong>' + monthFilt + ' reporting status</strong>\nLast updated: '+timeUpdated+'\n<pre>'+sendStr+'</pre>';
        //var quote = '<pre>Houston</pre>'
        var payload = {
          'method': 'sendMessage',
          'chat_id': String(chatId),
          'text': text,
          'parse_mode': 'HTML'
        }
        // post
        var data = {
          "method": "post",
          "payload": payload
        }
        // Replace with your token
        UrlFetchApp.fetch(telegramUrl + '/', data);
// // -------------------------------------------------------------------------------------------------------------- IMAGE STATUS        
//        // reporting status sheet
//        var monStat = SpreadsheetApp.openById('1sg8m4lK-3SWEVzc3oMyqlGuvRQRLxLFsT25WFnA8wAo').getSheetByName('Monthly Status Bot');
//        
//        // defaults region and filter
//        var subText = text.split("/status ")[1].toLowerCase(); // everything after key.  First entry is blank ;
//        var monthFilt = monStat.getRange("C4").getValue();
//        var regionFilt = accessInfo[1][idxInfo];
//        if(typeof regionFilt == "undefined"){
//          regionFilt = "";
//        } 
//        var Months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
//        // Check for month in string
//        for(var imth = 0, size = Months.length; imth < size ; imth++){
//          if (subText.indexOf(Months[imth]) > -1) {
//            monthFilt = Months[imth];
//            break;
//          }
//        }
//        // region list
//        var Regions = ['canada','midwest','northeast','southeast','southwest','west'];
//        // Check for region for those with multiple
//        if (regionFilt == "") {
//          for(var imth = 0, size = Months.length; imth < size ; imth++){
//            if (subText.indexOf(Regions[imth]) > -1) {
//              regionFilt = Regions[imth];
//              break;
//            }
//          } // end for loop
//        } // end if statement
//        
//        // set spreadsheet values save image and get url
//        monStat.getRange("B7").setValue(monthFilt);
//        monStat.getRange("A4").setValue(regionFilt);
//        // get url
//        var cht = monStat.getCharts()[0].getAs('image/png').setName("telebotImages");
//        var fileId = DriveApp.createFile(cht).getId();
//        var url = 'https://drive.google.com/uc?id='+fileId;
//        // post
//        var payload = {
//          'method': 'sendPhoto',
//          'chat_id': String(chatId),
//          'photo': url,
//        }
//        var data = {
//          "method": "post",
//          "payload": payload
//        }
//        // Replace with your token
//        UrlFetchApp.fetch(telegramUrl + '/', data);
        
        
      }

      
      
      
    } // end if its a bot command
  } // end if property is message
} // end function

function doGet(e){
  return HtmlService.createHtmlOutput("hi this is my first project");
}

function dePost(e){
  GmailApp.sendEmail(Session.getEffectiveUser().getEmail(), "message from bot", JSON.stringify(e, null, 4));
}

function setWebhook() {
  var url = telegramUrl+"/setWebhook?url="+webAppUrl;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());

}

function transpose(a)
{
  return Object.keys(a[0]).map(function (c) { return a.map(function (r) { return r[c]; }); });
}
