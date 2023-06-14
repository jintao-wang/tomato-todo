(()=>{"use strict";const e=Symbol("Comlink.proxy"),t=Symbol("Comlink.endpoint"),n=Symbol("Comlink.releaseProxy"),r=Symbol("Comlink.thrown"),a=e=>"object"==typeof e&&null!==e||"function"==typeof e,s=new Map([["proxy",{canHandle:t=>a(t)&&t[e],serialize(e){const{port1:t,port2:n}=new MessageChannel;return o(e,t),[n,[n]]},deserialize:e=>(e.start(),c(e))}],["throw",{canHandle:e=>a(e)&&r in e,serialize({value:e}){let t;return t=e instanceof Error?{isError:!0,value:{message:e.message,name:e.name,stack:e.stack}}:{isError:!1,value:e},[t,[]]},deserialize(e){if(e.isError)throw Object.assign(new Error(e.value.message),e.value);throw e.value}}]]);function o(e,t=self){t.addEventListener("message",(function n(a){if(!a||!a.data)return;const{id:s,type:c,path:u}=Object.assign({path:[]},a.data),l=(a.data.argumentList||[]).map(h);let p;try{const t=u.slice(0,-1).reduce(((e,t)=>e[t]),e),n=u.reduce(((e,t)=>e[t]),e);switch(c){case"GET":p=n;break;case"SET":t[u.slice(-1)[0]]=h(a.data.value),p=!0;break;case"APPLY":p=n.apply(t,l);break;case"CONSTRUCT":p=d(new n(...l));break;case"ENDPOINT":{const{port1:t,port2:n}=new MessageChannel;o(e,n),p=function(e,t){return m.set(e,t),e}(t,[t])}break;case"RELEASE":p=void 0;break;default:return}}catch(e){p={value:e,[r]:0}}Promise.resolve(p).catch((e=>({value:e,[r]:0}))).then((e=>{const[r,a]=f(e);t.postMessage(Object.assign(Object.assign({},r),{id:s}),a),"RELEASE"===c&&(t.removeEventListener("message",n),i(t))}))})),t.start&&t.start()}function i(e){(function(e){return"MessagePort"===e.constructor.name})(e)&&e.close()}function c(e,t){return l(e,[],t)}function u(e){if(e)throw new Error("Proxy has been released and is not useable")}function l(e,r=[],a=function(){}){let s=!1;const o=new Proxy(a,{get(t,a){if(u(s),a===n)return()=>g(e,{type:"RELEASE",path:r.map((e=>e.toString()))}).then((()=>{i(e),s=!0}));if("then"===a){if(0===r.length)return{then:()=>o};const t=g(e,{type:"GET",path:r.map((e=>e.toString()))}).then(h);return t.then.bind(t)}return l(e,[...r,a])},set(t,n,a){u(s);const[o,i]=f(a);return g(e,{type:"SET",path:[...r,n].map((e=>e.toString())),value:o},i).then(h)},apply(n,a,o){u(s);const i=r[r.length-1];if(i===t)return g(e,{type:"ENDPOINT"}).then(h);if("bind"===i)return l(e,r.slice(0,-1));const[c,m]=p(o);return g(e,{type:"APPLY",path:r.map((e=>e.toString())),argumentList:c},m).then(h)},construct(t,n){u(s);const[a,o]=p(n);return g(e,{type:"CONSTRUCT",path:r.map((e=>e.toString())),argumentList:a},o).then(h)}});return o}function p(e){const t=e.map(f);return[t.map((e=>e[0])),(n=t.map((e=>e[1])),Array.prototype.concat.apply([],n))];var n}const m=new WeakMap;function d(t){return Object.assign(t,{[e]:!0})}function f(e){for(const[t,n]of s)if(n.canHandle(e)){const[r,a]=n.serialize(e);return[{type:"HANDLER",name:t,value:r},a]}return[{type:"RAW",value:e},m.get(e)||[]]}function h(e){switch(e.type){case"HANDLER":return s.get(e.name).deserialize(e.value);case"RAW":return e.value}}function g(e,t,n){return new Promise((r=>{const a=new Array(4).fill(0).map((()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16))).join("-");e.addEventListener("message",(function t(n){n.data&&n.data.id&&n.data.id===a&&(e.removeEventListener("message",t),r(n.data))})),e.start&&e.start(),e.postMessage(Object.assign({id:a},t),n)}))}const{setIntervalRemote:E,clearIntervalRemote:v}=c(new Worker("interval.worker.js"));window.workerApi={setIntervalInWorker:(e,t)=>E(d(e),t),clearIntervalInWorker:v}})();