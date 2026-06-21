const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args:['--ignore-certificate-errors'] });
  // OG image 1200x630
  const p1 = await b.newPage({ viewport:{width:1200,height:630}, deviceScaleFactor:1.5 });
  await p1.goto('file:///tmp/og.html', { waitUntil:'networkidle' });
  await p1.waitForTimeout(1200);
  await p1.screenshot({ path:'assets/img/og-cover.jpg', type:'jpeg', quality:90, clip:{x:0,y:0,width:1200,height:630} });
  // apple-touch icon 512 from favicon.svg
  const p2 = await b.newPage({ viewport:{width:512,height:512}, deviceScaleFactor:1 });
  await p2.goto('file://' + process.cwd() + '/assets/favicon.svg', { waitUntil:'load' });
  await p2.addStyleTag({ content:'html,body{margin:0}svg{width:512px;height:512px;display:block}' });
  await p2.waitForTimeout(300);
  await p2.screenshot({ path:'assets/img/icon-512.png', type:'png', clip:{x:0,y:0,width:512,height:512} });
  await b.close(); console.log('rendered');
})();
