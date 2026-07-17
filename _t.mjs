import puppeteer from 'puppeteer-core';
const EDGE='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const SD=process.argv[2];
const b=await puppeteer.launch({executablePath:EDGE,headless:'new',args:['--no-sandbox']});
const p=await b.newPage();
await p.setViewport({width:1600,height:1000,deviceScaleFactor:1}); // wide screen to test alignment
await p.goto('http://localhost:4321/our-team',{waitUntil:'networkidle0'});
await new Promise(r=>setTimeout(r,900));
// measure nav logo left vs founder card left
const m=await p.evaluate(()=>{
  const logo=document.querySelector('header img'); const card=[...document.querySelectorAll('section')].find(s=>s.textContent.includes('Founder & Clinical Director'));
  return { navLogoLeft: Math.round(logo.getBoundingClientRect().left), cardLeft: card?Math.round(card.getBoundingClientRect().left):null };
});
console.log('alignment @1600px:', JSON.stringify(m));
await p.screenshot({path:`${SD}/team-align.png`});
// form section
const f=await p.evaluateHandle(()=>{const h=[...document.querySelectorAll('h2')].find(n=>n.textContent.includes("We'll match you"));return h?h.closest('section'):null;});
await f.asElement().scrollIntoView(); await new Promise(r=>setTimeout(r,400));
await f.asElement().screenshot({path:`${SD}/team-form.png`});
await b.close();console.log('ok');
