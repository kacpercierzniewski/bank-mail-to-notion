import { parse, TextNode } from 'node-html-parser';

export const getDataFromHtml = (htmlString: string) => {
 const root = parse(htmlString);

 const rgx = new RegExp('.*[Kk]wota[\ \:]')
 const stringsWithMoney = root.querySelectorAll('td.data:not([align])').map(el => el.childNodes[0].innerText).filter(el => rgx.test(el) && !el.includes('od'));

 const parsed = stringsWithMoney.map(el => {
   const parts = el.split('Kwota');
   const blikParts = el.split('dla');
   if (blikParts.length > 1) {
     return {
       id: blikParts[1].split(';')[0].slice(0, -2).trim(),
       price: blikParts[0].split('kwota')[1].trim().slice(0, -4),
     }
   }
   return {
     id: parts[0].split(':')[2].trim().slice(0,-1),
     price: parts[1].split(' ')[1]
   }
 })
 console.log(parsed);
  return parsed;
}