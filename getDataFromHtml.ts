import { parse } from 'node-html-parser';
import { IParsedBankEntry } from './interfaces';

export const getDataFromHtml = (htmlString: string, filename:string) => {
 const root = parse(htmlString);
 const dateRegex = new RegExp('[0-9]{4}-[0-9]{2}-[0-9]{2}')
 const dateFromFileName = dateRegex.exec(filename)[0].replaceAll('-','/')
 console.log(dateFromFileName)

 const rgx = new RegExp('.*[Kk]wota[\ \:]')

 const stringsWithMoney = root.querySelectorAll('td.data').filter(el =>el.attributes['align'] !== 'center').map((el) => ({text: el.childNodes[0].innerText, time: el.previousElementSibling.childNodes[1].innerText})).filter(el => rgx.test(el.text) && !el.text.includes('od'));
// console.log(stringsWithMoney);


 const parsed:IParsedBankEntry[] = stringsWithMoney.map(el => {
   const parts = el.text.split('Kwota');
   const blikParts = el.text.split('dla');
  
   const date = new Date(`${dateFromFileName} ${el.time}`)
   date.setHours(date.getHours() - date.getTimezoneOffset()/60)
   const dateIso =  date.toISOString();

   if (blikParts.length > 1) {
     return {
       id: blikParts[1].split(';')[0].slice(0, -2).trim(),
       price: blikParts[0].split('kwota')[1].trim().slice(0, -4).replace(',','.'),
       date:dateIso
     }
   }
   return {
     id: parts[0].split(':')[2].trim().slice(0,-1),
     price: parts[1].split(' ')[1].replace(',','.'),
     date:dateIso
   }
 })
  return parsed;
}