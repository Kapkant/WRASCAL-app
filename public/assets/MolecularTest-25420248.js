import{m as D}from"./mockData-d4cc2636.js";import{d as ee,x as p,$ as H,A as le,o as g,c as S,w as e,a as l,Q as P,P as n,aN as te,N as r,T as V,an as I,ao as j,aj as Z,aI as A,O as L,U as oe,aO as ae,S as ne}from"./index-2f6ffadd.js";import{V as f,d as v,c as x}from"./VCard-c126cb60.js";import{a as T,V as re}from"./VCol-7e1d829d.js";const se=r("h2",null,"🧪 Molecular Visualization Test",-1),de=r("p",{class:"text-subtitle-1"},"Interactive molecular structure viewer",-1),ie=r("strong",null,"Name:",-1),ue=r("strong",null,"Formula:",-1),ce=r("strong",null,"SMILES:",-1),me=r("strong",null,"Description:",-1),pe={key:1,class:"text-grey"},ge={key:1,class:"text-grey"},be=ee({__name:"MolecularTest",setup(fe){const h=p(null),t=p(null),M=p(!1),w=p(!1),$=p(!1),k=p(!1),K=H(()=>D.map(a=>({title:`${a.name} (${a.molecularFormula})`,value:a.id}))),B=H(()=>`height: 300px; background: ${ne().global.current.value.dark?"gray":"transparent"}; border: 1px solid #ccc; border-radius: 4px;`),F=a=>{const o=D.find(d=>d.id===a);o&&(t.value=o.molData,console.log("Selected molecule:",t.value)),z()},z=()=>{M.value=!1,w.value=!1;const a=document.getElementById("mol2D"),o=document.getElementById("mol3D");a&&(a.innerHTML=""),o&&(o.innerHTML="")},O=async()=>{if(!t.value){console.log("No molecule selected");return}console.log("Loading 2D molecule:",t.value),$.value=!0;try{await ae("https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js");const a=await window.initRDKitModule(),o=t.value.drawCode,d=a.get_mol(o),i=d.get_molblock(),y=d.get_svg(500,400),m=document.getElementById("mol2D");m&&(m.innerHTML=`
        <div style="padding: 20px; text-align: center;">
          <h3>${t.value.name}</h3>
          <p><strong>Formula:</strong> ${t.value.molecularFormula}</p>
          <p><strong>SMILES:</strong> ${o}</p>
          <div style="margin-top: 20px; padding: 20px; background: white; border-radius: 10px; border: 2px solid #e0e0e0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="margin-bottom: 15px; font-weight: bold; color: #333; font-size: 16px;">2D Molecular Structure</p>
            <div style="display: flex; justify-content: center; align-items: center; min-height: 300px; background: #fafafa; border-radius: 5px; padding: 20px;">
              <div style="max-width: 100%; overflow: hidden;">
                ${y}
              </div>
            </div>
          </div>
        </div>
      `,M.value=!0,console.log("2D molecule rendered successfully"))}catch(a){console.error("Error loading 2D molecule:",a);const o=document.getElementById("mol2D");o&&(o.innerHTML=`
        <div style="padding: 20px; text-align: center;">
          <h3>${t.value.name}</h3>
          <p><strong>Formula:</strong> ${t.value.molecularFormula}</p>
          <p><strong>SMILES:</strong> ${t.value.drawCode}</p>
          <div style="margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
            <p>2D Molecular Structure (Rendering failed)</p>
            <p style="font-family: monospace; font-size: 18px;">${t.value.drawCode}</p>
          </div>
        </div>
      `,M.value=!0)}finally{$.value=!1}},U=async()=>{if(!t.value){console.log("No molecule selected");return}console.log("Loading 3D molecule:",t.value),k.value=!0;try{const a=t.value.drawCode;let o="",d=6;const i=60,y=150,m=100;for(let s=0;s<6;s++){const u=s*Math.PI*2/6,b=y+Math.cos(u)*i,_=m+Math.sin(u)*i,c=Math.sin(u*3)*20;o+=`
        <div style="
          position: absolute;
          left: ${b}px;
          top: ${_}px;
          width: 20px;
          height: 20px;
          background: #4CAF50;
          border-radius: 50%;
          transform: translateZ(${c}px);
          box-shadow: 0 0 10px rgba(76, 175, 80, 0.7);
          border: 3px solid #2E7D32;
          transition: all 0.3s ease;
        " title="Carbon atom ${s+1}" onmouseover="this.style.transform='translateZ(${c}px) scale(1.2)'" onmouseout="this.style.transform='translateZ(${c}px) scale(1)'"></div>
      `}let N="";for(let s=0;s<6;s++){const u=s*Math.PI*2/6,b=(s+1)*Math.PI*2/6,_=y+Math.cos(u)*i,c=m+Math.sin(u)*i,C=y+Math.cos(b)*i,E=m+Math.sin(b)*i,X=Math.sin(u*3)*20,Y=Math.sin(b*3)*20,q=(_+C)/2,Q=(c+E)/2,G=(X+Y)/2,J=Math.sqrt((C-_)**2+(E-c)**2),W=Math.atan2(E-c,C-_)*180/Math.PI;N+=`
        <div style="
          position: absolute;
          left: ${q}px;
          top: ${Q}px;
          width: ${J}px;
          height: 4px;
          background: #666;
          transform: translateZ(${G}px) rotate(${W}deg);
          transform-origin: left center;
          border-radius: 2px;
          box-shadow: 0 0 5px rgba(0,0,0,0.3);
        "></div>
      `}const R=document.getElementById("mol3D");R&&(R.innerHTML=`
        <div style="padding: 20px; text-align: center;">
          <h3>${t.value.name} - 3D Structure</h3>
          <p><strong>Formula:</strong> ${t.value.molecularFormula}</p>
          <p><strong>SMILES:</strong> ${a}</p>
          <div style="margin-top: 20px; padding: 15px; background: linear-gradient(45deg, #e3f2fd, #bbdefb); border-radius: 10px;">
            <p style="font-weight: bold; color: #1976d2; margin-bottom: 15px;">3D Molecular Structure</p>
            <div style="position: relative; width: 300px; height: 200px; margin: 0 auto; background: white; border-radius: 5px; overflow: hidden; perspective: 600px; transform-style: preserve-3d;">
              ${N}
              ${o}
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">
              Interactive 3D benzene ring (hover over atoms to see them highlight)
            </p>
          </div>
        </div>
      `,w.value=!0,console.log("3D molecule rendered successfully"))}catch(a){console.error("Error loading 3D molecule:",a);const o=document.getElementById("mol3D");o&&(o.innerHTML=`
        <div style="padding: 20px; text-align: center;">
          <h3>${t.value.name} - 3D Structure</h3>
          <p><strong>Formula:</strong> ${t.value.molecularFormula}</p>
          <p><strong>SMILES:</strong> ${t.value.drawCode}</p>
          <div style="margin-top: 20px; padding: 15px; background: linear-gradient(45deg, #e3f2fd, #bbdefb); border-radius: 10px;">
            <p style="font-weight: bold; color: #1976d2;">3D Molecular Structure (Rendering failed)</p>
            <p style="font-family: monospace; font-size: 20px; color: #0d47a1;">${t.value.drawCode}</p>
          </div>
        </div>
      `,w.value=!0)}finally{k.value=!1}};return le(()=>{D.length>0&&(h.value=D[0].id,F(D[0].id))}),(a,o)=>(g(),S(re,{class:"fill-height"},{default:e(()=>[l(oe,{class:"d-flex text-center fill-height"},{default:e(()=>[l(f,{class:"mx-auto",variant:"outlined","max-width":"1200"},{default:e(()=>[l(v,null,{default:e(()=>[se,de]),_:1}),l(x,null,{default:e(()=>[l(P,null,{default:e(()=>[l(T,{cols:"12",md:"6"},{default:e(()=>[l(f,{variant:"outlined",class:"mb-4"},{default:e(()=>[l(v,null,{default:e(()=>[n("Select a Molecule")]),_:1}),l(x,null,{default:e(()=>[l(te,{modelValue:h.value,"onUpdate:modelValue":[o[0]||(o[0]=d=>h.value=d),F],items:K.value,label:"Choose a molecule to visualize"},null,8,["modelValue","items"])]),_:1})]),_:1}),l(f,{variant:"outlined",class:"mb-4"},{default:e(()=>[l(v,null,{default:e(()=>[n("Molecule Information")]),_:1}),t.value?(g(),S(x,{key:0},{default:e(()=>[r("p",null,[ie,n(" "+V(t.value.name),1)]),r("p",null,[ue,n(" "+V(t.value.molecularFormula),1)]),r("p",null,[ce,n(" "+V(t.value.drawCode),1)]),r("p",null,[me,n(" "+V(t.value.description),1)])]),_:1})):I("",!0)]),_:1})]),_:1}),l(T,{cols:"12",md:"6"},{default:e(()=>[l(f,{variant:"outlined",class:"mb-4"},{default:e(()=>[l(v,null,{default:e(()=>[n("2D Molecular Structure")]),_:1}),l(x,null,{default:e(()=>[r("div",{id:"mol2D",style:A(B.value),class:"d-flex align-center justify-center"},[$.value?(g(),S(j,{key:0,indeterminate:"",color:"primary"})):M.value?I("",!0):(g(),Z("span",pe," Select a molecule to view 2D structure "))],4)]),_:1})]),_:1}),l(f,{variant:"outlined"},{default:e(()=>[l(v,null,{default:e(()=>[n("3D Molecular Structure")]),_:1}),l(x,null,{default:e(()=>[r("div",{id:"mol3D",style:A(B.value),class:"d-flex align-center justify-center"},[k.value?(g(),S(j,{key:0,indeterminate:"",color:"primary"})):w.value?I("",!0):(g(),Z("span",ge," Select a molecule to view 3D structure "))],4)]),_:1})]),_:1})]),_:1})]),_:1}),l(P,{class:"mt-4"},{default:e(()=>[l(T,{cols:"12"},{default:e(()=>[l(f,{variant:"outlined"},{default:e(()=>[l(v,null,{default:e(()=>[n("Controls")]),_:1}),l(x,null,{default:e(()=>[l(L,{onClick:O,disabled:!h.value||$.value,class:"mr-2"},{default:e(()=>[n(" Load 2D View ")]),_:1},8,["disabled"]),l(L,{onClick:U,disabled:!h.value||k.value,class:"mr-2"},{default:e(()=>[n(" Load 3D View ")]),_:1},8,["disabled"]),l(L,{onClick:z,color:"error",variant:"outlined"},{default:e(()=>[n(" Clear Views ")]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1}))}});export{be as default};
