const $=id=>document.getElementById(id);let data={...window.DAY_CONTENT};let current=1;
const arabic=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
function unlockCount(){
  // يعتمد الفتح على توقيت القاهرة: الساعة 03:00 صباحًا.
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit',
    day: '2-digit', hour: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date());
  const get = type => parts.find(p => p.type === type).value;
  let effectiveDate = new Date(Date.UTC(+get('year'), +get('month') - 1, +get('day')));
  if (+get('hour') < 3) effectiveDate.setUTCDate(effectiveDate.getUTCDate() - 1);
  const [y, m, d] = SITE_CONFIG.startDate.split('-').map(Number);
  const start = Date.UTC(y, m - 1, d);
  const today = Date.UTC(effectiveDate.getUTCFullYear(), effectiveDate.getUTCMonth(), effectiveDate.getUTCDate());
  return Math.max(0, Math.min(SITE_CONFIG.totalDays, Math.floor((today - start) / 86400000) + 1));
}
function show(id){['home','days','letter','editor'].forEach(x=>$(x).classList.add('hidden'));$(id).classList.remove('hidden');}
function renderGrid(){const n=unlockCount();$('counter').textContent=`${arabic(n)} من ${arabic(60)} يوم`; $('dayGrid').innerHTML='';for(let i=1;i<=60;i++){let b=document.createElement('button');b.className='day'+(i>n?' locked':'');b.innerHTML=`${arabic(i)}<small>${i>n?'مقفول':'افتحي'}</small>`;b.disabled=i>n;b.onclick=()=>openDay(i);$('dayGrid').appendChild(b)}}
function openDay(i){current=i;let d=data[i]||{text:'الرسالة دي لسه بتتجهز… ارجعي لها في يومها.',style:'paper'};show('letter');$('letter').className='letter '+(d.style||'paper');$('letterContent').innerHTML='';let p=document.createElement('div');p.className='letter-text';p.textContent=d.text||'الرسالة دي لسه بتتجهز…';$('letterContent').appendChild(p);$('mediaArea').innerHTML='';if(d.image){let im=document.createElement('img');im.className='letter-image';im.src=d.image;im.alt='';$('mediaArea').appendChild(im)}if(d.audio){let a=document.createElement('audio');a.className='audio';a.controls=true;a.src=d.audio;$('mediaArea').appendChild(a)}$('prev').disabled=i===1;$('next').disabled=i>=unlockCount()}
$('enter').onclick=()=>{renderGrid();show('days')};$('back').onclick=()=>{renderGrid();show('days')};$('prev').onclick=()=>openDay(current-1);$('next').onclick=()=>openDay(current+1);
function fillEditor(){let s=$('editDay');s.innerHTML='';for(let i=1;i<=60;i++){let o=document.createElement('option');o.value=i;o.textContent='اليوم '+arabic(i);s.appendChild(o)}loadEdit()}
function loadEdit(){let d=data[+$('editDay').value]||{};$('editText').value=d.text||'';$('editImage').value=d.image||'';$('editAudio').value=d.audio||'';$('editStyle').value=d.style||'paper'}
$('editToggle').onclick=()=>{fillEditor();show('editor')};$('closeEditor').onclick=()=>show('home');$('editDay').onchange=loadEdit;
$('saveDay').onclick=()=>{let i=+$('editDay').value;data[i]={text:$('editText').value,image:$('editImage').value,audio:$('editAudio').value,style:$('editStyle').value};$('saveNotice').textContent='اتحفظ التعديل في المتصفح الحالي. نزّلي نسخة المحتوى عشان نحدّث الموقع المنشور.'};
$('export').onclick=()=>{let blob=new Blob(['window.SITE_CONFIG = '+JSON.stringify(SITE_CONFIG,null,2)+';\nwindow.DAY_CONTENT = '+JSON.stringify(data,null,2)+';'],{type:'text/javascript'});let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='content.js';a.click();URL.revokeObjectURL(a.href);$('saveNotice').textContent='تم تنزيل content.js. استبدلي به الملف القديم عند تحديث الموقع.'};
