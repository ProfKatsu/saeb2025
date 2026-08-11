let all=[], filtered=[], chart;
const $=id=>document.getElementById(id);
const labels={"9_ano":"9º ano","3_em":"3ª série EM"};
const state=JSON.parse(localStorage.getItem('saebFilters')||'{}');
for(const id of ['search','stage']) if(state[id]) $(id).value=state[id];
const avg=(d,k)=>d.reduce((s,x)=>s+x[k],0)/d.length;
function save(){localStorage.setItem('saebFilters',JSON.stringify(Object.fromEntries(['search','stage'].map(id=>[id,$(id).value]))));}
function render(){const selected=$('search').value; filtered=all.filter(x=>(!selected||String(x.id)===selected)&&($('stage').value==='todos'||x.etapa===$('stage').value)).sort((a,b)=>a.nome.localeCompare(b.nome));save(); $('total').textContent=filtered.length; $('lp').textContent=filtered.length?avg(filtered,'media_lp').toFixed(1):'—';$('mat').textContent=filtered.length?avg(filtered,'media_mat').toFixed(1):'—';const best=filtered[0];$('insight').textContent=best?`O recorte apresenta ${filtered.length} registro(s). A média de Matemática está ${(avg(filtered,'media_mat')-avg(filtered,'media_lp')).toFixed(1)} ponto(s) em relação à de Língua Portuguesa.`:'Nenhum registro atende aos filtros.'; $('rows').innerHTML=filtered.map(x=>`<tr><td class="font-medium">${x.nome}<small class="block text-slate-500">${x.municipio}</small></td><td>${labels[x.etapa]}</td><td>${x.media_lp.toFixed(2)}</td><td>${x.media_mat.toFixed(2)}</td><td>${x.inse}</td><td><button data-id="${x.id}" class="use text-indigo-600 font-semibold">Simular</button></td></tr>`).join(''); draw();}
function draw(){const hasSchool=Boolean($('search').value), record=filtered[0], label=hasSchool?`${record.nome.replace(/ \([^)]*\)$/,'')} — ${labels[record.etapa]}`:'Média do recorte';const lp=hasSchool?record.media_lp:avg(filtered,'media_lp'),mat=hasSchool?record.media_mat:avg(filtered,'media_mat');if(chart)chart.destroy();chart=new Chart($('ranking'),{type:'bar',data:{labels:[label],datasets:[{label:'Língua Portuguesa',data:[lp],backgroundColor:'#4f46e5',borderRadius:8,maxBarThickness:110},{label:'Matemática',data:[mat],backgroundColor:'#0ea5e9',borderRadius:8,maxBarThickness:110}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{min:0,max:400,ticks:{stepSize:50}}},plugins:{legend:{position:'bottom'}}}})}
function school(){return all.find(x=>x.id===+$('school').value)}
function rates(){const x=school(), years=x?.etapa==='3_em'?['1ª série','2ª série','3ª série']:['6º ano','7º ano','8º ano','9º ano'];$('rates').innerHTML=years.map(year=>`<label>${year}<input class="rate input" type="number" min="0" max="100" step=".1" value="0"></label>`).join('')}
function sim(){const x=school();if(!x)return;const lim=x.etapa==='9_ano'?{lp:[100,400],mat:[100,400]}:{lp:[117,451],mat:[111,467]};const nlp=Math.max(0,Math.min(10,(x.media_lp-lim.lp[0])/(lim.lp[1]-lim.lp[0])*10)),nmat=Math.max(0,Math.min(10,(x.media_mat-lim.mat[0])/(lim.mat[1]-lim.mat[0])*10));$('scores').textContent=`${labels[x.etapa]} · Proficiências: LP ${x.media_lp.toFixed(2)} · MAT ${x.media_mat.toFixed(2)}. Nota padronizada N: ${((nlp+nmat)/2).toFixed(2)}.`;return (nlp+nmat)/2}
async function init(){all=await fetch('./dados/escolas.json').then(r=>r.json());const options=[...all].sort((a,b)=>a.nome.localeCompare(b.nome)||a.etapa.localeCompare(b.etapa)).map(x=>`<option value="${x.id}">${x.nome.replace(/ \([^)]*\)$/,'')} — ${labels[x.etapa]}</option>`).join('');$('search').innerHTML+=options;$('school').innerHTML='<option value="">Selecione uma escola e etapa</option>'+options;rates();render();}
function resetSimulator(){$('school').value='';rates();$('scores').textContent='Selecione uma escola e etapa para visualizar as proficiências.';$('ideb').textContent=''}
['search','stage'].forEach(id=>$(id).addEventListener('change',render));$('school').addEventListener('change',()=>{rates();sim()});$('rows').addEventListener('click',e=>{if(e.target.classList.contains('use')){$('school').value=e.target.dataset.id;rates();sim();$('simulator-modal').classList.remove('hidden')}});$('calculate').addEventListener('click',()=>{const n=sim();if(n===undefined)return;const p=[...document.querySelectorAll('.rate')].reduce((s,x)=>s+(+x.value||0),0)/document.querySelectorAll('.rate').length/100;$('ideb').textContent=`IDEB simulado: ${(n*p).toFixed(2)}`;});$('open-simulator').onclick=()=>$('notice-modal').classList.remove('hidden');$('acknowledge').onclick=()=>{$('notice-modal').classList.add('hidden');resetSimulator();$('simulator-modal').classList.remove('hidden')};$('close-simulator').onclick=()=>$('simulator-modal').classList.add('hidden');$('print').onclick=()=>print();

// --- Lógica do Modal de Fórmulas (Nota Técnica Inep) ---
$('link-formulas').addEventListener('click', (e) => {
    e.preventDefault();
    $('modal-formulas').classList.remove('hidden');
});

const fecharModalFormulas = () => {
    $('modal-formulas').classList.add('hidden');
};

$('close-formulas').addEventListener('click', fecharModalFormulas);
$('back-to-simulator').addEventListener('click', fecharModalFormulas);
// --------------------------------------------------------

init();
