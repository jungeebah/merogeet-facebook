const express = require('express');
const app = express();
const url = require('url');
const puppeteer = require('puppeteer');
var validUrl = require('valid-url');
const port = process.env.PORT || 8080;


var clean_url = function(url){
    myURL = new URL(url)
    var pos1 = myURL.pathname.indexOf("\/"); 
    var pos2 = myURL.pathname.indexOf('\/',pos1+1);
    url = myURL.origin+myURL.pathname.slice(0,pos2);
    url = url.replace(/\/+$/, "");
    return url;
}
var match_regex = function(url){
    regex = /^(http)?s?(:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/;
    return regex.test(url);
}
var sanitize_url = function(url){
    if (match_regex(url)){
        for (const t of url){
            if (t == '.'){
                r = url.indexOf(t);
            }
        }
        var left_Value = url.substr(r);
        if (left_Value == '.com' || left_Value == '.com/'){
            return url;
        }else {
            return ;
        }
    }else{
        return;
    }
  };
  
function facebook_search(facebook_url){
    var jsonData = {};
    return new Promise(async (resolve, reject) => {
        try{
            var cleaned_url = clean_url(facebook_url);
            var url = cleaned_url + '/about/'
                const browser = await puppeteer.launch({
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });
                const page = await browser.newPage();
                page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36')

                await page.goto(url);
                await page.waitForSelector(".img");

                try{
                    const infos = await page.$$('div[class="_5aj7 _3-8j"]');
                    for (const info of infos){
                        const photo_link = await info.$eval('img', img => img.src);
                        const inner_text = await page.evaluate(info => info.innerText,info); 
                        
                        var web_url=null;
                        if (sanitize_url(inner_text)){
                             web_url = sanitize_url(inner_text);
                        }
                        if (photo_link.indexOf('EaDvTjOwxIV') >0 || web_url){
                            jsonData["website"] = inner_text;
                        }
                        else if(photo_link.indexOf('8TRfTVHth97') > 0 || inner_text.indexOf('instagram')>0){
                            jsonData["instagram"] = inner_text;
                        }
                        else if (photo_link.indexOf('WPSrBl8J06p') >0|| inner_text.indexOf('twitter')>0){
                            jsonData["twitter"]=inner_text;
                        }
                        else if (photo_link.indexOf('RTHgMeQuiIN') >0 || photo_link.indexOf('7xu6qkZsbtP') >0 || inner_text.indexOf('youtube')>0){
                            if (match_regex(inner_text)){
                                jsonData["youtube"]=inner_text;
                            }else{
                                continue;
                            }
                        }
                        else if (photo_link.indexOf('PPpFwUhDmz') >0|| inner_text.indexOf('soundlcoud')>0){
                            jsonData["soundcloud]"]= inner_text;
                        }
                    }
                    await browser.close();
                    return resolve(jsonData);
                }
                catch(e){
                    return reject(e)
                }
            }
            catch(e){
                return reject(e)
            }
    })
}

app.get('/', function(req, res) {
    (async() =>{
        facebook_search(req.query.url).then(function(result){
            res.setHeader('Content-Type', 'text/html');
            res.send(result);
        }).catch(console.error);
        })();
});

app.listen(port, function() {
    console.log('App listening on port ' + port)
})
