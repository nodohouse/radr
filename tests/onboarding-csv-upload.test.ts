import {describe,it,expect} from "vitest";
import {validateOnboardingCsv,MAX_ONBOARDING_CSV_BYTES} from "@/lib/onboarding/csvUpload";
const csv=(text:string)=>new TextEncoder().encode(text);
const contract='supplier,sku,unit,contract_rate,currency\nSupplier,oil,L,6.80,EUR';
const invoice='supplier,invoice_id,sku,quantity,unit,unit_price,currency\nSupplier,INV-1,oil,420,L,7.45,EUR';
describe("first-value CSV boundary",()=>{
 it("accepts contract and invoice evidence supported by the analyzer",()=>{
  expect(validateOnboardingCsv(csv(contract),'contract.csv','CONTRACT').rows).toBe(1);
  expect(validateOnboardingCsv(csv(invoice),'invoice.csv','INVOICE').rows).toBe(1);
 });
 it("rejects XLSX, oversized and binary data before private storage",()=>{
  expect(()=>validateOnboardingCsv(csv(contract),'book.xlsx','CONTRACT')).toThrow('CSV');
  expect(()=>validateOnboardingCsv(new Uint8Array(MAX_ONBOARDING_CSV_BYTES+1),'large.csv','CONTRACT')).toThrow('1 MB');
  expect(()=>validateOnboardingCsv(new Uint8Array([0xff,0xfe,0x00]),'bad.csv','CONTRACT')).toThrow('UTF-8');
 });
 it("requires unit and currency evidence rather than silently assuming euros or litres",()=>{
  expect(()=>validateOnboardingCsv(csv('supplier,sku,rate\nSupplier,oil,6.8'),'missing.csv','CONTRACT')).toThrow('currency and unit');
  expect(()=>validateOnboardingCsv(csv('supplier,sku,unit,contract_rate,currency\n'),'empty.csv','CONTRACT')).toThrow('No valid');
  expect(()=>validateOnboardingCsv(csv(contract.replace(',EUR',',')),'blank-currency.csv','CONTRACT')).toThrow('explicit currency');
  expect(()=>validateOnboardingCsv(csv(contract.replace(',L,',',,')),'blank-unit.csv','CONTRACT')).toThrow('explicit currency');
  expect(()=>validateOnboardingCsv(csv(contract.replace('6.80','"6,80"')),'decimal-comma.csv','CONTRACT')).toThrow('decimal points');
 });
});
