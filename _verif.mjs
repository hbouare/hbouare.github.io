import { chromium } from 'playwright'
import { readFileSync } from 'fs'
const svg = readFileSync('public/favicon.svg','utf8')
const b = await chromium.launch()
async function shot(scheme, out){
  const p = await b.newPage({ viewport:{width:512,height:512} })
  await p.emulateMedia({ colorScheme: scheme })
  // svg on mid-gray so the ink stroke is visible whatever its colour
  await p.setContent(`<!doctype html><body style="margin:0;background:#888;width:512px;height:512px">${svg.replace('<svg','<svg width=512 height=512')}</body>`,{waitUntil:'networkidle'})
  const px = await p.evaluate(()=>{ // sample a pixel on the H's left vertical bar (viewBox x=10,y~30 → *8)
    const c=document.createElement('canvas');c.width=512;c.height=512;const ctx=c.getContext('2d')
    return new Promise(res=>{const s=new XMLSerializer().serializeToString(document.querySelector('svg'));const img=new Image();img.onload=()=>{ctx.drawImage(img,0,0,512,512);const d=ctx.getData?0:0;const p1=ctx.getImageData(80,256,1,1).data;const p2=ctx.getImageData(80,300,1,1).data;res([...p1].slice(0,3)+' | '+[...p2].slice(0,3))};img.src='data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(s)))})
  })
  console.log(`${scheme.padEnd(5)} → pixels trait (RGB): ${px}`)
  await p.close()
}
await shot('light'); await shot('dark')
await b.close()
