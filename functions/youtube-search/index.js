"use strict";var a=Object.defineProperty;var i=Object.getOwnPropertyDescriptor;var c=Object.getOwnPropertyNames;var u=Object.prototype.hasOwnProperty;var m=(r,e)=>{for(var s in e)a(r,s,{get:e[s],enumerable:!0})},y=(r,e,s,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of c(e))!u.call(r,t)&&t!==s&&a(r,t,{get:()=>e[t],enumerable:!(n=i(e,t))||n.enumerable});return r};var g=r=>y(a({},"__esModule",{value:!0}),r);var l={};m(l,{handler:()=>o});module.exports=g(l);var o=async r=>{let e=new URL("https://www.youtube.com/results"),{queryStringParameters:s={}}=r;for(let t in s)e.searchParams.set(t,s[t]);return(await fetch(e)).text()};require.main===module&&(async()=>console.log(await o({queryStringParameters:{search_query:"\uC544\uC774\uC720 \uBC24\uD3B8\uC9C0"}})))();0&&(module.exports={handler});
