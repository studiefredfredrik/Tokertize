let renderTextAd = null
let renderGraphicAd = null
let baseUrl = null

module.exports = {
  renderAd: function (ad, res, site){
    if(ad.type === 'graphic') return renderGraphicAd(ad, res, site, baseUrl)
    return renderTextAd(ad, res, site, baseUrl)
  },
  register: async function (config) {
    baseUrl = config.baseUrl

    renderTextAd = function (ad, res, site) {
      let html = `
    <!DOCTYPE html>
<html>
<head>
<title>ad</title>
<style>
html{margin: 0; padding: 0;}
body{margin: 0; padding: 0;}
.ad-box-1{
  width: 398px;
  height: 148px;
  text-align: center;
  border: solid 1px black;
  cursor: pointer;
}
.ad-box-1 .head{
  color: blue;
  font-size: 32px;
}
.ad-box-1 .mid{
  font-size: 22px;
}
.ad-box-1 .low{
  margin: 10px;
  font-size: 12px;
}
</style>
</head>
<body>
<div onclick="go()" class="ad-box-1">
  <div class="head">${ad.line1}</div>
  <div class="mid">${ad.line2}</div>
  <div class="low">${ad.line3}</div>
</div>
</body>
<script>
  function go(){
    window.open('${baseUrl}/api/link/${site}/click/${ad._id}')
  }
</script>
</html>
    `
      res.send(html)
    }
    renderGraphicAd = function (ad, res, site) {
      let html = `
    <!DOCTYPE html>
<html>
<head>
<title>ad</title>
<style>
html{margin: 0; padding: 0;}
body{margin: 0; padding: 0;}
.ad-box-1{
  width: 398px;
  height: 148px;
  text-align: center;
  border: solid 1px black;
  cursor: pointer;
}
.ad-box-1 .head{
  color: blue;
  font-size: 32px;
}
.ad-box-1 .mid{
  font-size: 22px;
}
.ad-box-1 .low{
  margin: 10px;
  font-size: 12px;
}
</style>
</head>
<body>
<div onclick="go()" class="ad-box-1">
  <img src="${ad.imgDataUrl}" alt="ad"/>
</div>
</body>
<script>
  function go(){
    window.open('${baseUrl}/api/link/${site}/click/${ad._id}')
  }
</script>
</html>
    `
      res.send(html)
    }
  }
}