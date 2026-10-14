/**
 * Validate customer-assigned Command Center destination before release.
 * Pure gate: does not create domains, DNS, credentials or deployment.
 */
const forbidden=new Set(["thelaunchera.com","www.thelaunchera.com","command.thelaunchera.com"]);
const str=x=>typeof x==="string"?x.trim():"";
export function validateCustomerCommandCenterDestination({tenant_id,assigned_tenant_id,url,approved_origin}={}){
 if(!str(tenant_id)||!str(assigned_tenant_id)||tenant_id!==assigned_tenant_id)return {ok:false,reason:"tenant_mismatch"};
 let dest,origin;
 try{dest=new URL(url);origin=new URL(approved_origin)}catch{return {ok:false,reason:"invalid_destination"}}
 if(dest.protocol!=="https:"||origin.protocol!=="https:"||dest.origin!==origin.origin||
 dest.username||dest.password||dest.hash||dest.search||origin.pathname!=="/"||origin.search||origin.hash)
  return {ok:false,reason:"unapproved_destination"};
 const hostname=dest.hostname.toLowerCase();
 if(forbidden.has(hostname)||hostname==="localhost"||hostname.endsWith(".localhost")||hostname==="127.0.0.1")
  return {ok:false,reason:"owner_or_marketing_destination"};
 if(!hostname.includes(".")||dest.port)return {ok:false,reason:"invalid_host"};
 return {ok:true,tenant_id,destination:dest.href,approved_origin:origin.origin,notice:"Validation only; no DNS, auth, publishing or customer access performed."};
}
